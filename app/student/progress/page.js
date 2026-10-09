"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { usePrefs } from "@/lib/prefs";
import { useStudent } from "@/components/StudentShell";

export default function StudentProgress() {
  const { id, profile } = useStudent();
  const { t } = usePrefs();
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

      setInfo({ lessons, opened, subs: subs || [] });
    }
    load();
  }, [id, profile.english_level]);

  if (!info) return <p className="mu font-bold">...</p>;

  const { lessons, opened, subs } = info;
  const openedCount = lessons.filter((l) => opened.has(l.id)).length;
  const line = { borderColor: "var(--ln)" };

  return (
    <div className="up space-y-6">
      <h1 className="fluid-h2 font-extrabold">{t("myProgress")}</h1>

      <div className="cd p-5 sm:p-6">
        <h2 className="pr font-extrabold">💬 {t("noteTitle")}</h2>
        <p className="mu mt-3 whitespace-pre-wrap font-semibold leading-relaxed">
          {profile.teacher_note || t("noNote")}
        </p>
      </div>

      <div className="cd p-5 sm:p-6">
        <h2 className="pr font-extrabold">📝 {t("quizResults")}</h2>
        <div className="mt-3 space-y-3">
          {subs.length === 0 && (
            <p className="mu font-semibold">{t("noQuizYet")}</p>
          )}
          {subs.map((s) => (
            <div key={s.id} className="rounded-xl border p-4" style={line}>
              <div className="flex items-center justify-between gap-3">
                <p className="min-w-0 truncate font-extrabold">
                  {s.quizzes?.title || "Quiz"}
                </p>
                {s.status === "graded" ? (
                  <span className="ok !px-3 !py-1 text-sm">
                    {t("scoreIs")}: {s.score}
                  </span>
                ) : (
                  <span className="pill mu text-xs font-extrabold">
                    {t("waitingTeacher")}
                  </span>
                )}
              </div>
              {s.feedback && (
                <p className="mu mt-2 whitespace-pre-wrap text-sm font-semibold">
                  {t("fbLabel")}: {s.feedback}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="cd p-5 sm:p-6">
        <h2 className="pr font-extrabold">
          📚 {t("lessonsOpenedT")}: {openedCount} {t("of")} {lessons.length}
        </h2>
        <div className="mt-3 space-y-2">
          {lessons.length === 0 && (
            <p className="mu font-semibold">{t("noLessonsShort")}</p>
          )}
          {lessons.map((l) => (
            <div
              key={l.id}
              className="flex items-center justify-between gap-3 rounded-xl border px-4 py-3"
              style={line}
            >
              <span className="min-w-0 truncate font-bold">{l.title}</span>
              <span
                className={`shrink-0 text-sm font-extrabold ${
                  opened.has(l.id) ? "text-green-600" : "mu"
                }`}
              >
                {opened.has(l.id) ? t("opened") : t("notOpened")}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
