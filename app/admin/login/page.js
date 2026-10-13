"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Controls from "@/components/Controls";

export default function AdminLogin() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Already logged in as the teacher? Go straight to the dashboard.
  useEffect(() => {
    let alive = true;
    async function check() {
      try {
        const supabase = createClient();
        const { data } = await supabase.auth.getSession();
        const user = data?.session?.user;
        if (!user || !alive) return;
        const { data: p } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();
        if (alive && p?.role === "admin") router.replace("/admin/dashboard");
      } catch {}
    }
    check();
    return () => {
      alive = false;
    };
  }, [router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const supabase = createClient();

    const { data, error: signInError } = await supabase.auth.signInWithPassword(
      {
        email: form.get("email"),
        password: form.get("password"),
      },
    );
    if (signInError) {
      setError("Wrong email or password.");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();
    if (profile?.role !== "admin") {
      await supabase.auth.signOut({ scope: "local" });
      setError("This account is not allowed here.");
      setLoading(false);
      return;
    }

    router.push("/admin/dashboard");
  }

  return (
    <main className="tx relative grid min-h-dvh place-items-center px-4 py-10">
      <div className="absolute right-4 top-4">
        <Controls showLang={false} />
      </div>
      <div className="cd up w-full max-w-md p-8">
        <p className="ac text-xs font-extrabold uppercase tracking-widest">
          Teacher area
        </p>
        <h1 className="mt-2 text-3xl font-extrabold">Admin Login</h1>
        <p className="mu mt-1 font-semibold">Authorized access only.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="lbl">Admin email</label>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="field"
            />
          </div>
          <div>
            <label className="lbl">Password</label>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="field"
            />
          </div>
          {error && <p className="err">{error}</p>}
          <button type="submit" disabled={loading} className="btn w-full">
            {loading ? "Please wait..." : "Sign in"}
          </button>
        </form>

        <Link
          href="/"
          className="pr mt-6 block text-center text-sm font-extrabold hover:underline"
        >
          ← Back to website
        </Link>
      </div>
    </main>
  );
}
