"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { usePrefs } from "@/lib/prefs";
import AuthShell from "@/components/AuthShell";

export default function Login() {
  const router = useRouter();
  const { t } = usePrefs();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Already logged in? Go straight to the student page.
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
          .select("role, status")
          .eq("id", user.id)
          .maybeSingle();
        if (alive && p?.role === "student" && p?.status === "approved") {
          router.replace("/student");
        }
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
      setError("errWrong");
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("status, role")
      .eq("id", data.user.id)
      .single();

    if (profile?.role === "admin") {
      await supabase.auth.signOut({ scope: "local" });
      setError("errAdmin");
      setLoading(false);
      return;
    }
    if (profile?.status === "pending") {
      await supabase.auth.signOut({ scope: "local" });
      setError("errPending");
      setLoading(false);
      return;
    }
    if (profile?.status === "rejected") {
      await supabase.auth.signOut({ scope: "local" });
      setError("errRejected");
      setLoading(false);
      return;
    }

    router.push("/student");
  }

  return (
    <AuthShell>
      <h1 className="text-4xl font-extrabold">{t("loginTitle")}</h1>
      <p className="mu mt-2 font-semibold">{t("loginSub")}</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label className="lbl">{t("email")}</label>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="field"
          />
        </div>
        <div>
          <label className="lbl">{t("password")}</label>
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="field"
          />
        </div>

        {error && <p className="err">{t(error)}</p>}

        <button type="submit" disabled={loading} className="btn w-full">
          {loading ? t("wait") : t("loginBtn")}
        </button>
      </form>

      <p className="mu mt-8 text-center text-sm font-bold">
        {t("newHere")}{" "}
        <Link href="/signup" className="pr font-extrabold underline">
          {t("createAcc")}
        </Link>
      </p>
    </AuthShell>
  );
}
