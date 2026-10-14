"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Icon from "@/components/Icon";
import { PageHead, Stat, Empty, Avatar } from "@/components/ui";

function QuizAnswers() {
  const params = useParams();
  const quizId = params.id;

  const [data, setData] = useState(null);
  const [edits, setEdits] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [message, setMessage] = useState("");
  const line = { borderColor: "var(--ln)" };

  async function load() {
    const supabase = createClient();
    const { data: quiz } = await supabase
      .from("quizzes")
      .select("*")
      .eq("id", quizId)
      .single();
    const { data: questions } = await supabase
      .from("quiz_questions")
      .select("*")
      .eq("quiz_id", quizId)
      .order("position", { ascending: true });
    const { data: subs } = await supabase
      .from("quiz_submissions")
      .select("*")
      .eq("quiz_id", quizId)
      .order("submitted_at", { ascending: false });

    const names = {};
    const ids = (subs || []).map((s) => s.student_id);
    if (ids.length) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, english_level")
        .in("id", ids);
      (profiles || []).forEach((p) => {
        names[p.id] = p;
      });
    }

    const initial = {};
    (subs || []).forEach((s) => {
      initial[s.id] = { score: s.score || "", feedback: s.feedback || "" };
    });
    setEdits(initial);
    setData({ quiz, questions: questions || [], subs: subs || [], names });
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId]);

  const setEdit = (id, field, value) =>
    setEdits((e) => ({ ...e, [id]: { ...e[id], [field]: value } }));

  async function saveGrade(sub) {
    const edit = edits[sub.id];
    if (!edit.score.trim()) {
      setMessage("Please write a score first, for example 8/10.");
      return;
    }
    setMessage("");
    setSavingId(sub.id);
    const supabase = createClient();
    const { error } = await supabase
      .from("quiz_submissions")
      .update({
        score: edit.score.trim(),
        feedback: edit.feedback.trim() || null,
        status: "graded",
        graded_at: new Date().toISOString(),
      })
      .eq("id", sub.id);
    if (error) setMessage("Could not save: " + error.message);
    else await load();
    setSavingId(null);
  }

  // Deletes this answer so the student can do the quiz again
  async function allowRetake(sub, name) {
    if (
      !confirm(
        `Let ${name || "this student"} do this quiz again? Their current answers and grade will be deleted.`,
      )
    ) {
      return;
    }
    setMessage("");
    setSavingId(sub.id);
    const supabase = createClient();
    const { error } = await supabase
      .from("quiz_submissions")
      .delete()
      .eq("id", sub.id);
    if (error) setMessage("Could not do that: " + error.message);
    else await load();
    setSavingId(null);
  }

  if (!data) return <p className="mu font-semibold">...</p>;

  const { quiz, questions, subs, names } = data;
  const toGrade = subs.filter((s) => s.status !== "graded").length;

  return (
    <div className="up space-y-6">
      <div>
        <Link href="/admin/quizzes" className="btn-ghost">
          <Icon name="chevronRight" size={16} className="rotate-180" />
          Quizzes
        </Link>
      </div>
      <PageHead
        title={`Answers: ${quiz?.title || ""}`}
        sub="Read each student's answers and give a score and feedback"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat value={subs.length} label="Submissions" />
        <Stat
          value={toGrade}
          label="To grade"
          tone={toGrade > 0 ? "warn" : ""}
        />
        <Stat value={subs.length - toGrade} label="Graded" tone="ok" />
      </div>

      {message && <p className="err">{message}</p>}

      <div className="space-y-4">
        {subs.length === 0 && (
          <div className="cd">
            <Empty icon="clipboard">No student has sent answers yet.</Empty>
          </div>
        )}

        {subs.map((s) => {
          const student = names[s.student_id];
          return (
            <article key={s.id} className="cd p-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={student?.full_name} />
                  <div className="min-w-0">
                    <p className="truncate text-lg font-semibold">
                      {student?.full_name || "Student"}
                    </p>
                    <p className="mu text-sm">{student?.english_level}</p>
                  </div>
                </div>
                <span
                  className={`chip ${s.status === "graded" ? "chip-g" : "chip-y"}`}
                >
                  {s.status === "graded" ? `graded: ${s.score}` : "to grade"}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {questions.map((q, i) => (
                  <div
                    key={q.id}
                    className="rounded-md border p-3"
                    style={line}
                  >
                    <p className="mu text-sm">
                      {i + 1}. {q.prompt}
                    </p>
                    <p className="pr mt-1 font-semibold">
                      {s.answers?.[q.id] || "(no answer)"}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="lbl">Score</label>
                  <input
                    value={edits[s.id]?.score || ""}
                    onChange={(e) => setEdit(s.id, "score", e.target.value)}
                    placeholder="8/10"
                    className="field"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="lbl">Feedback for the student</label>
                  <textarea
                    value={edits[s.id]?.feedback || ""}
                    onChange={(e) => setEdit(s.id, "feedback", e.target.value)}
                    rows={2}
                    className="field"
                  />
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => saveGrade(s)}
                  disabled={savingId === s.id}
                  className="btn"
                >
                  {savingId === s.id
                    ? "Saving..."
                    : s.status === "graded"
                      ? "Update grade"
                      : "Save grade"}
                </button>
                <button
                  onClick={() => allowRetake(s, student?.full_name)}
                  disabled={savingId === s.id}
                  className="btn-ghost"
                >
                  Allow retake
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<p className="mu font-semibold">...</p>}>
      <QuizAnswers />
    </Suspense>
  );
}
