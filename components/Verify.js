"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import { usePrefs } from "@/lib/prefs";
import Controls from "./Controls";
import Icon from "./Icon";

export default function Verify() {
  const { t, lang } = usePrefs();
  const [code, setCode] = useState("");
  const [state, setState] = useState("idle"); // idle | busy | found | none | error
  const [row, setRow] = useState(null);
  const last = useRef(0);
  const line = { borderColor: "var(--ln)" };

  const loc = lang === "am" ? "am-ET" : lang === "om" ? "om-ET" : "en-US";

  async function check(e) {
    e.preventDefault();
    const c = code.trim();
    if (!c || Date.now() - last.current < 1500) return; // gentle slow-down
    last.current = Date.now();
    setState("busy");
    const supabase = createClient();
    const { data, error } = await supabase.rpc("verify_certificate", {
      p_code: c,
    });
    if (error) {
      setState("error");
      return;
    }
    if (data && data.length > 0) {
      setRow(data[0]);
      setState("found");
    } else {
      setRow(null);
      setState("none");
    }
  }

  return (
    <main id="main" tabIndex={-1} className="tx min-h-dvh outline-none">
      <header
        className="b0 sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b px-4 sm:px-6"
        style={line}
      >
        <Link href="/" className="flex items-center gap-3">
          <span
            className="display flex h-9 w-9 items-center justify-center rounded-md text-lg text-white"
            style={{ background: "var(--deep)" }}
            aria-hidden="true"
          >
            N
          </span>
          <span className="hidden font-semibold min-[420px]:inline">
            English with Nafyad
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="pr hidden text-sm font-semibold hover:underline sm:inline"
          >
            ← {t("back")}
          </Link>
          <Controls />
        </div>
      </header>

      <div className="mx-auto max-w-xl px-4 py-12 sm:py-16">
        <span
          className="flex h-12 w-12 items-center justify-center rounded-md"
          style={{ background: "var(--brand-soft)", color: "var(--pri)" }}
        >
          <Icon name="award" size={24} />
        </span>
        <h1 className="display mt-4 text-3xl sm:text-4xl">{t("verT")}</h1>
        <p className="mu mt-3 text-lg">{t("verSub")}</p>

        <form onSubmit={check} className="cd mt-8 p-5 sm:p-6">
          <label className="lbl" htmlFor="cert-code">
            {t("verCode")}
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="cert-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              maxLength={40}
              autoComplete="off"
              className="field"
            />
            <button
              type="submit"
              disabled={state === "busy"}
              className="btn sm:w-auto"
            >
              {state === "busy" ? t("wait") : t("verBtn")}
            </button>
          </div>
        </form>

        {state === "found" && row && (
          <section
            className="cd stat stat-ok mt-6 p-5 sm:p-6"
            aria-live="polite"
          >
            <p className="flex items-center gap-2 font-semibold text-[var(--pri)]">
              <Icon name="checkCircle" size={20} />
              {t("verOk")}
            </p>
            <dl className="mt-4 divide-y" style={line}>
              {[
                [t("verHolder"), row.holder],
                [t("verCourse"), row.title],
                [
                  t("verDate"),
                  new Date(row.issued_at).toLocaleDateString(loc, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }),
                ],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="flex flex-wrap justify-between gap-2 py-2.5"
                  style={line}
                >
                  <dt className="mu text-sm">{k}</dt>
                  <dd className="font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mu mt-3 text-xs">{t("verNote")}</p>
          </section>
        )}
        {state === "none" && <p className="err mt-6">{t("verNo")}</p>}
        {state === "error" && <p className="err mt-6">{t("enrollErr")}</p>}
      </div>
    </main>
  );
}
