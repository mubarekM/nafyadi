"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Link from "next/link";

function QuizAnswers() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.id;

  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [ready, setReady] = useState(false);

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

      // Load Quiz details
      const { data: quizData } = await supabase
        .from("quizzes")
        .select("*")
        .eq("id", quizId)
        .single();

      setQuiz(quizData);

      // Load Answers submitted by students
      const { data: answerData } = await supabase
        .from("quiz_answers")
        .select("*, profiles(full_name)")
        .eq("quiz_id", quizId)
        .order("created_at", { ascending: false });

      setAnswers(answerData || []);
      setReady(true);
    }

    start();
  }, [quizId, router]);

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-950 text-gray-300">
        Loading...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 px-4 py-8 text-gray-100">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between">
          <div>
            <Link
              href="/admin/quizzes"
              className="text-sm font-semibold text-purple-400 hover:underline"
            >
              ← Back to Quizzes
            </Link>
            <h1 className="mt-2 text-2xl font-bold text-white">
              {quiz?.title || "Quiz Answers"}
            </h1>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          {answers.length === 0 ? (
            <p className="text-gray-400">
              No students have taken this quiz yet.
            </p>
          ) : (
            answers.map((ans) => (
              <div
                key={ans.id}
                className="rounded-xl border border-gray-800 bg-gray-900 p-4"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-white">
                    {ans.profiles?.full_name || "Unknown Student"}
                  </p>
                  <span className="text-sm text-gray-400">
                    Score: {ans.score} / {ans.total}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-gray-950 text-gray-300">
          Loading...
        </main>
      }
    >
      <QuizAnswers />
    </Suspense>
  );
}
