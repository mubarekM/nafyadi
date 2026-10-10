"use client";

import Link from "next/link";
import { usePrefs } from "@/lib/prefs";

export default function LockedCard() {
  const { t } = usePrefs();
  return (
    <div className="cd up mx-auto max-w-xl p-8 text-center">
      <p className="text-5xl">🔒</p>
      <h1 className="mt-4 text-2xl font-extrabold">{t("lockT")}</h1>
      <p className="mu mt-3 font-semibold leading-relaxed">{t("lockD")}</p>
      <Link href="/student/payments" className="btn mt-6">
        {t("lockBtn")}
      </Link>
    </div>
  );
}
