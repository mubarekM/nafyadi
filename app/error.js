"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="tx grid min-h-dvh place-items-center px-4">
      <div className="max-w-md text-center">
        <p className="overline">Something went wrong</p>
        <h1 className="display mt-2 text-4xl">We hit a problem</h1>
        <p className="mu mt-3">
          Please try again. If it keeps happening, message your teacher on
          Telegram.
        </p>
        <p className="mu mt-1 text-sm">ችግር ተፈጥሯል · Rakkoon uumameera</p>
        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <button onClick={reset} className="btn">
            Try again
          </button>
          <Link href="/" className="btn2">
            Home page
          </Link>
        </div>
      </div>
    </main>
  );
}
