import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { BANKS, PLANS } from "@/lib/pay-config";
import { sameOrigin } from "@/lib/guard";

export const maxDuration = 30;

const MAX_AGE_DAYS = 45;

export async function POST(request) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  }

  // 1. Who is calling?
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    },
  );
  const { data: userData } = await supabase.auth.getUser();
  if (!userData?.user) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  const { paymentId, force } = body || {};
  if (!paymentId) {
    return NextResponse.json({ error: "Missing payment." }, { status: 400 });
  }

  // 2. Server-only database access
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const { data: me } = await admin
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .single();
  const isAdmin = me?.role === "admin";

  const { data: pay } = await admin
    .from("payments")
    .select("*")
    .eq("id", paymentId)
    .single();
  if (!pay)
    return NextResponse.json({ error: "Payment not found." }, { status: 404 });
  if (!isAdmin && pay.student_id !== userData.user.id) {
    return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  }

  // Only payments that are still waiting get checked
  if (pay.status === "approved") {
    return NextResponse.json({ status: "approved", auto: pay.auto_status });
  }
  if (pay.status !== "pending") {
    return NextResponse.json({ status: pay.status, auto: pay.auto_status });
  }
  // A student gets one automatic check per payment
  if (!isAdmin && pay.auto_checked_at) {
    return NextResponse.json({ status: pay.status, auto: pay.auto_status });
  }

  async function save(fields) {
    await admin
      .from("payments")
      .update({ ...fields, auto_checked_at: new Date().toISOString() })
      .eq("id", pay.id);
  }
  const finish = (status, auto) => NextResponse.json({ status, auto });

  // 3. The price comes from OUR config, never from what the browser sent
  const plan = PLANS.find((p) => p.plan === pay.plan);
  const required = plan ? Number(plan.amount) : null;
  if (!required) {
    await save({
      auto_status: "unavailable",
      auto_note: "Unknown plan. Please check manually.",
    });
    return finish("pending", "unavailable");
  }
  if (Number(pay.amount) !== required) {
    await admin.from("payments").update({ amount: required }).eq("id", pay.id);
  }

  // 4. Can we check this one automatically?
  const bank = BANKS.find((b) => b.name === pay.bank);
  if (!bank || !bank.code) {
    await save({
      auto_status: "unavailable",
      auto_note:
        "This bank cannot be checked automatically. Please check the screenshot.",
    });
    return finish("pending", "unavailable");
  }
  if (!pay.reference) {
    await save({
      auto_status: "unavailable",
      auto_note: "No transaction number was given.",
    });
    return finish("pending", "unavailable");
  }
  if (!process.env.VERIFY_ET_API_KEY) {
    await save({
      auto_status: "unavailable",
      auto_note: "Automatic checking is not set up yet.",
    });
    return finish("pending", "unavailable");
  }

  // 5. Ask Verify.ET to check the receipt
  let res;
  let json = null;
  try {
    res = await fetch("https://verify.et/api/verify?waitMs=12000", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.VERIFY_ET_API_KEY,
        "Idempotency-Key": force
          ? `pay-${pay.id}-${Date.now()}`
          : `pay-${pay.id}`,
      },
      body: JSON.stringify({
        bank: bank.code,
        reference: String(pay.reference).trim(),
        settlementAccount: bank.number,
      }),
      cache: "no-store",
    });
    json = await res.json().catch(() => null);
  } catch {
    await save({
      auto_status: "unavailable",
      auto_note:
        "Could not reach the verification service. Please check manually.",
    });
    return finish("pending", "unavailable");
  }

  if (res.status === 402) {
    await save({
      auto_status: "unavailable",
      auto_note: "Automatic checking is out of credits. Please check manually.",
    });
    return finish("pending", "unavailable");
  }
  if (res.status === 401 || res.status === 403) {
    await save({
      auto_status: "unavailable",
      auto_note: "The verification key was refused. Check VERIFY_ET_API_KEY.",
    });
    return finish("pending", "unavailable");
  }
  if (res.status === 202 || !json) {
    await save({
      auto_status: "unavailable",
      auto_note: "The check was still running. Use Re-check in a minute.",
    });
    return finish("pending", "unavailable");
  }

  const item = Array.isArray(json.data) ? json.data[0] : null;
  if (!item || item.verified !== true) {
    const why =
      (item && (item.error || item.message)) ||
      json.message ||
      "Receipt not found.";
    await save({
      auto_status: "not_found",
      auto_note: String(why).slice(0, 300),
    });
    return finish("pending", "not_found");
  }

  // 6. The receipt is real. Is it the RIGHT payment?
  const amount = Number(item.amount);
  const problems = [];
  if (!(amount >= required)) {
    problems.push(
      `Receipt amount ${item.amount} is lower than the price ${required}.`,
    );
  }
  if (item.currency && String(item.currency).toUpperCase() !== "ETB") {
    problems.push(`Currency is ${item.currency}, not ETB.`);
  }
  if (
    !item.settlementAccountMatch ||
    item.settlementAccountMatch.matched !== true
  ) {
    problems.push("The receiver account does not match your account.");
  }
  if (item.timestamp) {
    const ageDays =
      (Date.now() - new Date(item.timestamp).getTime()) / 86400000;
    if (ageDays > MAX_AGE_DAYS || ageDays < -1)
      problems.push("The receipt date is not recent.");
  }

  if (problems.length > 0) {
    await save({
      auto_status: "mismatch",
      auto_note: problems.join(" "),
      verified_amount: Number.isFinite(amount) ? amount : null,
    });
    return finish("pending", "mismatch");
  }

  // 7. Everything matches: approve
  const now = new Date().toISOString();
  await admin
    .from("payments")
    .update({
      status: "approved",
      auto_status: "verified",
      auto_note: `Verified automatically: ${item.amount} ${item.currency || "ETB"} from ${
        item.senderName || "unknown sender"
      }.`,
      verified_amount: amount,
      auto_checked_at: now,
      reviewed_at: now,
    })
    .eq("id", pay.id);

  return finish("approved", "verified");
}
