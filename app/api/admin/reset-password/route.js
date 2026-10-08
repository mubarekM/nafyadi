import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request) {
  // 1. Who is asking? Check the logged-in user from the cookies
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

  // 2. Only the admin may use this
  const { data: me } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .single();
  if (me?.role !== "admin") {
    return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  }

  // 3. Check the request
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }
  const { studentId, password } = body || {};
  if (!studentId || typeof password !== "string" || password.length < 6) {
    return NextResponse.json(
      { error: "The password must be at least 6 characters." },
      { status: 400 },
    );
  }

  // 4. Use the secret key (only here on the server) to change the password
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  // Safety: only students can be changed, never an admin account
  const { data: target } = await admin
    .from("profiles")
    .select("role")
    .eq("id", studentId)
    .single();
  if (target?.role !== "student") {
    return NextResponse.json({ error: "Student not found." }, { status: 400 });
  }

  const { error } = await admin.auth.admin.updateUserById(studentId, {
    password,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
