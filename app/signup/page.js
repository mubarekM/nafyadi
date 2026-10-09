"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { usePrefs } from "@/lib/prefs";
import AuthShell from "@/components/AuthShell";

// The first word is saved in the database (keep it in English). The second is the translated label.
const LEVELS = [
  ["Beginner", "lvBeginner"],
  ["Elementary", "lvElementary"],
  ["Intermediate", "lvIntermediate"],
  ["Upper-intermediate", "lvUpper"],
  ["Advanced", "lvAdvanced"],
];

export default function Signup() {
  const { t } = usePrefs();
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const supabase = createClient();

    const { error: signUpError } = await supabase.auth.signUp({
      email: form.get("email"),
      password: form.get("password"),
      options: {
        data: {
          full_name: form.get("full_name"),
          phone: form.get("phone"),
          english_level: form.get("english_level"),
        },
      },
    });

    // Students must wait for approval, so log them out right away
    await supabase.auth.signOut();
    setLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    setDone(true);
  }

  return (
    <AuthShell>
      <h1 className="text-4xl font-extrabold">{t("signTitle")}</h1>
      <p className="mu mt-2 font-semibold">{t("signSub")}</p>

      {done ? (
        <p className="ok mt-8">{t("thanks")}</p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label className="lbl">{t("fullName")}</label>
            <input name="full_name" type="text" required className="field" />
          </div>
          <div>
            <label className="lbl">{t("email")}</label>
            <input name="email" type="email" required className="field" />
          </div>
          <div>
            <label className="lbl">{t("phone")}</label>
            <input name="phone" type="tel" required className="field" />
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
            <label className="lbl">
              {t("password")} ({t("pwHint")})
            </label>
            <input
              name="password"
              type="password"
              required
              minLength={6}
              className="field"
            />
          </div>

          {error && <p className="err">{error}</p>}

          <button type="submit" disabled={loading} className="btn w-full">
            {loading ? t("wait") : t("signBtn")}
          </button>
        </form>
      )}

      <p className="mu mt-8 text-center text-sm font-bold">
        {t("hasAcc")}{" "}
        <Link href="/login" className="pr hover:underline">
          {t("goLogin")}
        </Link>
      </p>
    </AuthShell>
  );
}
