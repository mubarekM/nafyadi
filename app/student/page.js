"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { usePrefs } from "@/lib/prefs";
import { useStudent, lvLabel, fmtDate } from "@/components/StudentShell";

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

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const since = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      const mine = (x) =>
        x.level === "All levels" || x.level === profile.english_level;

      const [c, l, v, q, s, p] = await Promise.all([
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
        subs: subs.slice(0, 3),
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
    <div className="space-y-5">
      {/* Greeting */}
      <section className="grad up rounded-3xl p-6 text-white sm:p-8">
        <p className="text-sm font-bold text-white/80">{t("welcome")}</p>
        <h2 className="mt-1 break-words text-3xl font-extrabold sm:text-4xl">
          {profile.full_name}
        </h2>
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

      <div className="grid gap-5 md:grid-cols-2">
        {/* Payment */}
        <div className="cd p-5 sm:p-6">
          <h3 className="pr font-extrabold">💳 {t("dueTitle")}</h3>
          {!d ? (
            <p className="mu mt-3 font-semibold">...</p>
          ) : (
            <>
              <span
                className={`chip mt-3 ${
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
              <div className="mt-4">
                <Link
                  href="/student/payments"
                  className={
                    d.pay === "due" ? "btn sm" : "btn-ghost inline-block"
                  }
                >
                  {d.pay === "due" ? t("payNow") : t("navPay")}
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Next live class */}
        <div className="cd p-5 sm:p-6">
          <h3 className="pr font-extrabold">🔴 {t("nextClass")}</h3>
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
                className="btn sm mt-4"
              >
                {t("joinClass")}
              </a>
            </>
          ) : (
            <p className="mu mt-3 font-semibold">{t("noClass")}</p>
          )}
        </div>

        {/* Continue learning */}
        <div className="cd p-5 sm:p-6">
          <h3 className="pr font-extrabold">📚 {t("contT")}</h3>
          {!d ? (
            <p className="mu mt-3 font-semibold">...</p>
          ) : !access ? (
            <p className="mu mt-3 font-semibold">{t("contLocked")}</p>
          ) : d.next ? (
            <>
              <p className="mu mt-3 text-sm font-bold">
                {t("week")} {d.next.week || 1}
                {d.next.week_title ? `: ${d.next.week_title}` : ""}
              </p>
              <p className="text-lg font-extrabold">{d.next.title}</p>
              <Link href="/student/lessons" className="btn sm mt-4">
                {t("openLesson")}
              </Link>
            </>
          ) : d.total > 0 ? (
            <p className="mt-3 font-extrabold">{t("contAll")}</p>
          ) : (
            <p className="mu mt-3 font-semibold">{t("noLessonsYet")}</p>
          )}
        </div>

        {/* Quizzes */}
        <div className="cd p-5 sm:p-6">
          <div className="flex items-center justify-between gap-2">
            <h3 className="pr font-extrabold">📝 {t("navQuizzes")}</h3>
            <Link
              href="/student/quizzes"
              className="pr shrink-0 text-sm font-extrabold hover:underline"
            >
              {t("viewAll")}
            </Link>
          </div>
          {!d ? (
            <p className="mu mt-3 font-semibold">...</p>
          ) : (
            <>
              <p className="mt-3 font-extrabold">
                {d.todo > 0 ? `${d.todo} ${t("quizTodo")}` : t("quizAllDone")}
              </p>
              <div className="mt-3 space-y-2">
                {d.subs.map((x) => (
                  <div
                    key={x.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl border px-4 py-3"
                    style={{ borderColor: "var(--ln)" }}
                  >
                    <span className="min-w-0 flex-1 truncate font-bold">
                      {x.quizzes?.title || "Quiz"}
                    </span>
                    {x.status === "graded" ? (
                      <span className="ok !px-3 !py-1 text-sm">{x.score}</span>
                    ) : (
                      <span className="pill mu text-xs font-extrabold">
                        {t("waitingTeacher")}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Teacher's note */}
      <div className="cd p-5 sm:p-6">
        <h3 className="pr font-extrabold">💬 {t("noteTitle")}</h3>
        <p className="mu mt-3 whitespace-pre-wrap font-semibold leading-relaxed">
          {profile.teacher_note || t("noNote")}
        </p>
      </div>
    </div>
  );
}
