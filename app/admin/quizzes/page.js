"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

const LEVELS = [
  "All levels",
  "Beginner",
  "Elementary",
  "Intermediate",
  "Upper-intermediate",
  "Advanced",
];
const newQuestion = () => ({
  type: "multiple_choice",
  prompt: "",
  options: ["", "", "", ""],
});

export default function AdminQuizzes() {
  const [quizzes, setQuizzes] = useState(null);
  const [waiting, setWaiting] = useState({});
  const [title, setTitle] = useState("");
  const [level, setLevel] = useState("All levels");
  const [published, setPublished] = useState(false);
  const [questions, setQuestions] = useState([newQuestion()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const supabase = createClient();
    const { data } = await supabase
      .from("quizzes")
      .select("*")
      .order("created_at", { ascending: false });
    setQuizzes(data || []);

    const { data: subs } = await supabase
      .from("quiz_submissions")
      .select("quiz_id, status");
    const counts = {};
    (subs || []).forEach((s) => {
      if (s.status === "submitted")
        counts[s.quiz_id] = (counts[s.quiz_id] || 0) + 1;
    });
    setWaiting(counts);
  }

  useEffect(() => {
    load();
  }, []);

  const setQ = (i, field, value) =>
    setQuestions((qs) =>
      qs.map((q, idx) => (idx === i ? { ...q, [field]: value } : q)),
    );

  const setOpt = (i, j, value) =>
    setQuestions((qs) =>
      qs.map((q, idx) =>
        idx === i
          ? { ...q, options: q.options.map((o, k) => (k === j ? value : o)) }
          : q,
      ),
    );

  function resetForm() {
    setTitle("");
    setLevel("All levels");
    setPublished(false);
    setQuestions([newQuestion()]);
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.prompt.trim()) {
        setError(`Question ${i + 1} is empty.`);
        return;
      }
      if (
        q.type === "multiple_choice" &&
        q.options.filter((o) => o.trim()).length < 2
      ) {
        setError(`Question ${i + 1} needs at least 2 choices.`);
        return;
      }
    }

    setSaving(true);
    const supabase = createClient();
    const { data: quiz, error: quizError } = await supabase
      .from("quizzes")
      .insert({ title, level, published })
      .select()
      .single();
    if (quizError) {
      setError(quizError.message);
      setSaving(false);
      return;
    }

    const rows = questions.map((q, i) => ({
      quiz_id: quiz.id,
      position: i,
      type: q.type,
      prompt: q.prompt,
      options:
        q.type === "multiple_choice"
          ? q.options.filter((o) => o.trim())
          : q.type === "true_false"
            ? ["True", "False"]
            : null,
    }));
    const { error: qError } = await supabase
      .from("quiz_questions")
      .insert(rows);
    if (qError) {
      await supabase.from("quizzes").delete().eq("id", quiz.id);
      setError(qError.message);
      setSaving(false);
      return;
    }

    resetForm();
    await load();
    setSaving(false);
  }

  async function toggle(qz) {
    const supabase = createClient();
    await supabase
      .from("quizzes")
      .update({ published: !qz.published })
      .eq("id", qz.id);
    await load();
  }

  async function remove(id) {
    if (!confirm("Delete this quiz and all student answers for it?")) return;
    const supabase = createClient();
    await supabase.from("quizzes").delete().eq("id", id);
    await load();
  }

  if (!quizzes) return <p className="mu font-bold">...</p>;

  return (
    <div className="up">
      <h1 className="fluid-h2 font-extrabold">Quizzes</h1>

      <form onSubmit={handleSubmit} className="cd mt-6 space-y-4 p-5 sm:p-6">
        <h2 className="pr text-lg font-extrabold">New quiz</h2>

        <div>
          <label className="lbl">Quiz title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="field"
          />
        </div>

        <div>
          <label className="lbl">Level</label>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="field"
          >
            {LEVELS.map((lv) => (
              <option key={lv}>{lv}</option>
            ))}
          </select>
        </div>

        {questions.map((q, i) => (
          <div
            key={i}
            className="space-y-3 rounded-2xl border p-4"
            style={{ borderColor: "var(--ln)" }}
          >
            <div className="flex items-center justify-between">
              <p className="pr font-extrabold">Question {i + 1}</p>
              {questions.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setQuestions((qs) => qs.filter((_, idx) => idx !== i))
                  }
                  className="text-sm font-extrabold text-red-500 hover:underline"
                >
                  Remove
                </button>
              )}
            </div>

            <select
              value={q.type}
              onChange={(e) => setQ(i, "type", e.target.value)}
              className="field"
            >
              <option value="multiple_choice">Multiple choice</option>
              <option value="true_false">True / False</option>
              <option value="fill_blank">Fill in the blank</option>
            </select>

            <textarea
              value={q.prompt}
              onChange={(e) => setQ(i, "prompt", e.target.value)}
              rows={2}
              placeholder={
                q.type === "fill_blank"
                  ? "Example: She ____ to school every day."
                  : "Type the question here"
              }
              className="field"
            />

            {q.type === "multiple_choice" && (
              <div className="space-y-2">
                {q.options.map((o, j) => (
                  <input
                    key={j}
                    value={o}
                    onChange={(e) => setOpt(i, j, e.target.value)}
                    placeholder={`Choice ${j + 1}`}
                    className="field"
                  />
                ))}
              </div>
            )}
            {q.type === "true_false" && (
              <p className="mu text-sm font-bold">
                Students will choose True or False.
              </p>
            )}
            {q.type === "fill_blank" && (
              <p className="mu text-sm font-bold">
                Students will type their own answer.
              </p>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={() => setQuestions((qs) => [...qs, newQuestion()])}
          className="btn-ghost"
        >
          + Add question
        </button>

        <label className="flex items-center gap-2 font-bold">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />
          Publish (students can see it)
        </label>

        {error && <p className="err">{error}</p>}

        <button type="submit" disabled={saving} className="btn">
          {saving ? "Saving..." : "Save quiz"}
        </button>
      </form>

      <h2 className="pr mt-10 text-lg font-extrabold">
        All quizzes ({quizzes.length})
      </h2>
      <div className="mt-3 space-y-3">
        {quizzes.length === 0 && (
          <p className="mu font-semibold">No quizzes yet.</p>
        )}
        {quizzes.map((qz) => (
          <div
            key={qz.id}
            className="cd flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
          >
            <div className="min-w-0">
              <p className="truncate text-lg font-extrabold">{qz.title}</p>
              <p className="mu text-sm font-bold">{qz.level}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <span className={`chip ${qz.published ? "chip-g" : "chip-n"}`}>
                  {qz.published ? "published" : "draft"}
                </span>
                {waiting[qz.id] > 0 && (
                  <span className="chip chip-y">{waiting[qz.id]} to grade</span>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link href={`/admin/quizzes/${qz.id}`} className="btn sm">
                Answers
              </Link>
              <button onClick={() => toggle(qz)} className="btn-ghost">
                {qz.published ? "Unpublish" : "Publish"}
              </button>
              <button onClick={() => remove(qz.id)} className="btn btn-red sm">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
