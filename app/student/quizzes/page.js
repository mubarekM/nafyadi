"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function StudentQuizzes() {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [quizzes, setQuizzes] = useState(null);
  const [subs, setSubs] = useState({});
  const [selected, setSelected] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function loadSubs(supabase, uid) {
    const { data } = await supabase
      .from("quiz_submissions")
      .select("*")
      .eq("student_id", uid);
    const map = {};
    (data || []).forEach((s) => {
      map[s.quiz_id] = s;
    });
    setSubs(map);
  }

  useEffect(() => {
    async function start() {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.replace("/login");
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("status, role, english_level")
        .eq("id", userData.user.id)
        .single();
      if (
        !profile ||
        profile.status !== "approved" ||
        profile.role !== "student"
      ) {
        await supabase.auth.signOut();
        router.replace("/login");
        return;
      }
      setUserId(userData.user.id);

      const { data } = await supabase
        .from("quizzes")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });
      const mine = (data || []).filter(
        (q) => q.level === "All levels" || q.level === profile.english_level,
      );
      setQuizzes(mine);
      await loadSubs(supabase, userData.user.id);
    }
    start();
  }, [router]);

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
        setError("Please answer every question before sending.");
        return;
      }
    }
    if (!confirm("Send your answers? You cannot change them after sending."))
      return;

    setSending(true);
    const supabase = createClient();
    const { error: insertError } = await supabase
      .from("quiz_submissions")
      .insert({
        quiz_id: selected.id,
        student_id: userId,
        answers,
      });
    if (insertError) {
      setError("Could not send your answers: " + insertError.message);
      setSending(false);
      return;
    }
    await loadSubs(supabase, userId);
    setSending(false);
  }

  if (!quizzes) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-purple-50 text-gray-700">
        Loading...
      </main>
    );
  }

  const sub = selected ? subs[selected.id] : null;

  return (
    <main className="min-h-screen bg-purple-50 text-gray-900">
      <header className="flex items-center justify-between border-b border-purple-100 bg-white px-6 py-4">
        <h1 className="text-xl font-bold text-purple-700">
          English with Nafyad
        </h1>
        <Link
          href="/student"
          className="rounded-full border border-purple-300 px-4 py-2 text-sm font-semibold text-purple-700 hover:bg-purple-50"
        >
          ← Home
        </Link>
      </header>

      <section className="mx-auto max-w-3xl px-6 py-10">
        {!selected ? (
          <>
            <h2 className="text-3xl font-extrabold">Your quizzes</h2>
            <div className="mt-6 space-y-3">
              {quizzes.length === 0 && (
                <p className="text-gray-600">
                  No quizzes yet. Check back soon!
                </p>
              )}
              {quizzes.map((q) => {
                const s = subs[q.id];
                return (
                  <button
                    key={q.id}
                    onClick={() => openQuiz(q)}
                    className="block w-full rounded-2xl bg-white p-5 text-left shadow hover:shadow-md"
                  >
                    <p className="text-lg font-bold text-purple-700">
                      {q.title}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">{q.level}</p>
                    <span
                      className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                        !s
                          ? "bg-purple-100 text-purple-700"
                          : s.status === "graded"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {!s
                        ? "Not done yet"
                        : s.status === "graded"
                          ? `Graded: ${s.score}`
                          : "Sent, waiting for your teacher"}
                    </span>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <>
            <button
              onClick={() => setSelected(null)}
              className="text-sm font-semibold text-purple-600 hover:underline"
            >
              ← All quizzes
            </button>
            <h2 className="mt-4 text-3xl font-extrabold">{selected.title}</h2>

            {sub && (
              <div
                className={`mt-6 rounded-2xl p-5 ${
                  sub.status === "graded" ? "bg-green-100" : "bg-yellow-100"
                }`}
              >
                {sub.status === "graded" ? (
                  <>
                    <p className="text-lg font-bold text-green-800">
                      Your score: {sub.score}
                    </p>
                    {sub.feedback && (
                      <p className="mt-2 whitespace-pre-wrap text-green-900">
                        Teacher's feedback: {sub.feedback}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="font-semibold text-yellow-800">
                    Your answers were sent. Your teacher will check them soon.
                  </p>
                )}
              </div>
            )}

            <form onSubmit={submitQuiz} className="mt-6 space-y-5">
              {questions.map((q, i) => (
                <div key={q.id} className="rounded-2xl bg-white p-6 shadow">
                  <p className="font-semibold">
                    {i + 1}. {q.prompt}
                  </p>

                  <div className="mt-3 space-y-2">
                    {(q.type === "multiple_choice" ||
                      q.type === "true_false") &&
                      (q.options || []).map((opt) => (
                        <label
                          key={opt}
                          className="flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-2"
                        >
                          <input
                            type="radio"
                            name={q.id}
                            value={opt}
                            disabled={!!sub}
                            checked={
                              (sub ? sub.answers[q.id] : answers[q.id]) === opt
                            }
                            onChange={() =>
                              setAnswers((a) => ({ ...a, [q.id]: opt }))
                            }
                          />
                          {opt}
                        </label>
                      ))}

                    {q.type === "fill_blank" && (
                      <input
                        type="text"
                        disabled={!!sub}
                        value={
                          sub ? sub.answers[q.id] || "" : answers[q.id] || ""
                        }
                        onChange={(e) =>
                          setAnswers((a) => ({ ...a, [q.id]: e.target.value }))
                        }
                        placeholder="Type your answer"
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none disabled:bg-gray-100"
                      />
                    )}
                  </div>
                </div>
              ))}

              {error && (
                <p className="rounded-lg bg-red-100 p-3 text-sm text-red-700">
                  {error}
                </p>
              )}

              {!sub && (
                <button
                  type="submit"
                  disabled={sending}
                  className="rounded-full bg-purple-600 px-8 py-3 font-semibold text-white hover:bg-purple-700 disabled:opacity-60"
                >
                  {sending ? "Sending..." : "Send my answers"}
                </button>
              )}
            </form>
          </>
        )}
      </section>
    </main>
  );
}
