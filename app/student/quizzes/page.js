"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { usePrefs } from "@/lib/prefs";
import { useStudent, lvLabel } from "@/components/StudentShell";
import LockedCard from "@/components/LockedCard";
import Icon from "@/components/Icon";
import { PageHead, Stat, Empty } from "@/components/ui";

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
  if (!quizzes) return <p className="mu font-semibold">...</p>;

  const line = { borderColor: "var(--ln)" };

  /* ===== List of quizzes ===== */
  if (!selected) {
    const graded = quizzes.filter(
      (q) => subs[q.id]?.status === "graded",
    ).length;
    const waiting = quizzes.filter(
      (q) => subs[q.id]?.status === "submitted",
    ).length;
    const todo = quizzes.filter((q) => !subs[q.id]).length;

    return (
      <div className="up space-y-6">
        <PageHead title={t("yourQuizzes")} sub={t("subQuizzes")} />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Stat value={quizzes.length} label={t("psTotal")} />
          <Stat
            value={todo}
            label={t("stQuizzes")}
            tone={todo > 0 ? "warn" : "ok"}
          />
          <Stat value={waiting} label={t("psWaiting")} />
          <Stat value={graded} label={t("psGraded")} tone="ok" />
        </div>

        <section className="cd overflow-hidden">
          {quizzes.length === 0 ? (
            <Empty icon="clipboard">{t("noQuizzes")}</Empty>
          ) : (
            <ul className="divide-y" style={line}>
              {quizzes.map((q) => {
                const s = subs[q.id];
                return (
                  <li key={q.id} style={line}>
                    <button
                      onClick={() => openQuiz(q)}
                      className="flex w-full flex-wrap items-center justify-between gap-3 p-4 text-left hover:bg-[var(--soft)]"
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <span
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md"
                          style={{
                            background: "var(--brand-soft)",
                            color: "var(--pri)",
                          }}
                        >
                          <Icon name="clipboard" size={20} />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-semibold">
                            {q.title}
                          </span>
                          <span className="mu block text-sm">
                            {lvLabel(t, q.level)}
                          </span>
                        </span>
                      </span>
                      <span className="flex shrink-0 items-center gap-2">
                        <span
                          className={`chip ${
                            !s
                              ? "chip-n"
                              : s.status === "graded"
                                ? "chip-g"
                                : "chip-y"
                          }`}
                        >
                          {!s
                            ? t("notDone")
                            : s.status === "graded"
                              ? `${t("gradedScore")}: ${s.score}`
                              : t("sentWaiting")}
                        </span>
                        <Icon name="chevronRight" size={18} className="mu" />
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    );
  }

  /* ===== One quiz ===== */
  const sub = subs[selected.id];

  return (
    <div className="up space-y-6">
      <div>
        <button onClick={() => setSelected(null)} className="btn-ghost">
          <Icon name="chevronRight" size={16} className="rotate-180" />
          {t("allQuizzes")}
        </button>
      </div>
      <PageHead title={selected.title} sub={lvLabel(t, selected.level)} />

      {sub && (
        <div className="callout flex items-start gap-3 p-5">
          <Icon
            name={sub.status === "graded" ? "checkCircle" : "clock"}
            size={20}
            className="mt-0.5 text-[var(--pri)]"
          />
          <div>
            {sub.status === "graded" ? (
              <>
                <p className="text-lg font-semibold">
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
        </div>
      )}

      <form onSubmit={submitQuiz} className="space-y-4">
        {questions.map((q, i) => {
          const current = sub ? sub.answers?.[q.id] : answers[q.id];
          return (
            <section key={q.id} className="cd p-5">
              <p className="font-semibold">
                <span className="mu mr-2">{i + 1}.</span>
                {q.prompt}
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
                        className="flex cursor-pointer items-center gap-3 rounded-md border px-4 py-3"
                        style={{
                          borderColor: checked ? "var(--pri)" : "var(--ln)",
                          background: checked
                            ? "var(--brand-soft)"
                            : "transparent",
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
            </section>
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
