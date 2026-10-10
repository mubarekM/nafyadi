"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { usePrefs } from "@/lib/prefs";
import { useStudent, lvLabel, fmtDate } from "@/components/StudentShell";

const TILES = [
  ["/student/lessons", "navLessons", "dLessons", "📚"],
  ["/student/quizzes", "navQuizzes", "dQuizzes", "📝"],
  ["/student/progress", "navProgress", "dProgress", "📈"],
  ["/student/live-class", "navLive", "dLive", "🎥"],
  ["/student/discussion", "navChat", "dChat", "💬"],
  ["/student/payments", "navPay", "dPay", "💳"],
];

export default function StudentHome() {
  const { id, profile } = useStudent();
  const { t, lang } = usePrefs();
  const [d, setD] = useState(null);

  const loc = lang === "am" ? "am-ET" : lang === "om" ? "om-ET" : "en-US";
  const today = new Date();
  const ym = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  const monthName = today.toLocaleDateString(loc, {
    year: "numeric",
    month: "long",
  });

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const since = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      const mine = (x) =>
        x.level === "All levels" || x.level === profile.english_level;

      const [c, l, v, s, p] = await Promise.all([
        supabase
          .from("live_classes")
          .select("*")
          .gte("starts_at", since)
          .order("starts_at", { ascending: true })
          .limit(20),
        supabase
          .from("lessons")
          .select("id, title, level")
          .eq("published", true)
          .order("created_at", { ascending: false }),
        supabase.from("lesson_views").select("lesson_id").eq("student_id", id),
        supabase
          .from("quiz_submissions")
          .select("*, quizzes(title)")
          .eq("student_id", id)
          .order("submitted_at", { ascending: false })
          .limit(3),
        supabase
          .from("payments")
          .select("month, status")
          .eq("student_id", id)
          .eq("month", ym),
      ]);

      const lessons = (l.data || []).filter(mine);
      const opened = new Set((v.data || []).map((x) => x.lesson_id));
      const pays = p.data || [];
      setD({
        nextClass: (c.data || []).filter(mine)[0] || null,
        latest: lessons[0] || null,
        total: lessons.length,
        done: lessons.filter((x) => opened.has(x.id)).length,
        subs: s.data || [],
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

  return (
    <div className="space-y-6">
      <section className="grad up rounded-3xl p-6 text-white sm:p-8">
        <p className="text-sm font-bold text-white/80">{t("welcome")}</p>
        <h1 className="fluid-h2 mt-1 font-extrabold">{profile.full_name}</h1>
        <p className="mt-3 inline-block rounded-full bg-white/20 px-3 py-1 text-sm font-extrabold">
          {t("levelIs")}: {lvLabel(t, profile.english_level)}
        </p>
        <div className="mt-6">
          <div className="flex justify-between text-sm font-bold">
            <span>{t("lessonsDone")}</span>
            <span>
              {d ? d.done : 0} {t("of")} {d ? d.total : 0}
            </span>
          </div>
          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-white/25">
            <div
              className="h-full rounded-full bg-white"
              style={{ width: pct + "%" }}
            />
          </div>
        </div>
      </section>

      {d && (
        <section className="cd flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="min-w-0">
            <p className="font-extrabold">💳 {t("dueTitle")}</p>
            <span
              className={`chip mt-2 ${
                d.pay === "paid"
                  ? "chip-g"
                  : d.pay === "review"
                    ? "chip-y"
                    : "chip-r"
              }`}
            >
              {d.pay === "paid"
                ? `${t("duePaid")} ${monthName}`
                : d.pay === "review"
                  ? t("dueReview")
                  : `${t("dueDue")} ${monthName}`}
            </span>
          </div>
          <Link
            href="/student/payments"
            className={d.pay === "due" ? "btn sm" : "btn-ghost"}
          >
            {d.pay === "due" ? t("payNow") : t("navPay")}
          </Link>
        </section>
      )}

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {TILES.map(([href, k, dk, icon]) => (
          <Link key={href} href={href} className="cd lift p-4 sm:p-5">
            <span className="text-3xl">{icon}</span>
            <p className="mt-3 font-extrabold">{t(k)}</p>
            <p className="mu mt-1 text-sm font-semibold">{t(dk)}</p>
          </Link>
        ))}
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        <div className="cd p-5 sm:p-6">
          <h2 className="pr font-extrabold">🔴 {t("nextClass")}</h2>
          {!d ? (
            <p className="mu mt-3 font-semibold">...</p>
          ) : d.nextClass ? (
            <>
              <p className="mt-3 text-lg font-extrabold">{d.nextClass.title}</p>
              <p className="mu mt-1 font-bold">
                {fmtDate(lang, d.nextClass.starts_at)}
              </p>
              <a
                href={d.nextClass.meeting_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn mt-4"
              >
                {t("joinClass")}
              </a>
            </>
          ) : (
            <p className="mu mt-3 font-semibold">{t("noClass")}</p>
          )}
        </div>

        <div className="cd p-5 sm:p-6">
          <h2 className="pr font-extrabold">📚 {t("latestLesson")}</h2>
          {!d ? (
            <p className="mu mt-3 font-semibold">...</p>
          ) : d.latest ? (
            <>
              <p className="mt-3 text-lg font-extrabold">{d.latest.title}</p>
              <p className="mu mt-1 font-bold">{lvLabel(t, d.latest.level)}</p>
              <Link href="/student/lessons" className="btn mt-4">
                {t("openLesson")}
              </Link>
            </>
          ) : (
            <p className="mu mt-3 font-semibold">{t("noLessonsYet")}</p>
          )}
        </div>

        <div className="cd p-5 sm:p-6">
          <div className="flex items-center justify-between gap-2">
            <h2 className="pr font-extrabold">📝 {t("recentQuiz")}</h2>
            <Link
              href="/student/quizzes"
              className="pr shrink-0 text-sm font-extrabold hover:underline"
            >
              {t("viewAll")}
            </Link>
          </div>
          <div className="mt-3 space-y-2">
            {!d ? (
              <p className="mu font-semibold">...</p>
            ) : d.subs.length === 0 ? (
              <p className="mu font-semibold">{t("noQuizYet")}</p>
            ) : (
              d.subs.map((s) => (
                <div
                  key={s.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-xl border px-4 py-3"
                  style={{ borderColor: "var(--ln)" }}
                >
                  <span className="min-w-0 flex-1 truncate font-bold">
                    {s.quizzes?.title || "Quiz"}
                  </span>
                  {s.status === "graded" ? (
                    <span className="ok !px-3 !py-1 text-sm">{s.score}</span>
                  ) : (
                    <span className="pill mu text-xs font-extrabold">
                      {t("waitingTeacher")}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="cd p-5 sm:p-6">
          <h2 className="pr font-extrabold">💬 {t("noteTitle")}</h2>
          <p className="mu mt-3 whitespace-pre-wrap font-semibold leading-relaxed">
            {profile.teacher_note || t("noNote")}
          </p>
        </div>
      </section>
    </div>
  );
}
