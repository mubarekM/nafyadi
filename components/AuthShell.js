"use client";

import Link from "next/link";
import { useState } from "react";
import { usePrefs } from "@/lib/prefs";
import Controls from "./Controls";

export default function AuthShell({ children }) {
  const { t } = usePrefs();
  const [bad, setBad] = useState(false);

  return (
    <main
      id="main"
      tabIndex={-1}
      className="b0 tx grid min-h-dvh outline-none lg:grid-cols-[1fr_1.1fr]"
    >
      <div
        className="relative hidden overflow-hidden lg:block"
        style={{ background: "var(--deep)" }}
      >
        {!bad && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/hero.jpg"
            alt=""
            onError={() => setBad(true)}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(6,40,30,.95), rgba(6,40,30,.55))",
          }}
        />
        <div className="relative flex h-full flex-col justify-between p-10 text-white">
          <Link href="/" className="flex items-center gap-3">
            <span
              className="display flex h-9 w-9 items-center justify-center rounded-md border border-white/40 text-lg"
              aria-hidden="true"
            >
              N
            </span>
            <span className="font-semibold">English with Nafyad</span>
          </Link>
          <div>
            <h2 className="display text-4xl">{t("authTag")}</h2>
            <p className="mt-3 max-w-md text-lg text-white/90">
              {t("authTag2")}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col px-6 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <Link href="/" className="pr text-sm font-semibold hover:underline">
            ← {t("back")}
          </Link>
          <Controls />
        </div>
        <div className="flex flex-1 items-center justify-center py-8">
          <div className="up w-full max-w-md">{children}</div>
        </div>
      </div>
    </main>
  );
}
