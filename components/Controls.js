"use client";

import { useState } from "react";
import { LANGS, usePrefs } from "@/lib/prefs";

const TXT = {
  en: { lang: "Language", dark: "Dark mode", light: "Light mode" },
  am: { lang: "ቋንቋ", dark: "ጨለማ ገጽታ", light: "ብሩህ ገጽታ" },
  om: { lang: "Afaan", dark: "Haala dukkanaa", light: "Haala ifaa" },
};

export default function Controls({ showLang = true, up = false }) {
  const { t, lang, pick, dark, flip, ts, setTs, hc, flipHc } = usePrefs();
  const [open, setOpen] = useState(false);
  const x = TXT[lang] || TXT.en;

  const sizes = [
    [1, "0.95rem", "sizeS"],
    [2, "1.2rem", "sizeM"],
    [3, "1.5rem", "sizeL"],
  ];
  const edge = { borderColor: "var(--bd)" };

  return (
    <div className="relative flex shrink-0 items-center gap-2">
      {/* Bigger screens: language and dark mode stay visible */}
      <div className="hidden items-center gap-2 sm:flex">
        {showLang && (
          <select
            value={lang}
            onChange={(e) => pick(e.target.value)}
            aria-label="Language"
            className="cd tx min-h-[44px] px-2 py-1.5 text-sm font-bold"
          >
            {Object.entries(LANGS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        )}
        <button
          onClick={flip}
          aria-label={dark ? x.light : x.dark}
          className="cd min-h-[44px] min-w-[44px] px-3 py-1.5 text-lg"
        >
          {dark ? "☀️" : "🌙"}
        </button>
      </div>

      {/* One settings button: ⚙️ on phones, Aa on bigger screens */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={t("a11yT")}
        className="cd inline-flex min-h-[44px] min-w-[44px] items-center justify-center px-3 py-1.5 text-base font-extrabold"
      >
        <span className="sm:hidden" aria-hidden="true">
          ⚙️
        </span>
        <span className="hidden sm:inline">Aa</span>
      </button>

      {open && (
        <>
          <button
            aria-hidden="true"
            tabIndex={-1}
            className="fixed inset-0 z-[70] cursor-default"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-label={t("a11yT")}
            className={`cd absolute z-[80] max-h-[80dvh] w-72 max-w-[85vw] overflow-y-auto p-4 shadow-2xl ${
              up ? "bottom-full left-0 mb-2" : "right-0 top-full mt-2"
            }`}
          >
            <p className="font-extrabold">{t("a11yT")}</p>

            {/* Phones only: language and dark mode */}
            <div className="sm:hidden">
              {showLang && (
                <>
                  <p className="lbl mt-4">{x.lang}</p>
                  <div className="space-y-2">
                    {Object.entries(LANGS).map(([k, v]) => (
                      <button
                        key={k}
                        onClick={() => pick(k)}
                        aria-pressed={lang === k}
                        className={`flex min-h-[48px] w-full items-center justify-between rounded-xl border-2 px-4 font-extrabold ${
                          lang === k ? "grad text-white" : ""
                        }`}
                        style={edge}
                      >
                        <span>{v}</span>
                        {lang === k && <span aria-hidden="true">✓</span>}
                      </button>
                    ))}
                  </div>
                </>
              )}
              <button
                onClick={flip}
                className="mt-3 flex min-h-[48px] w-full items-center gap-3 rounded-xl border-2 px-4 font-extrabold"
                style={edge}
              >
                <span aria-hidden="true">{dark ? "☀️" : "🌙"}</span>
                <span>{dark ? x.light : x.dark}</span>
              </button>
            </div>

            <p className="lbl mt-4">{t("textSize")}</p>
            <div className="grid grid-cols-3 gap-2">
              {sizes.map(([n, fs, key]) => (
                <button
                  key={n}
                  onClick={() => setTs(n)}
                  aria-pressed={ts === n}
                  className={`flex min-h-[64px] flex-col items-center justify-center rounded-xl border-2 px-1 py-2 font-extrabold ${
                    ts === n ? "grad text-white" : ""
                  }`}
                  style={edge}
                >
                  <span style={{ fontSize: fs, lineHeight: 1 }}>A</span>
                  <span className="mt-1 text-[0.7rem] leading-tight">
                    {t(key)}
                  </span>
                </button>
              ))}
            </div>

            <button
              role="switch"
              aria-checked={hc}
              onClick={flipHc}
              className="mt-4 flex w-full items-center justify-between gap-3 rounded-xl border-2 p-3 text-left"
              style={edge}
            >
              <span className="min-w-0">
                <span className="block font-extrabold">{t("hcT")}</span>
                <span className="mu block text-xs font-bold">{t("hcD")}</span>
              </span>
              <span className={`chip shrink-0 ${hc ? "chip-g" : "chip-n"}`}>
                {hc ? t("onT") : t("offT")}
              </span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
