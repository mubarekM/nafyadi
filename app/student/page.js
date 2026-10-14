"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { usePrefs } from "@/lib/prefs";
import { useStudent, lvLabel } from "@/components/StudentShell";
import JoinButton from "@/components/JoinButton";
import Icon from "@/components/Icon";

export default function StudentHome() {
  const { id, profile, access } = useStudent();
  const { t, lang } = usePrefs();
  const [d, setD] = useState(null);

  const loc = lang === "am" ? "am-ET" : lang === "om" ? "om-ET" : "en-US";
  const today = new Date();
  const ym = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  const monthName = today.toLocaleDateString(loc, {
    year: "numeric",
    month: "long",
  });
  const short = (iso) =>
    new Date(iso).toLocaleString(loc, {
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  const shortDay = (iso) =>
    new Date(iso).toLocaleDateString(loc, { day: "numeric", month: "short" });
  const line = { borderColor: "var(--ln)" };

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const since = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      const mine = (x) =>
        x.level === "All levels" || x.level === profile.english_level;

      const [c, l, v, q, s, p, a] = await Promise.all([
        supabase
          .from("live_classes")
          .select("*")
          .gte("starts_at", since)
          .order("starts_at", { ascending: true })
          .limit(20),
        supabase
          .from("lessons")
          .select("id, title, level, week, week_title")
          .eq("published", true)
          .order("week", { ascending: true })
          .order("created_at", { ascending: true }),
        supabase.from("lesson_views").select("lesson_id").eq("student_id", id),
        supabase.from("quizzes").select("id, level").eq("published", true),
        supabase
          .from("quiz_submissions")
          .select("*, quizzes(title)")
          .eq("student_id", id)
          .order("submitted_at", { ascending: false }),
        supabase
          .from("payments")
          .select("month, status")
          .eq("student_id", id)
          .eq("month", ym),
        supabase
          .from("announcements")
          .select("*")
          .eq("active", true)
          .order("pinned", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

      const lessons = (l.data || []).filter(mine);
      const opened = new Set((v.data || []).map((x) => x.lesson_id));
      const subs = s.data || [];
      const doneQuiz = new Set(subs.map((x) => x.quiz_id));
      const quizzes = (q.data || []).filter(mine);
      const pays = p.data || [];

      setD({
        nextClass: (c.data || []).filter(mine)[0] || null,
        next: lessons.find((x) => !opened.has(x.id)) || null,
        total: lessons.length,
        done: lessons.filter((x) => opened.has(x.id)).length,
        todo: quizzes.filter((x) => !doneQuiz.has(x.id)).length,
        subs: subs.slice(0, 4),
        ann: (a.data || []).filter(mine).slice(0, 3),
        pay: pays.some((x) => x.status === "approved")
          ? "paid"
          : pays.some((x) => x.status === "pending")
            ? "review"
            : "due",
      });
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, profile.english_level]);

  const pct = d && d.total ? Math.round((d.done / d.total) * 100) : 0;
  const payTone =
    d?.pay === "paid"
      ? "stat-ok"
      : d?.pay === "review"
        ? "stat-warn"
        : "stat-bad";
  const payWord =
    d?.pay === "paid"
      ? t("stPaid")
      : d?.pay === "review"
        ? t("stReview")
        : t("stDue");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">
          {t("welcome")}, {profile.full_name}
        </h1>
        <p className="mu mt-1">
          {t("levelIs")}: {lvLabel(t, profile.english_level)}
        </p>
      </div>

      {/* Announcements from the teacher */}
      {d && d.ann.length > 0 && (
        <section className="space-y-3" aria-label={t("annT")}>
          {d.ann.map((x) => (
            <article key={x.id} className="callout p-4 sm:p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Icon
                  name="message"
                  size={18}
                  className="text-[var(--acc-t)]"
                />
                <h2 className="font-semibold">{x.title}</h2>
                {x.pinned && (
                  <span className="chip chip-y">{t("annPinned")}</span>
                )}
                <span className="mu ml-auto text-xs">
                  {shortDay(x.created_at)}
                </span>
              </div>
              <p className="mt-2 whitespace-pre-wrap leading-relaxed">
                {x.body}
              </p>
            </article>
          ))}
        </section>
      )}

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="cd stat p-5">
          <p className="display text-3xl">{d ? `${pct}%` : "–"}</p>
          <p className="mu mt-1 text-sm">{t("stLessons")}</p>
          <div
            className="mt-3 h-1.5 w-full overflow-hidden rounded-full"
            style={{ background: "var(--soft)" }}
          >
            <div
              className="h-full rounded-full"
              style={{ width: pct + "%", background: "var(--pri)" }}
            />
          </div>
          <p className="mu mt-2 text-xs">
            {d ? d.done : 0} {t("of")} {d ? d.total : 0}
          </p>
        </div>

        <div className="cd stat p-5">
          <p className="display text-3xl">{d ? d.todo : "–"}</p>
          <p className="mu mt-1 text-sm">{t("stQuizzes")}</p>
          <Link
            href="/student/quizzes"
            className="pr mt-3 inline-flex items-center gap-1 text-sm font-semibold hover:underline"
          >
            {t("viewAll")}
            <Icon name="arrowRight" size={14} />
          </Link>
        </div>

        <div className={`cd stat ${d ? payTone : ""} p-5`}>
          <p className="display text-3xl">{d ? payWord : "–"}</p>
          <p className="mu mt-1 text-sm">
            {t("stPayment")} · {monthName}
          </p>
          <Link
            href="/student/payments"
            className="pr mt-3 inline-flex items-center gap-1 text-sm font-semibold hover:underline"
          >
            {d?.pay === "due" ? t("payNow") : t("navPay")}
            <Icon name="arrowRight" size={14} />
          </Link>
        </div>

        <div className="cd stat p-5">
          {d?.nextClass ? (
            <>
              <p className="display text-2xl">{short(d.nextClass.starts_at)}</p>
              <p className="mu mt-1 truncate text-sm">
                {t("stClass")} · {d.nextClass.title}
              </p>
              <div className="mt-3">
                <JoinButton cls={d.nextClass} className="btn sm" />
              </div>
            </>
          ) : (
            <>
              <p className="display text-3xl">–</p>
              <p className="mu mt-1 text-sm">{t("stClass")}</p>
              <p className="mu mt-3 text-sm">{d ? t("noClass") : "..."}</p>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {/* Continue learning */}
        <section className="cd p-5 sm:p-6">
          <h2 className="font-semibold">{t("contT")}</h2>
          {!d ? (
            <p className="mu mt-3">...</p>
          ) : !access ? (
            <div className="callout mt-3 flex items-start gap-3 p-4">
              <Icon name="lock" size={18} className="mt-0.5" />
              <p className="text-sm">{t("contLocked")}</p>
            </div>
          ) : d.next ? (
            <div
              className="mt-4 flex flex-col gap-4 rounded-md border p-4 sm:flex-row sm:items-center sm:justify-between"
              style={line}
            >
              <div className="min-w-0">
                <p className="mu text-sm">
                  {t("week")} {d.next.week || 1}
                  {d.next.week_title ? `: ${d.next.week_title}` : ""}
                </p>
                <p className="mt-0.5 text-lg font-semibold">{d.next.title}</p>
              </div>
              <Link href="/student/lessons" className="btn sm shrink-0">
                {t("openLesson")}
                <Icon name="arrowRight" size={14} />
              </Link>
            </div>
          ) : d.total > 0 ? (
            <p className="mt-3 font-semibold">{t("contAll")}</p>
          ) : (
            <p className="mu mt-3">{t("noLessonsYet")}</p>
          )}

          <h2 className="mt-8 font-semibold">{t("recentRes")}</h2>
          {!d ? (
            <p className="mu mt-3">...</p>
          ) : d.subs.length === 0 ? (
            <p className="mu mt-3">{t("noQuizYet")}</p>
          ) : (
            <ul className="mt-3 divide-y rounded-md border" style={line}>
              {d.subs.map((x) => (
                <li
                  key={x.id}
                  className="flex flex-wrap items-center justify-between gap-2 p-3"
                  style={line}
                >
                  <span className="min-w-0 flex-1 truncate font-semibold">
                    {x.quizzes?.title || "Quiz"}
                  </span>
                  {x.status === "graded" ? (
                    <span className="chip chip-g">{x.score}</span>
                  ) : (
                    <span className="chip chip-n">{t("waitingTeacher")}</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Teacher's note */}
        <section className="callout h-fit p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <Icon name="message" size={18} className="text-[var(--acc-t)]" />
            <h2 className="font-semibold">{t("noteCall")}</h2>
          </div>
          <p className="mt-3 whitespace-pre-wrap leading-relaxed">
            {profile.teacher_note || t("noNote")}
          </p>
        </section>
      </div>
    </div>
  );
}
