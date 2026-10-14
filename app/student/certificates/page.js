"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { usePrefs } from "@/lib/prefs";
import { useStudent } from "@/components/StudentShell";
import Icon from "@/components/Icon";
import { PageHead, Stat, Empty } from "@/components/ui";

export default function StudentCertificates() {
  const { id } = useStudent();
  const { t, lang } = usePrefs();
  const [certs, setCerts] = useState(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("certificates")
        .select("*")
        .eq("student_id", id)
        .order("issued_at", { ascending: false });
      setCerts(data || []);
    }
    load();
  }, [id]);

  const loc = lang === "am" ? "am-ET" : lang === "om" ? "om-ET" : "en-US";
  const day = (iso) =>
    new Date(iso).toLocaleDateString(loc, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  const line = { borderColor: "var(--ln)" };

  return (
    <div className="up space-y-6">
      <PageHead title={t("certsT")} sub={t("subCerts")} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          value={certs ? certs.length : "–"}
          label={t("psCerts")}
          tone={certs && certs.length > 0 ? "ok" : ""}
        />
      </div>

      <section className="cd overflow-hidden">
        {!certs ? (
          <p className="mu p-5">...</p>
        ) : certs.length === 0 ? (
          <Empty icon="award">{t("noCerts")}</Empty>
        ) : (
          <ul className="divide-y" style={line}>
            {certs.map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-4 p-5"
                style={line}
              >
                <div className="flex min-w-0 items-center gap-4">
                  <span
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md"
                    style={{
                      background: "var(--brand-soft)",
                      color: "var(--pri)",
                    }}
                  >
                    <Icon name="award" size={24} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-lg font-semibold">{c.title}</p>
                    <p className="mu text-sm">
                      {t("issuedOn")} {day(c.issued_at)}
                    </p>
                    <span className="chip chip-n mt-1.5">ID {c.code}</span>
                  </div>
                </div>
                <a
                  href={`/certificate/${c.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn sm"
                >
                  {t("viewCert")}
                  <Icon name="arrowUpRight" size={14} />
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
