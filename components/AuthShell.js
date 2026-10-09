"use client";
import Link from "next/link";
import { useState } from "react";
import { usePrefs } from "@/lib/prefs";
import Controls from "./Controls";

export default function AuthShell({ children }) {
  const { t } = usePrefs();
  const [bad, setBad] = useState(false);

  return (
    <main className="b0 tx grid min-h-dvh lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        {bad ? (
          <div className="grad absolute inset-0" />
        ) : (
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
              "linear-gradient(to top, rgba(8,20,60,.92), rgba(20,50,140,.45))",
          }}
        />
        <div className="relative flex h-full flex-col justify-between p-10 text-white">
          <Link href="/" className="text-xl font-extrabold">
            English with Nafyad
          </Link>
          <div>
            <h2 className="text-4xl font-extrabold leading-tight">
              {t("authTag")}
            </h2>
            <p className="mt-3 text-lg font-semibold text-white/85">
              {t("authTag2")}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col px-6 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <Link href="/" className="pr text-sm font-extrabold hover:opacity-70">
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
