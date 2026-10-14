"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { usePrefs } from "@/lib/prefs";
import { useStudent, lvLabel, fmtDate } from "@/components/StudentShell";
import TimeRows from "@/components/TimeRows";
import JoinButton from "@/components/JoinButton";
import Icon from "@/components/Icon";
import { PageHead, Stat, Panel, Empty } from "@/components/ui";
import { GROUPS, LIVE } from "@/lib/schedule";
import { downloadIcs } from "@/lib/ics";

const ATTENDED = ["joined", "present", "late"];
const LABEL = {
  joined: "attJoined",
  present: "attPresent",
  late: "attLate",
  absent: "attAbsent",
  excused: "attExcused",
};
const CHIP = {
  joined: "chip-g",
  present: "chip-g",
  late: "chip-y",
  absent: "chip-r",
  excused: "chip-n",
  missed: "chip-r",
};

export default function StudentLiveClass() {
  const { id, profile } = useStudent();
  const { t, lang } = usePrefs();
  const [classes, setClasses] = useState(null);
  const [att, setAtt] = useState(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const mine = (c) =>
        c.level === "All levels" || c.level === profile.english_level;
      const since = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

      const { data } = await supabase
        .from("live_classes")
        .select("*")
        .gte("starts_at", since)
        .order("starts_at", { ascending: true });
      setClasses((data || []).filter(mine));

      // Attendance: classes that already happened since this student joined
      const { data: past } = await supabase
        .from("live_classes")
        .select("id, title, starts_at, level")
        .lt("starts_at", since)
        .order("starts_at", { ascending: false })
        .limit(60);
      const { data: rows } = await supabase
        .from("attendance")
        .select("class_id, status")
        .eq("student_id", id);

      const joinedAt = new Date(profile.created_at).getTime();
      const list = (past || []).filter(
        (c) => mine(c) && new Date(c.starts_at).getTime() >= joinedAt,
      );
      const byClass = {};
      (rows || []).forEach((r) => {
        byClass[r.class_id] = r.status;
      });
      const attended = list.filter((c) =>
        ATTENDED.includes(byClass[c.id]),
      ).length;
      setAtt({
        total: list.length,
        attended,
        recent: list
          .slice(0, 8)
          .map((c) => ({ ...c, status: byClass[c.id] || "missed" })),
      });
    }
    load();
  }, [id, profile.english_level, profile.created_at]);

  const group =
    profile.study_group >= 1 && profile.study_group <= GROUPS.length
      ? profile.study_group
      : null;
  const line = { borderColor: "var(--ln)" };
  const rate =
    att && att.total ? Math.round((att.attended / att.total) * 100) : 0;

  return (
    <div className="up space-y-6">
      <PageHead title={t("liveClasses")} sub={t("tzNote")} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          value={group ? `${t("group")} ${group}` : t("psNoGroup")}
          label={t("psGroup")}
          tone={group ? "ok" : "warn"}
        />
        <Stat value={classes ? classes.length : "–"} label={t("psUpcoming")} />
        <Stat
          value={att && att.total ? `${rate}%` : "–"}
          label={t("psRate")}
          tone="ok"
        >
          {att && att.total > 0 && (
            <div
              className="mt-3 h-1.5 w-full overflow-hidden rounded-full"
              style={{ background: "var(--soft)" }}
            >
              <div
                className="h-full rounded-full"
                style={{ width: rate + "%", background: "var(--pri)" }}
              />
            </div>
          )}
        </Stat>
        <Stat
          value={att ? `${att.attended} / ${att.total}` : "–"}
          label={t("attClasses")}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Upcoming classes */}
        <Panel title={t("upcomingT")} icon="video" flush>
          {!classes ? (
            <p className="mu p-5">...</p>
          ) : classes.length === 0 ? (
            <Empty icon="calendar">{t("noLive")}</Empty>
          ) : (
            <ul className="divide-y" style={line}>
              {classes.map((c) => (
                <li key={c.id} className="p-5" style={line}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-lg font-semibold">{c.title}</p>
                      <p className="mt-1 flex items-center gap-2 font-medium">
                        <Icon
                          name="clock"
                          size={16}
                          className="text-[var(--pri)]"
                        />
                        {fmtDate(lang, c.starts_at)}
                      </p>
                      <span className="chip chip-n mt-2">
                        {lvLabel(t, c.level)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => downloadIcs(c)}
                        className="btn-ghost"
                      >
                        <Icon name="calendar" size={14} />
                        {t("addCal")}
                      </button>
                      <JoinButton cls={c} />
                    </div>
                  </div>
                  {c.notes && (
                    <p className="mu mt-3 whitespace-pre-wrap text-sm">
                      {c.notes}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {/* My study group */}
        <Panel title={t("myGroup")} icon="users">
          {group ? (
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-lg font-semibold">
                  {t("group")} {group}
                </p>
                <span className="chip chip-g">{t("confirmedT")}</span>
              </div>
              <p className="pr mb-2 text-sm font-semibold">{t("tuethu")}</p>
              <TimeRows rows={GROUPS[group - 1]} />
            </div>
          ) : (
            <Empty icon="users">{t("noGroup")}</Empty>
          )}
        </Panel>
      </div>

      {/* Attendance history */}
      <Panel title={t("attT")} icon="checkCircle" flush>
        {!att ? (
          <p className="mu p-5">...</p>
        ) : att.total === 0 ? (
          <Empty icon="calendar">{t("attNone")}</Empty>
        ) : (
          <ul className="divide-y" style={line}>
            {att.recent.map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-2 p-4"
                style={line}
              >
                <span className="min-w-0 flex-1 truncate font-medium">
                  {c.title}
                </span>
                <span className={`chip ${CHIP[c.status]}`}>
                  {c.status === "missed" ? t("attMissed") : t(LABEL[c.status])}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {/* Full schedule */}
      <details className="cd group/full overflow-hidden">
        <summary className="week-h flex cursor-pointer list-none items-center justify-between gap-3 p-4 font-semibold sm:p-5 [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-2">
            <Icon name="calendar" size={18} className="text-[var(--pri)]" />
            {t("fullSched")}
          </span>
          <Icon
            name="chevronDown"
            size={20}
            className="transition-transform group-open/full:rotate-180"
          />
        </summary>
        <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
          <div className="rounded-md border p-4" style={line}>
            <p className="font-semibold">{t("live")}</p>
            <p className="pr border-b pb-2 text-sm font-semibold" style={line}>
              {t("satsun")}
            </p>
            <TimeRows rows={LIVE} />
          </div>
          {GROUPS.map((rows, i) => (
            <div key={i} className="rounded-md border p-4" style={line}>
              <p className="font-semibold">
                {t("group")} {i + 1}
              </p>
              <p
                className="pr border-b pb-2 text-sm font-semibold"
                style={line}
              >
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
