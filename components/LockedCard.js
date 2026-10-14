"use client";

import Link from "next/link";
import { usePrefs } from "@/lib/prefs";
import Icon from "./Icon";

export default function LockedCard() {
  const { t } = usePrefs();
  return (
    <div className="cd stat stat-warn up mx-auto max-w-xl p-8 text-center">
      <span
        className="mx-auto flex h-12 w-12 items-center justify-center rounded-md"
        style={{ background: "var(--brand-soft)", color: "var(--pri)" }}
      >
        <Icon name="lock" size={24} />
      </span>
      <h1 className="mt-4 text-2xl font-semibold">{t("lockT")}</h1>
      <p className="mu mt-3 leading-relaxed">{t("lockD")}</p>
      <Link href="/student/payments" className="btn mt-6">
        {t("lockBtn")}
        <Icon name="arrowRight" size={16} />
      </Link>
    </div>
  );
}
