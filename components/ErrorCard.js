"use client";

import { useState } from "react";
import Link from "next/link";

export default function ErrorCard({ error, info = "", onRetry, full = false }) {
  const [copied, setCopied] = useState(false);
  const message = String(error?.message || error || "Unknown error");

  const details = [
    `Page: ${typeof window !== "undefined" ? window.location.href : ""}`,
    `Time: ${new Date().toISOString()}`,
    `Browser: ${typeof navigator !== "undefined" ? navigator.userAgent : ""}`,
    `Message: ${message}`,
    error?.digest ? `Digest: ${error.digest}` : "",
    `Stack: ${String(error?.stack || "").slice(0, 1800)}`,
    info ? `Component stack: ${String(info).slice(0, 800)}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  async function copy() {
    try {
      await navigator.clipboard.writeText(details);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  }

  const inner = (
    <div
      className={
        full
          ? "max-w-xl text-center"
          : "cd stat stat-bad mx-auto max-w-xl p-6 text-center"
      }
    >
      <p className="overline">Something went wrong</p>
      <h1 className="display mt-2 text-3xl">We hit a problem</h1>
      <p className="mu mt-3">
        Please try again. If it keeps happening, message your teacher on
        Telegram.
      </p>
      <p className="mu mt-1 text-sm">ችግር ተፈጥሯል · Rakkoon uumameera</p>
      <p className="mu mt-3 break-words text-xs">{message.slice(0, 200)}</p>

      <details className="mt-4 text-left">
        <summary className="pr cursor-pointer text-sm font-semibold">
          Technical details (for the developer)
        </summary>
        <pre
          className="mu mt-2 max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-md border p-3 text-xs"
          style={{ borderColor: "var(--ln)" }}
        >
          {details}
        </pre>
      </details>

      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        {onRetry && (
          <button onClick={onRetry} className="btn">
            Try again
          </button>
        )}
        <button onClick={copy} className="btn-ghost">
          {copied ? "Copied" : "Copy details"}
        </button>
        <Link href="/" className="btn2">
          Home page
        </Link>
      </div>
    </div>
  );

  return full ? (
    <main className="tx grid min-h-dvh place-items-center px-4">{inner}</main>
  ) : (
    inner
  );
}
