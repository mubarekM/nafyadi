"use client";

import { useState } from "react";
import { LANGS, usePrefs } from "@/lib/prefs";

export default function Controls({ showLang = true, up = false }) {
  const { t, lang, pick, dark, flip, ts, setTs, hc, flipHc } = usePrefs();
  const [open, setOpen] = useState(false);

  const sizes = [
    [1, "0.95rem", "sizeS"],
    [2, "1.2rem", "sizeM"],
    [3, "1.5rem", "sizeL"],
  ];

  return (
    <div className="relative flex items-center gap-2">
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
        aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
        className="cd min-h-[44px] min-w-[44px] px-3 py-1.5 text-lg"
      >
        {dark ? "☀️" : "🌙"}
      </button>

      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={t("a11yT")}
        className="cd min-h-[44px] min-w-[44px] px-3 py-1.5 text-base font-extrabold"
      >
        Aa
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
            className={`cd absolute z-[80] w-72 max-w-[85vw] p-4 shadow-2xl ${
              up ? "bottom-full left-0 mb-2" : "right-0 top-full mt-2"
            }`}
          >
            <p className="font-extrabold">{t("a11yT")}</p>

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
                  style={{ borderColor: "var(--bd)" }}
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
              style={{ borderColor: "var(--bd)" }}
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
