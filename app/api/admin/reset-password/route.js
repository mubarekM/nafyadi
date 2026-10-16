import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { sameOrigin } from "@/lib/guard";

export async function POST(request) {
  if (!sameOrigin(request)) {
    return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  }

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

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  // 2. Only the admin may use this
  const { data: me } = await admin
    .from("profiles")
    .select("role, full_name")
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
  if (
    !studentId ||
    typeof password !== "string" ||
    password.length < 8 ||
    password.length > 72
  ) {
    return NextResponse.json(
      { error: "The password must be 8 to 72 characters." },
      { status: 400 },
    );
  }

  // Only students can be changed, never an admin account
  const { data: target } = await admin
    .from("profiles")
    .select("role, full_name")
    .eq("id", studentId)
    .single();
  if (target?.role !== "student") {
    return NextResponse.json({ error: "Student not found." }, { status: 400 });
  }

  // 4. Change the password
  const { error } = await admin.auth.admin.updateUserById(studentId, {
    password,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // 5. Write it in the activity log (never the password itself)
  await admin.from("audit_log").insert({
    actor: userData.user.id,
    actor_name: me.full_name,
    action: "password_reset",
    target: studentId,
    target_name: target.full_name,
    detail: {},
  });

  return NextResponse.json({ ok: true });
}
