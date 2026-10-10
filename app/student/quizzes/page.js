"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { usePrefs } from "@/lib/prefs";
import { useStudent, lvLabel } from "@/components/StudentShell";
import LockedCard from "@/components/LockedCard";

export default function StudentQuizzes() {
  const { id, profile, access } = useStudent();
  const { t } = usePrefs();
  const [quizzes, setQuizzes] = useState(null);
  const [subs, setSubs] = useState({});
  const [selected, setSelected] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function loadSubs(supabase) {
    const { data } = await supabase
      .from("quiz_submissions")
      .select("*")
      .eq("student_id", id);
    const map = {};
    (data || []).forEach((s) => {
      map[s.quiz_id] = s;
    });
    setSubs(map);
  }

  useEffect(() => {
    if (!access) return;
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("quizzes")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });
      setQuizzes(
        (data || []).filter(
          (q) => q.level === "All levels" || q.level === profile.english_level,
        ),
      );
      await loadSubs(supabase);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.english_level, access]);

  async function openQuiz(quiz) {
    setError("");
    setAnswers({});
    const supabase = createClient();
    const { data } = await supabase
      .from("quiz_questions")
      .select("*")
      .eq("quiz_id", quiz.id)
      .order("position", { ascending: true });
    setQuestions(data || []);
    setSelected(quiz);
    window.scrollTo({ top: 0 });
  }

  async function submitQuiz(e) {
    e.preventDefault();
    setError("");
    for (const q of questions) {
      if (!answers[q.id] || !String(answers[q.id]).trim()) {
        setError(t("answerAll"));
        return;
      }
    }
    if (!confirm(t("confirmSend"))) return;

    setSending(true);
    const supabase = createClient();
    const { error: insertError } = await supabase
      .from("quiz_submissions")
      .insert({ quiz_id: selected.id, student_id: id, answers });
    if (insertError) {
      setError(t("couldNotSend") + insertError.message);
      setSending(false);
      return;
    }
    await loadSubs(supabase);
    setSending(false);
  }

  if (!access) return <LockedCard />;
  if (!quizzes) return <p className="mu font-bold">...</p>;

  if (!selected) {
    return (
      <div className="up">
        <h1 className="fluid-h2 font-extrabold">{t("yourQuizzes")}</h1>
        <div className="mt-6 space-y-3">
          {quizzes.length === 0 && (
            <p className="mu font-semibold">{t("noQuizzes")}</p>
          )}
          {quizzes.map((q) => {
            const s = subs[q.id];
            return (
              <button
                key={q.id}
                onClick={() => openQuiz(q)}
                className="cd lift block w-full p-5 text-left"
              >
                <p className="pr text-lg font-extrabold">{q.title}</p>
                <p className="mu mt-1 text-sm font-bold">
                  {lvLabel(t, q.level)}
                </p>
                <span
                  className={`mt-3 inline-block text-xs font-extrabold ${
                    s?.status === "graded" ? "ok !px-3 !py-1" : "pill mu"
                  }`}
                >
                  {!s
                    ? t("notDone")
                    : s.status === "graded"
                      ? `${t("gradedScore")}: ${s.score}`
                      : t("sentWaiting")}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const sub = subs[selected.id];

  return (
    <div className="up">
      <button
        onClick={() => setSelected(null)}
        className="pr text-sm font-extrabold hover:underline"
      >
        ← {t("allQuizzes")}
      </button>
      <h1 className="fluid-h2 mt-4 font-extrabold">{selected.title}</h1>

      {sub && (
        <div className="ok mt-6">
          {sub.status === "graded" ? (
            <>
              <p className="text-lg font-extrabold">
                {t("yourScore")}: {sub.score}
              </p>
              {sub.feedback && (
                <p className="mt-2 whitespace-pre-wrap">
                  {t("fbLabel")}: {sub.feedback}
                </p>
              )}
            </>
          ) : (
            <p>{t("answersSent")}</p>
          )}
        </div>
      )}

      <form onSubmit={submitQuiz} className="mt-6 space-y-5">
        {questions.map((q, i) => {
          const current = sub ? sub.answers?.[q.id] : answers[q.id];
          return (
            <div key={q.id} className="cd p-5 sm:p-6">
              <p className="font-extrabold">
                {i + 1}. {q.prompt}
              </p>
              <div className="mt-3 space-y-2">
                {(q.type === "multiple_choice" || q.type === "true_false") &&
                  (q.options || []).map((opt) => {
                    const label =
                      q.type === "true_false"
                        ? opt === "True"
                          ? t("trueT")
                          : opt === "False"
                            ? t("falseT")
                            : opt
                        : opt;
                    const checked = current === opt;
                    return (
                      <label
                        key={opt}
                        className="flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 font-bold"
                        style={{
                          borderColor: checked ? "var(--pri)" : "var(--ln)",
                          background: checked ? "var(--soft)" : "transparent",
                        }}
                      >
                        <input
                          type="radio"
                          name={q.id}
                          value={opt}
                          disabled={!!sub}
                          checked={checked}
                          onChange={() =>
                            setAnswers((a) => ({ ...a, [q.id]: opt }))
                          }
                        />
                        <span className="min-w-0 break-words">{label}</span>
                      </label>
                    );
                  })}

                {q.type === "fill_blank" && (
                  <input
                    type="text"
                    disabled={!!sub}
                    value={current || ""}
                    onChange={(e) =>
                      setAnswers((a) => ({ ...a, [q.id]: e.target.value }))
                    }
                    placeholder={t("typeAnswer")}
                    className="field"
                  />
                )}
              </div>
            </div>
          );
        })}

        {error && <p className="err">{error}</p>}

        {!sub && (
          <button
            type="submit"
            disabled={sending}
            className="btn w-full sm:w-auto"
          >
            {sending ? t("sending") : t("sendAnswers")}
          </button>
        )}
      </form>
    </div>
  );
}
