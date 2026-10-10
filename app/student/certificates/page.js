"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { usePrefs } from "@/lib/prefs";
import { useStudent } from "@/components/StudentShell";

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

  return (
    <div className="up">
      <h1 className="fluid-h2 font-extrabold">🎓 {t("certsT")}</h1>

      <div className="mt-6 space-y-4">
        {!certs && <p className="mu font-bold">...</p>}
        {certs && certs.length === 0 && (
          <div className="cd p-8 text-center">
            <p className="text-5xl">🎓</p>
            <p className="mu mt-3 font-semibold">{t("noCerts")}</p>
          </div>
        )}
        {certs &&
          certs.map((c) => (
            <div
              key={c.id}
              className="cd lift flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
            >
              <div className="min-w-0">
                <p className="text-lg font-extrabold">{c.title}</p>
                <p className="mu text-sm font-bold">
                  {t("issuedOn")} {day(c.issued_at)}
                </p>
                <span className="chip chip-n mt-2">ID {c.code}</span>
              </div>
              <a
                href={`/certificate/${c.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn sm"
              >
                {t("viewCert")}
              </a>
            </div>
          ))}
      </div>
    </div>
  );
}
