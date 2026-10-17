"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { usePrefs } from "@/lib/prefs";
import AuthShell from "@/components/AuthShell";
import Icon from "@/components/Icon";
import Captcha, { captchaOn } from "@/components/Captcha";

// The first word is saved in the database (keep it in English). The second is the translated label.
const LEVELS = [
  ["Beginner", "lvBeginner"],
  ["Elementary", "lvElementary"],
  ["Intermediate", "lvIntermediate"],
  ["Upper-intermediate", "lvUpper"],
  ["Advanced", "lvAdvanced"],
];

const CONSENT_VERSION = "2026-10";

export default function Signup() {
  const { t } = usePrefs();
  const [who, setWho] = useState("student");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [token, setToken] = useState("");
  const [reset, setReset] = useState(0);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("as") === "teacher")
      setWho("teacher");
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (captchaOn && !token) {
      setError(t("captchaErr"));
      return;
    }
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const supabase = createClient();

    const { error: signUpError } = await supabase.auth.signUp({
      email: String(form.get("email") || "").trim(),
      password: form.get("password"),
      options: {
        captchaToken: captchaOn ? token : undefined,
        data: {
          full_name: String(form.get("full_name") || "").trim(),
          phone: String(form.get("phone") || "").trim(),
          english_level: form.get("english_level"),
          consent_at: new Date().toISOString(),
          consent_version: CONSENT_VERSION,
        },
      },
    });

    // Students must wait for approval, so log them out right away (only this device)
    await supabase.auth.signOut({ scope: "local" });
    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      setToken("");
      setReset((n) => n + 1);
      return;
    }
    setDone(true);
  }

  const tabs = [
    ["student", "user", "iamStudent"],
    ["teacher", "shield", "iamTeacher"],
  ];

  return (
    <AuthShell>
      <div className={who === "teacher" ? "role-admin" : ""}>
        <div
          role="group"
          aria-label="Account type"
          className="grid grid-cols-2 gap-2"
        >
          {tabs.map(([k, icon, label]) => (
            <button
              key={k}
              type="button"
              onClick={() => setWho(k)}
              aria-pressed={who === k}
              className={`flex min-h-[48px] items-center justify-center gap-2 rounded-md border px-3 text-sm font-semibold sm:text-base ${
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

        {who === "teacher" ? (
          <div className="mt-8">
            <span
              className="flex h-12 w-12 items-center justify-center rounded-md"
              style={{ background: "var(--brand-soft)", color: "var(--pri)" }}
            >
              <Icon name="shield" size={24} />
            </span>
            <h1 className="display mt-4 text-3xl">{t("teacherOnlyT")}</h1>
            <p className="mu mt-3 leading-relaxed">{t("teacherOnlyD")}</p>
            <Link href="/login?as=teacher" className="btn mt-6 w-full">
              {t("teacherLoginBtn")}
              <Icon name="arrowRight" size={16} />
            </Link>
          </div>
        ) : (
          <>
            <h1 className="display mt-8 text-4xl">{t("signTitle")}</h1>
            <p className="mu mt-2">{t("signSub")}</p>

            {done ? (
              <p className="ok mt-8">{t("thanks")}</p>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                <div>
                  <label className="lbl">{t("fullName")}</label>
                  <input
                    name="full_name"
                    type="text"
                    required
                    className="field"
                  />
                </div>
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
                  <label className="lbl">{t("phone")}</label>
                  <input
                    name="phone"
                    type="tel"
                    required
                    autoComplete="tel"
                    className="field"
                  />
                </div>
                <div>
                  <label className="lbl">{t("level")}</label>
                  <select
                    name="english_level"
                    required
                    defaultValue=""
                    className="field"
                  >
                    <option value="" disabled>
                      {t("chooseLevel")}
                    </option>
                    {LEVELS.map(([value, key]) => (
                      <option key={value} value={value}>
                        {t(key)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="lbl">{t("password")}</label>
                  <div className="relative">
                    <input
                      name="password"
                      type={show ? "text" : "password"}
                      required
                      minLength={8}
                      autoComplete="new-password"
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
                  <p className="mu mt-1 text-xs">{t("pwHint8")}</p>
                </div>

                <label className="flex items-start gap-3 text-sm">
                  <input
                    name="consent"
                    type="checkbox"
                    required
                    className="mt-0.5"
                  />
                  <span>
                    {t("consentA")}{" "}
                    <Link
                      href="/terms"
                      target="_blank"
                      className="pr font-semibold underline"
                    >
                      {t("termsT")}
                    </Link>{" "}
                    {t("consentAnd")}{" "}
                    <Link
                      href="/privacy"
                      target="_blank"
                      className="pr font-semibold underline"
                    >
                      {t("privacyT")}
                    </Link>
                    . {t("consentKid")}
                  </span>
                </label>

                <Captcha onToken={setToken} resetSignal={reset} />

                {error && <p className="err">{error}</p>}

                <button type="submit" disabled={loading} className="btn w-full">
                  {loading ? t("wait") : t("signBtn")}
                </button>
              </form>
            )}

            <p className="mu mt-8 text-center text-sm">
              {t("hasAcc")}{" "}
              <Link
                href="/login"
                className="pr font-semibold underline underline-offset-4"
              >
                {t("goLogin")}
              </Link>
            </p>
          </>
        )}
      </div>
    </AuthShell>
  );
}
