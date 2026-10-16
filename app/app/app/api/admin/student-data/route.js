import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { sameOrigin } from "@/lib/guard";

export const maxDuration = 30;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  }

  // 1. Only the logged-in teacher may use this
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
    return NextResponse.json(
      { error: "You are not logged in." },
      { status: 401 },
    );
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const { data: me } = await admin
    .from("profiles")
    .select("role, full_name")
    .eq("id", userData.user.id)
    .single();
  if (me?.role !== "admin") {
    return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  }

  // 2. Check the request
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  const { action, studentId, confirmName } = body || {};
  if (
    !UUID.test(String(studentId || "")) ||
    !["export", "delete"].includes(action)
  ) {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  const { data: profile } = await admin
    .from("profiles")
    .select("*")
    .eq("id", studentId)
    .single();
  if (!profile || profile.role !== "student") {
    return NextResponse.json({ error: "Student not found." }, { status: 404 });
  }

  const log = (act) =>
    admin.from("audit_log").insert({
      actor: userData.user.id,
      actor_name: me.full_name,
      action: act,
      target: studentId,
      target_name: profile.full_name,
      detail: {},
    });

  // 3a. Download everything we keep about one student
  if (action === "export") {
    const get = async (table, column) => {
      const { data } = await admin
        .from(table)
        .select("*")
        .eq(column, studentId);
      return data || [];
    };
    const { data: auth } = await admin.auth.admin.getUserById(studentId);

    await log("data_exported");
    return NextResponse.json({
      exported_at: new Date().toISOString(),
      account: {
        email: auth?.user?.email || null,
        created_at: auth?.user?.created_at || null,
        last_sign_in_at: auth?.user?.last_sign_in_at || null,
      },
      profile,
      payments: await get("payments", "student_id"),
      quiz_submissions: await get("quiz_submissions", "student_id"),
      attendance: await get("attendance", "student_id"),
      lesson_views: await get("lesson_views", "student_id"),
      lesson_checks: await get("lesson_checks", "student_id"),
      certificates: await get("certificates", "student_id"),
      messages: await get("messages", "user_id"),
    });
  }

  // 3b. Delete the account and everything linked to it
  const typed = String(confirmName || "")
    .trim()
    .toLowerCase();
  if (
    !typed ||
    typed !==
      String(profile.full_name || "")
        .trim()
        .toLowerCase()
  ) {
    return NextResponse.json(
      { error: "The name you typed does not match." },
      { status: 400 },
    );
  }

  // Record it first (the log keeps the name, not the data)
  await log("account_deleted");

  // Receipts are stored in files, so remove them first
  const { data: files } = await admin.storage
    .from("payment-proofs")
    .list(studentId, { limit: 1000 });
  if (files && files.length > 0) {
    await admin.storage
      .from("payment-proofs")
      .remove(files.map((f) => `${studentId}/${f.name}`));
  }

  // Deleting the login removes the profile, payments, answers, attendance and messages
  const { error } = await admin.auth.admin.deleteUser(studentId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
