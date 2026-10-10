"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { usePrefs } from "@/lib/prefs";
import { useStudent, lvLabel, fmtDate } from "@/components/StudentShell";
import TimeRows from "@/components/TimeRows";
import { GROUPS, LIVE } from "@/lib/schedule";

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

  const group =
    profile.study_group >= 1 && profile.study_group <= GROUPS.length
      ? profile.study_group
      : null;
  const line = { borderColor: "var(--ln)" };

  return (
    <div className="up space-y-6">
      <h1 className="fluid-h2 font-extrabold">{t("liveClasses")}</h1>
      <p className="mu -mt-3 text-sm font-bold">{t("tzNote")}</p>

      {/* My study group */}
      <section className="cd p-5 sm:p-6">
        <h2 className="pr font-extrabold">👥 {t("myGroup")}</h2>
        {group ? (
          <div className="mt-3">
            <p className="text-xl font-extrabold">
              {t("group")} {group}
            </p>
            <p className="pr font-extrabold">{t("tuethu")}</p>
            <div className="mt-2">
              <TimeRows rows={GROUPS[group - 1]} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="chip chip-g">{t("activeT")}</span>
              <span className="chip chip-g">{t("confirmedT")} ✓</span>
            </div>
          </div>
        ) : (
          <p className="mu mt-3 font-semibold">{t("noGroup")}</p>
        )}
      </section>

      {/* Upcoming live classes */}
      <section>
        <h2 className="pr mb-3 font-extrabold">🔴 {t("upcomingT")}</h2>
        <div className="space-y-4">
          {!classes && <p className="mu font-bold">...</p>}
          {classes && classes.length === 0 && (
            <p className="mu font-semibold">{t("noLive")}</p>
          )}
          {classes &&
            classes.map((c) => (
              <div key={c.id} className="cd lift p-5 sm:p-6">
                <p className="pr text-lg font-extrabold">{c.title}</p>
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
                  className="btn sm mt-4"
                >
                  {t("joinClass")}
                </a>
              </div>
            ))}
        </div>
      </section>

      {/* Full schedule */}
      <details className="cd group/full overflow-hidden">
        <summary className="week-h flex cursor-pointer list-none items-center justify-between gap-3 p-4 font-extrabold sm:p-5 [&::-webkit-details-marker]:hidden">
          <span>📅 {t("fullSched")}</span>
          <span className="pr text-2xl transition-transform group-open/full:rotate-180">
            ⌄
          </span>
        </summary>
        <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
          <div className="rounded-xl border p-4" style={line}>
            <p className="font-extrabold">🔴 {t("live")}</p>
            <p className="pr border-b pb-2 font-extrabold" style={line}>
              {t("satsun")}
            </p>
            <TimeRows rows={LIVE} />
          </div>
          {GROUPS.map((rows, i) => (
            <div key={i} className="rounded-xl border p-4" style={line}>
              <p className="font-extrabold">
                {t("group")} {i + 1}
              </p>
              <p className="pr border-b pb-2 font-extrabold" style={line}>
                {t("tuethu")}
              </p>
              <TimeRows rows={rows} />
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
