"use client";

import { usePrefs } from "@/lib/prefs";

export default function SkipLink() {
  const { t } = usePrefs();
  return (
    <a
      href="#main"
      className="skip"
      onClick={(e) => {
        const el = document.getElementById("main");
        if (el) {
          e.preventDefault();
          el.focus();
          el.scrollIntoView();
        }
      }}
    >
      {t("skipT")}
    </a>
  );
}
