"use client";

import Link from "next/link";
import { usePrefs } from "@/lib/prefs";
import Controls from "./Controls";

export default function LegalPage({ doc }) {
  const { t } = usePrefs();
  const line = { borderColor: "var(--ln)" };

  return (
    <main id="main" tabIndex={-1} className="tx min-h-dvh outline-none">
      <header
        className="b0 no-print sticky top-0 z-30 flex items-center justify-between gap-3 border-b-2 px-4 py-3 sm:px-6"
        style={line}
      >
        <Link href="/" className="pr font-extrabold hover:underline">
          ← {t("back")}
        </Link>
        <Controls />
      </header>

      <article className="cd mx-auto my-6 max-w-3xl p-5 sm:my-10 sm:p-10">
        <h1 className="text-3xl font-extrabold sm:text-4xl">{doc.title}</h1>
        <p className="mu mt-2 font-bold">
          {t("lastUpd")}: {doc.updated}
        </p>
        <p className="chip chip-n mt-3 !whitespace-normal">{t("legalLang")}</p>

        <p className="mt-6 text-[1.05rem] font-medium leading-8">{doc.intro}</p>

        <nav
          aria-label={t("tocT")}
          className="mt-6 rounded-2xl border-2 p-5"
          style={{ borderColor: "var(--ln)", background: "var(--soft)" }}
        >
          <p className="font-extrabold">{t("tocT")}</p>
          <ol className="mt-3 list-decimal space-y-2 pl-6 font-bold">
            {doc.sections.map((s, i) => (
              <li key={i}>
                <a
                  href={`#s${i + 1}`}
                  className="pr underline-offset-4 hover:underline"
                >
                  {s.h}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {doc.sections.map((s, i) => (
          <section key={i} id={`s${i + 1}`} className="mt-10 scroll-mt-24">
            <h2 className="text-2xl font-extrabold">
              {i + 1}. {s.h}
            </h2>
            <div className="mt-3 space-y-4">
              {s.body.map((b, j) =>
                Array.isArray(b) ? (
                  <ul
                    key={j}
                    className="list-disc space-y-2 pl-6 text-[1.05rem] font-medium leading-8"
                  >
                    {b.map((li, k) => (
                      <li key={k}>{li}</li>
                    ))}
                  </ul>
                ) : (
                  <p key={j} className="text-[1.05rem] font-medium leading-8">
                    {b}
                  </p>
                ),
              )}
            </div>
          </section>
        ))}

        <div
          className="no-print mt-12 flex flex-wrap items-center justify-between gap-3 border-t-2 pt-6"
          style={line}
        >
          <div className="flex flex-wrap gap-4 font-extrabold">
            <Link href="/privacy" className="pr underline underline-offset-4">
              {t("privacyT")}
            </Link>
            <Link href="/terms" className="pr underline underline-offset-4">
              {t("termsT")}
            </Link>
          </div>
          <button onClick={() => window.print()} className="btn-ghost">
            🖨️ {t("printT")}
          </button>
        </div>
      </article>
    </main>
  );
}
