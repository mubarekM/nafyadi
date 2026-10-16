import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";
import { sameOrigin, clientIp } from "@/lib/guard";

export const maxDuration = 15;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^[+\d][\d\s\-().]{4,39}$/;

export async function POST(request) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  }

  let b;
  try {
    b = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  // Hidden trap field: real people never fill it
  if (b.website) return NextResponse.json({ ok: true });

  const full_name = String(b.full_name || "").trim();
  const email = String(b.email || "").trim();
  const phone = String(b.phone || "").trim();

  if (full_name.length < 2 || full_name.length > 100) {
    return NextResponse.json(
      { error: "Please check the name." },
      { status: 400 },
    );
  }
  if (email.length > 200 || !EMAIL.test(email)) {
    return NextResponse.json(
      { error: "Please check the email." },
      { status: 400 },
    );
  }
  if (!PHONE.test(phone) || phone.replace(/\D/g, "").length < 7) {
    return NextResponse.json(
      { error: "Please check the phone number." },
      { status: 400 },
    );
  }
  if (b.consent !== true) {
    return NextResponse.json(
      { error: "Please accept the terms." },
      { status: 400 },
    );
  }

  const ip = clientIp(request);

  // Bot check (only when both keys are set)
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (secret && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) {
    let ok = false;
    try {
      const r = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            secret,
            response: String(b.token || ""),
            remoteip: ip,
          }),
        },
      );
      const j = await r.json().catch(() => null);
      ok = !!j?.success;
    } catch {}
    if (!ok) return NextResponse.json({ error: "captcha" }, { status: 400 });
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  // We keep only a scrambled version of the internet address, never the address itself
  const ip_hash = createHash("sha256")
    .update(ip + ":" + (process.env.SUPABASE_SECRET_KEY || "").slice(-12))
    .digest("hex")
    .slice(0, 32);

  const { count } = await admin
    .from("enrollments")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ip_hash)
    .gte("created_at", new Date(Date.now() - 3600 * 1000).toISOString());
  if ((count || 0) >= 8) {
    return NextResponse.json({ error: "limit" }, { status: 429 });
  }

  const { error } = await admin.from("enrollments").insert({
    full_name,
    email,
    phone,
    consent_at: new Date().toISOString(),
    ip_hash,
  });
  if (error) {
    const limited = /too many/i.test(error.message || "");
    return NextResponse.json(
      { error: limited ? "limit" : "failed" },
      { status: limited ? 429 : 500 },
    );
  }
  return NextResponse.json({ ok: true });
}
