"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { usePrefs } from "@/lib/prefs";
import { useStudent, lvLabel, fmtDate } from "@/components/StudentShell";

export default function StudentLiveClass() {
  const { profile } = useStudent();
  const { t, lang } = usePrefs();
  const [classes, setClasses] = useState(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const since = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      const { data } = await supabase
        .from("live_classes")
        .select("*")
        .gte("starts_at", since)
        .order("starts_at", { ascending: true });
      setClasses(
        (data || []).filter(
          (c) => c.level === "All levels" || c.level === profile.english_level,
        ),
      );
    }
    load();
  }, [profile.english_level]);

  if (!classes) return <p className="mu font-bold">...</p>;

  return (
    <div className="up">
      <h1 className="fluid-h2 font-extrabold">{t("liveClasses")}</h1>
      <p className="mu mt-1 text-sm font-bold">{t("tzNote")}</p>

      <div className="mt-6 space-y-4">
        {classes.length === 0 && (
          <p className="mu font-semibold">{t("noLive")}</p>
        )}
        {classes.map((c) => (
          <div key={c.id} className="cd lift p-5 sm:p-6">
            <p className="pr text-lg font-extrabold">🔴 {c.title}</p>
            <p className="mt-1 font-bold">{fmtDate(lang, c.starts_at)}</p>
            <p className="mu text-sm font-bold">{lvLabel(t, c.level)}</p>
            {c.notes && (
              <p className="mu mt-3 whitespace-pre-wrap text-sm font-semibold">
                {c.notes}
              </p>
            )}
            <a
              href={c.meeting_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn mt-4"
            >
              {t("joinClass")}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
