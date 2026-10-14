"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { usePrefs } from "@/lib/prefs";
import { useStudent } from "@/components/StudentShell";
import Icon from "@/components/Icon";
import { PageHead, Stat, Panel, Empty } from "@/components/ui";

export default function StudentProgress() {
  const { id, profile } = useStudent();
  const { t, lang } = usePrefs();
  const [info, setInfo] = useState(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();

      const { data: allLessons } = await supabase
        .from("lessons")
        .select("id, title, level")
        .eq("published", true)
        .order("created_at", { ascending: false });
      const lessons = (allLessons || []).filter(
        (l) => l.level === "All levels" || l.level === profile.english_level,
      );

      const { data: views } = await supabase
        .from("lesson_views")
        .select("lesson_id")
        .eq("student_id", id);
      const opened = new Set((views || []).map((v) => v.lesson_id));

      const { data: subs } = await supabase
        .from("quiz_submissions")
        .select("*, quizzes(title)")
        .eq("student_id", id)
        .order("submitted_at", { ascending: false });

      const { data: certs } = await supabase
        .from("certificates")
        .select("*")
        .eq("student_id", id)
        .order("issued_at", { ascending: false });

      setInfo({ lessons, opened, subs: subs || [], certs: certs || [] });
    }
    load();
  }, [id, profile.english_level]);

  if (!info) return <p className="mu font-semibold">...</p>;

  const { lessons, opened, subs, certs } = info;
  const openedCount = lessons.filter((l) => opened.has(l.id)).length;
  const pct = lessons.length
    ? Math.round((openedCount / lessons.length) * 100)
    : 0;
  const graded = subs.filter((s) => s.status === "graded").length;
  const line = { borderColor: "var(--ln)" };
  const loc = lang === "am" ? "am-ET" : lang === "om" ? "om-ET" : "en-US";
  const day = (iso) =>
    new Date(iso).toLocaleDateString(loc, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <div className="up space-y-6">
      <PageHead title={t("myProgress")} sub={t("subProgress")} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat value={`${pct}%`} label={t("stLessons")}>
          <div
            className="mt-3 h-1.5 w-full overflow-hidden rounded-full"
            style={{ background: "var(--soft)" }}
          >
            <div
              className="h-full rounded-full"
              style={{ width: pct + "%", background: "var(--pri)" }}
            />
          </div>
        </Stat>
        <Stat value={graded} label={t("psGraded")} tone="ok" />
        <Stat
          value={subs.length - graded}
          label={t("psWaiting")}
          tone={subs.length - graded > 0 ? "warn" : ""}
        />
        <Stat value={certs.length} label={t("psCerts")} />
      </div>

      <section className="callout p-5">
        <div className="flex items-center gap-2">
          <Icon name="message" size={18} className="text-[var(--acc-t)]" />
          <h2 className="font-semibold">{t("noteTitle")}</h2>
        </div>
        <p className="mt-3 whitespace-pre-wrap leading-relaxed">
          {profile.teacher_note || t("noNote")}
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title={t("quizResults")} icon="clipboard" flush>
          {subs.length === 0 ? (
            <Empty icon="clipboard">{t("noQuizYet")}</Empty>
          ) : (
            <ul className="divide-y" style={line}>
              {subs.map((s) => (
                <li key={s.id} className="p-4" style={line}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="min-w-0 truncate font-semibold">
                      {s.quizzes?.title || "Quiz"}
                    </p>
                    {s.status === "graded" ? (
                      <span className="chip chip-g">
                        {t("scoreIs")}: {s.score}
                      </span>
                    ) : (
                      <span className="chip chip-n">{t("waitingTeacher")}</span>
                    )}
                  </div>
                  {s.feedback && (
                    <p className="mu mt-2 whitespace-pre-wrap text-sm">
                      {t("fbLabel")}: {s.feedback}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel
          title={`${t("lessonsOpenedT")}: ${openedCount} ${t("of")} ${lessons.length}`}
          icon="book"
          flush
        >
          {lessons.length === 0 ? (
            <Empty icon="book">{t("noLessonsShort")}</Empty>
          ) : (
            <ul className="divide-y" style={line}>
              {lessons.map((l) => (
                <li
                  key={l.id}
                  className="flex items-center justify-between gap-3 p-4"
                  style={line}
                >
                  <span className="min-w-0 truncate font-medium">
                    {l.title}
                  </span>
                  <span
                    className={`chip shrink-0 ${opened.has(l.id) ? "chip-g" : "chip-n"}`}
                  >
                    {opened.has(l.id) ? t("opened") : t("notOpened")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel
        title={t("certsT")}
        icon="award"
        flush
        action={
          certs.length > 0 && (
            <Link
              href="/student/certificates"
              className="pr text-sm font-semibold hover:underline"
            >
              {t("viewAll")}
            </Link>
          )
        }
      >
        {certs.length === 0 ? (
          <Empty icon="award">{t("noCerts")}</Empty>
        ) : (
          <ul className="divide-y" style={line}>
            {certs.map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-3 p-4"
                style={line}
              >
                <div className="min-w-0">
                  <p className="font-semibold">{c.title}</p>
                  <p className="mu text-sm">
                    {t("issuedOn")} {day(c.issued_at)}
                  </p>
                </div>
                <a
                  href={`/certificate/${c.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn sm"
                >
                  {t("viewCert")}
                </a>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
