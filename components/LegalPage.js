"use client";

import Link from "next/link";
import { usePrefs } from "@/lib/prefs";
import Controls from "./Controls";
import Icon from "./Icon";

export default function LegalPage({ doc }) {
  const { t } = usePrefs();
  const line = { borderColor: "var(--ln)" };

  const toc = doc.sections.map((s, i) => (
    <li key={i}>
      <a className="mu block py-1 hover:text-[var(--pri)]" href={`#s${i + 1}`}>
        {i + 1}. {s.h}
      </a>
    </li>
  ));

  return (
    <main id="main" tabIndex={-1} className="tx min-h-dvh outline-none">
      <header
        className="b0 no-print sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b px-4 sm:px-6"
        style={line}
      >
        <Link href="/" className="flex items-center gap-3">
          <span
            className="display flex h-9 w-9 items-center justify-center rounded-md text-lg text-white"
            style={{ background: "var(--deep)" }}
            aria-hidden="true"
          >
            N
          </span>
          <span className="hidden font-semibold min-[420px]:inline">
            English with Nafyad
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="pr hidden text-sm font-semibold hover:underline sm:inline"
          >
            ← {t("back")}
          </Link>
          <Controls />
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[16rem_1fr] lg:py-14">
        {/* Contents: sidebar on big screens */}
        <aside className="no-print hidden lg:sticky lg:top-24 lg:block lg:self-start">
          <nav aria-label={t("tocT")}>
            <p className="overline">{t("tocT")}</p>
            <ol className="mt-3 space-y-0.5 border-l pl-4 text-sm" style={line}>
              {toc}
            </ol>
          </nav>
        </aside>

        <article className="min-w-0 max-w-3xl">
          <p className="overline">
            {t("lastUpd")}: {doc.updated}
          </p>
          <h1 className="display mt-2 text-4xl sm:text-5xl">{doc.title}</h1>
          <p className="callout mt-5 flex items-start gap-2 p-3 text-sm">
            <Icon
              name="info"
              size={16}
              className="mt-0.5 shrink-0 text-[var(--pri)]"
            />
            <span>{t("legalLang")}</span>
          </p>

          <p className="mt-6 text-lg leading-8">{doc.intro}</p>

          {/* Contents: collapsible on phones */}
          <details className="cd no-print mt-6 lg:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between p-4 font-semibold [&::-webkit-details-marker]:hidden">
              {t("tocT")}
              <Icon name="chevronDown" size={18} />
            </summary>
            <ol className="space-y-0.5 border-t p-4 text-sm" style={line}>
              {toc}
            </ol>
          </details>

          {doc.sections.map((s, i) => (
            <section key={i} id={`s${i + 1}`} className="mt-12 scroll-mt-24">
              <h2 className="display text-2xl sm:text-3xl">
                {i + 1}. {s.h}
              </h2>
              <div className="mt-4 space-y-4">
                {s.body.map((b, j) =>
                  Array.isArray(b) ? (
                    <ul
                      key={j}
                      className="list-disc space-y-2 pl-6 text-[1.05rem] leading-8"
                    >
                      {b.map((li, k) => (
                        <li key={k}>{li}</li>
                      ))}
                    </ul>
                  ) : (
                    <p key={j} className="text-[1.05rem] leading-8">
                      {b}
                    </p>
                  ),
                )}
              </div>
            </section>
          ))}

          <div
            className="no-print mt-14 flex flex-wrap items-center justify-between gap-3 border-t pt-6"
            style={line}
          >
            <div className="flex flex-wrap gap-5 font-semibold">
              <Link href="/privacy" className="pr underline underline-offset-4">
                {t("privacyT")}
              </Link>
              <Link href="/terms" className="pr underline underline-offset-4">
                {t("termsT")}
              </Link>
            </div>
            <button onClick={() => window.print()} className="btn-ghost">
              <Icon name="file" size={16} />
              {t("printT")}
            </button>
          </div>
        </article>
      </div>
    </main>
  );
}
