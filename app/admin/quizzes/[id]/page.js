"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function QuizAnswers() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.id;

  const [ready, setReady] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [subs, setSubs] = useState([]);
  const [names, setNames] = useState({});
  const [edits, setEdits] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [message, setMessage] = useState("");

  async function loadData(supabase) {
    const { data: qz } = await supabase
      .from("quizzes")
      .select("*")
      .eq("id", quizId)
      .single();
    setQuiz(qz);

    const { data: qs } = await supabase
      .from("quiz_questions")
      .select("*")
      .eq("quiz_id", quizId)
      .order("position", { ascending: true });
    setQuestions(qs || []);

    const { data: submissions } = await supabase
      .from("quiz_submissions")
      .select("*")
      .eq("quiz_id", quizId)
      .order("submitted_at", { ascending: false });
    setSubs(submissions || []);

    const ids = (submissions || []).map((s) => s.student_id);
    if (ids.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, english_level")
        .in("id", ids);
      const map = {};
      (profiles || []).forEach((p) => {
        map[p.id] = p;
      });
      setNames(map);
    }

    const initial = {};
    (submissions || []).forEach((s) => {
      initial[s.id] = { score: s.score || "", feedback: s.feedback || "" };
    });
    setEdits(initial);
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
      await loadData(supabase);
      setReady(true);
    }
    start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  function setEdit(id, field, value) {
    setEdits((e) => ({ ...e, [id]: { ...e[id], [field]: value } }));
  }

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
    if (error) {
      setMessage("Could not save: " + error.message);
    } else {
      await loadData(supabase);
    }
    setSavingId(null);
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
          <h1 className="text-2xl font-bold text-white">
            Answers: {quiz?.title}
          </h1>
          <Link
            href="/admin/quizzes"
            className="rounded-lg border border-gray-700 px-4 py-2 text-sm hover:bg-gray-800"
          >
            ← Quizzes
          </Link>
        </div>

        {message && (
          <p className="mt-4 rounded-lg bg-red-950 p-3 text-sm text-red-300">
            {message}
          </p>
        )}

        <div className="mt-6 space-y-6">
          {subs.length === 0 && (
            <p className="text-sm text-gray-500">
              No student has sent answers yet.
            </p>
          )}

          {subs.map((s) => {
            const student = names[s.student_id];
            return (
              <div
                key={s.id}
                className="rounded-2xl border border-gray-800 bg-gray-900 p-5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold text-white">
                      {student?.full_name || "Student"}
                    </p>
                    <p className="text-sm text-gray-400">
                      {student?.english_level}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      s.status === "graded"
                        ? "bg-green-900 text-green-300"
                        : "bg-yellow-900 text-yellow-300"
                    }`}
                  >
                    {s.status === "graded" ? `graded: ${s.score}` : "to grade"}
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {questions.map((q, i) => (
                    <div
                      key={q.id}
                      className="rounded-lg border border-gray-800 bg-gray-950 p-3"
                    >
                      <p className="text-sm text-gray-400">
                        {i + 1}. {q.prompt}
                      </p>
                      <p className="mt-1 font-semibold text-purple-300">
                        {s.answers?.[q.id] || "(no answer)"}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-sm text-gray-300">
                      Score
                    </label>
                    <input
                      value={edits[s.id]?.score || ""}
                      onChange={(e) => setEdit(s.id, "score", e.target.value)}
                      placeholder="8/10"
                      className={inputStyle}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-sm text-gray-300">
                      Feedback for the student
                    </label>
                    <textarea
                      value={edits[s.id]?.feedback || ""}
                      onChange={(e) =>
                        setEdit(s.id, "feedback", e.target.value)
                      }
                      rows={2}
                      className={inputStyle}
                    />
                  </div>
                </div>

                <button
                  onClick={() => saveGrade(s)}
                  disabled={savingId === s.id}
                  className="mt-4 rounded-lg bg-purple-600 px-6 py-2 font-semibold text-white hover:bg-purple-500 disabled:opacity-60"
                >
                  {savingId === s.id
                    ? "Saving..."
                    : s.status === "graded"
                      ? "Update grade"
                      : "Save grade"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
