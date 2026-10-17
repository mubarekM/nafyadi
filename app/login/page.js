"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { usePrefs } from "@/lib/prefs";
import AuthShell from "@/components/AuthShell";
import Icon from "@/components/Icon";
import Captcha, { captchaOn } from "@/components/Captcha";

// Where does this account belong? Decided by the account itself, never by a button.
function homeFor(p) {
  if (p?.role === "admin") return "/admin/dashboard";
  if (p?.role === "student" && p?.status === "approved") return "/student";
  return null;
}

export default function Login() {
  const router = useRouter();
  const { t } = usePrefs();
  const [who, setWho] = useState("student"); // student | teacher (only says where you want to go)
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [token, setToken] = useState("");
  const [reset, setReset] = useState(0);

  // The teacher tab can be opened with /login?as=teacher
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("as") === "teacher")
      setWho("teacher");
  }, []);

  // Already logged in? Go straight to your own dashboard.
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
        const dest = homeFor(p);
        if (alive && dest) router.replace(dest);
      } catch {}
    }
    check();
    return () => {
      alive = false;
    };
  }, [router]);

  function pickTab(next) {
    setWho(next);
    setError("");
    window.history.replaceState(
      null,
      "",
      next === "teacher" ? "/login?as=teacher" : "/login",
    );
  }

  function fail(key) {
    setError(key);
    setLoading(false);
    setToken("");
    setReset((n) => n + 1);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (captchaOn && !token) {
      setError("captchaErr");
      return;
    }
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const supabase = createClient();

    const { data, error: signInError } = await supabase.auth.signInWithPassword(
      {
        email: String(form.get("email") || "").trim(),
        password: form.get("password"),
        options: captchaOn ? { captchaToken: token } : undefined,
      },
    );
    if (signInError) {
      fail("errWrong");
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, status")
      .eq("id", data.user.id)
      .maybeSingle();
    if (profileError || !profile) {
      await supabase.auth.signOut({ scope: "local" });
      fail("errProfile");
      return;
    }

    // The tab you chose must match what the account really is
    if (who === "teacher" && profile.role !== "admin") {
      await supabase.auth.signOut({ scope: "local" });
      fail("errNotTeacher");
      return;
    }
    if (who === "student" && profile.role === "admin") {
      await supabase.auth.signOut({ scope: "local" });
      fail("errNotStudent");
      return;
    }

    if (profile.role === "admin") {
      router.push("/admin/dashboard");
      return;
    }
    if (profile.status === "pending") {
      await supabase.auth.signOut({ scope: "local" });
      fail("errPending");
      return;
    }
    if (profile.status === "rejected") {
      await supabase.auth.signOut({ scope: "local" });
      fail("errRejected");
      return;
    }
    router.push("/student");
  }

  const tabs = [
    ["student", "user", "tabStudent"],
    ["teacher", "shield", "tabTeacher"],
  ];

  return (
    <AuthShell>
      {/* The teacher side switches to the indigo teacher colors */}
      <div className={who === "teacher" ? "role-admin" : ""}>
        <div
          role="group"
          aria-label="Login type"
          className="grid grid-cols-2 gap-2"
        >
          {tabs.map(([k, icon, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => pickTab(k)}
              aria-pressed={who === k}
              className={`flex min-h-[48px] items-center justify-center gap-2 rounded-md border px-3 font-semibold ${
                who === k ? "text-white" : ""
              }`}
              style={
                who === k
                  ? { background: "var(--btn)", borderColor: "var(--btn-h)" }
                  : { borderColor: "var(--bd)" }
              }
            >
              <Icon name={icon} size={18} />
              {t(label)}
            </button>
          ))}
        </div>

        <h1 className="display mt-8 text-4xl">
          {who === "teacher" ? t("loginTeacherT") : t("loginStudentT")}
        </h1>
        <p className="mu mt-2">
          {who === "teacher" ? t("loginTeacherSub") : t("loginStudentSub")}
        </p>

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
            <div className="relative">
              <input
                name="password"
                type={show ? "text" : "password"}
                required
                autoComplete="current-password"
                className="field !pr-20"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                aria-pressed={show}
                className="pr absolute right-1 top-1/2 min-h-[40px] -translate-y-1/2 rounded px-3 text-sm font-semibold"
              >
                {show ? t("hidePw") : t("showPw")}
              </button>
            </div>
          </div>

          <Captcha onToken={setToken} resetSignal={reset} />

          {error && <p className="err">{t(error)}</p>}

          <button type="submit" disabled={loading} className="btn w-full">
            {loading ? t("wait") : t("loginBtn")}
          </button>
        </form>
      </div>

      {who === "student" ? (
        <>
          <div className="callout mt-6 flex items-start gap-3 p-4 text-sm">
            <Icon
              name="info"
              size={18}
              className="mt-0.5 shrink-0 text-[var(--pri)]"
            />
            <p>
              <span className="font-semibold">{t("forgotQ")}</span>{" "}
              {t("forgotA")}{" "}
              <a
                href="https://t.me/NAFYADWJ"
                target="_blank"
                rel="noopener noreferrer"
                className="pr font-semibold underline underline-offset-4"
              >
                {t("tg")}
              </a>
            </p>
          </div>
          <p className="mu mt-8 text-center text-sm">
            {t("newHere")}{" "}
            <Link
              href="/signup"
              className="pr font-semibold underline underline-offset-4"
            >
              {t("createAcc")}
            </Link>
          </p>
        </>
      ) : (
        <p className="mu mt-8 text-center text-sm">
          <Link
            href="/login"
            onClick={() => pickTab("student")}
            className="pr font-semibold underline underline-offset-4"
          >
            {t("loginStudentT")}
          </Link>
        </p>
      )}
    </AuthShell>
  );
}
