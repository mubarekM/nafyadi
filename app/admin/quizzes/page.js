"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

const LEVELS = [
  "All levels",
  "Beginner",
  "Elementary",
  "Intermediate",
  "Upper-intermediate",
  "Advanced",
];

function newQuestion() {
  return { type: "multiple_choice", prompt: "", options: ["", "", "", ""] };
}

export default function AdminQuizzes() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [quizzes, setQuizzes] = useState([]);
  const [waiting, setWaiting] = useState({});
  const [title, setTitle] = useState("");
  const [level, setLevel] = useState("All levels");
  const [published, setPublished] = useState(false);
  const [questions, setQuestions] = useState([newQuestion()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadQuizzes(supabase) {
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
      if (s.status === "submitted") {
        counts[s.quiz_id] = (counts[s.quiz_id] || 0) + 1;
      }
    });
    setWaiting(counts);
  }

  useEffect(() => {
    async function start() {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.replace("/admin/login");
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userData.user.id)
        .single();
      if (profile?.role !== "admin") {
        router.replace("/admin/login");
        return;
      }
      await loadQuizzes(supabase);
      setReady(true);
    }
    start();
  }, [router]);

  function updateQuestion(i, field, value) {
    setQuestions((qs) =>
      qs.map((q, idx) => (idx === i ? { ...q, [field]: value } : q)),
    );
  }

  function updateOption(i, j, value) {
    setQuestions((qs) =>
      qs.map((q, idx) =>
        idx === i
          ? { ...q, options: q.options.map((o, k) => (k === j ? value : o)) }
          : q,
      ),
    );
  }

  function addQuestion() {
    setQuestions((qs) => [...qs, newQuestion()]);
  }

  function removeQuestion(i) {
    setQuestions((qs) => qs.filter((_, idx) => idx !== i));
  }

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

    if (questions.length === 0) {
      setError("Add at least one question.");
      return;
    }
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.prompt.trim()) {
        setError(`Question ${i + 1} is empty.`);
        return;
      }
      if (
        q.type === "multiple_choice" &&
        q.options.filter((o) => o.trim() !== "").length < 2
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
          ? q.options.filter((o) => o.trim() !== "")
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
    await loadQuizzes(supabase);
    setSaving(false);
  }

  async function togglePublished(qz) {
    const supabase = createClient();
    await supabase
      .from("quizzes")
      .update({ published: !qz.published })
      .eq("id", qz.id);
    await loadQuizzes(supabase);
  }

  async function removeQuiz(id) {
    if (!confirm("Delete this quiz and all student answers for it?")) return;
    const supabase = createClient();
    await supabase.from("quizzes").delete().eq("id", id);
    await loadQuizzes(supabase);
  }

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-950 text-gray-300">
        Loading...
      </main>
    );
  }

  const inputStyle =
    "w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white placeholder-gray-500 focus:border-purple-400 focus:outline-none";

  return (
    <main className="min-h-screen bg-gray-950 px-4 py-8 text-gray-100">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Quizzes</h1>
          <Link
            href="/admin/dashboard"
            className="rounded-lg border border-gray-700 px-4 py-2 text-sm hover:bg-gray-800"
          >
            ← Dashboard
          </Link>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-4 rounded-2xl border border-gray-800 bg-gray-900 p-6"
        >
          <h2 className="text-lg font-semibold text-purple-300">New quiz</h2>

          <div>
            <label className="mb-1 block text-sm text-gray-300">
              Quiz title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className={inputStyle}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-300">Level</label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className={inputStyle}
            >
              {LEVELS.map((lv) => (
                <option key={lv}>{lv}</option>
              ))}
            </select>
          </div>

          {questions.map((q, i) => (
            <div
              key={i}
              className="space-y-3 rounded-xl border border-gray-700 bg-gray-950 p-4"
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold text-purple-300">
                  Question {i + 1}
                </p>
                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeQuestion(i)}
                    className="text-sm text-red-400 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>

              <select
                value={q.type}
                onChange={(e) => updateQuestion(i, "type", e.target.value)}
                className={inputStyle}
              >
                <option value="multiple_choice">Multiple choice</option>
                <option value="true_false">True / False</option>
                <option value="fill_blank">Fill in the blank</option>
              </select>

              <textarea
                value={q.prompt}
                onChange={(e) => updateQuestion(i, "prompt", e.target.value)}
                rows={2}
                placeholder={
                  q.type === "fill_blank"
                    ? "Example: She ____ to school every day."
                    : "Type the question here"
                }
                className={inputStyle}
              />

              {q.type === "multiple_choice" && (
                <div className="space-y-2">
                  {q.options.map((o, j) => (
                    <input
                      key={j}
                      value={o}
                      onChange={(e) => updateOption(i, j, e.target.value)}
                      placeholder={`Choice ${j + 1}`}
                      className={inputStyle}
                    />
                  ))}
                </div>
              )}

              {q.type === "true_false" && (
                <p className="text-sm text-gray-400">
                  Students will choose True or False.
                </p>
              )}
              {q.type === "fill_blank" && (
                <p className="text-sm text-gray-400">
                  Students will type their own answer.
                </p>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addQuestion}
            className="rounded-lg border border-purple-500 px-4 py-2 text-sm font-semibold text-purple-300 hover:bg-gray-800"
          >
            + Add question
          </button>

          <label className="flex items-center gap-2 text-sm text-gray-200">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
            />
            Publish (students can see it)
          </label>

          {error && (
            <p className="rounded-lg bg-red-950 p-3 text-sm text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-purple-600 px-6 py-2 font-semibold text-white hover:bg-purple-500 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save quiz"}
          </button>
        </form>

        <h2 className="mt-10 text-lg font-semibold text-purple-300">
          All quizzes ({quizzes.length})
        </h2>
        <div className="mt-3 space-y-3">
          {quizzes.length === 0 && (
            <p className="text-sm text-gray-500">No quizzes yet.</p>
          )}
          {quizzes.map((qz) => (
            <div
              key={qz.id}
              className="flex flex-col gap-3 rounded-xl border border-gray-800 bg-gray-900 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold text-white">{qz.title}</p>
                <p className="text-sm text-gray-400">{qz.level}</p>
                <div className="mt-2 flex gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      qz.published
                        ? "bg-green-900 text-green-300"
                        : "bg-gray-800 text-gray-400"
                    }`}
                  >
                    {qz.published ? "published" : "draft"}
                  </span>
                  {waiting[qz.id] > 0 && (
                    <span className="rounded-full bg-yellow-900 px-3 py-1 text-xs font-semibold text-yellow-300">
                      {waiting[qz.id]} to grade
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/admin/quizzes/${qz.id}`}
                  className="rounded-lg bg-purple-700 px-3 py-2 text-sm font-semibold text-white hover:bg-purple-600"
                >
                  Answers
                </Link>
                <button
                  onClick={() => togglePublished(qz)}
                  className="rounded-lg border border-gray-700 px-3 py-2 text-sm hover:bg-gray-800"
                >
                  {qz.published ? "Unpublish" : "Publish"}
                </button>
                <button
                  onClick={() => removeQuiz(qz.id)}
                  className="rounded-lg bg-red-700 px-3 py-2 text-sm font-semibold text-white hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
