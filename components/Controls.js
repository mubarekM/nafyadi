"use client";
import { LANGS, usePrefs } from "@/lib/prefs";

export default function Controls({ showLang = true }) {
  const { lang, pick, dark, flip } = usePrefs();
  return (
    <div className="flex items-center gap-2">
      {showLang && (
        <select
          value={lang}
          onChange={(e) => pick(e.target.value)}
          aria-label="Language"
          className="cd tx px-2 py-1.5 text-sm font-bold"
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
        aria-label="Dark mode"
        className="cd px-3 py-1.5 text-lg"
      >
        {dark ? "☀️" : "🌙"}
      </button>
    </div>
  );
}
