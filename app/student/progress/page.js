"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function StudentProgress() {
  const router = useRouter();
  const [info, setInfo] = useState(null);

  useEffect(() => {
    async function start() {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.replace("/login");
        return;
      }
      const uid = userData.user.id;

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", uid)
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
        .eq("student_id", uid);
      const opened = new Set((views || []).map((v) => v.lesson_id));

      const { data: subs } = await supabase
        .from("quiz_submissions")
        .select("*, quizzes(title)")
        .eq("student_id", uid)
        .order("submitted_at", { ascending: false });

      setInfo({ profile, lessons, opened, subs: subs || [] });
    }
    start();
  }, [router]);

  if (!info) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-purple-50 text-gray-700">
        Loading...
      </main>
    );
  }

  const { profile, lessons, opened, subs } = info;
  const openedCount = lessons.filter((l) => opened.has(l.id)).length;

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
        <h2 className="text-3xl font-extrabold">My Progress</h2>

        <div className="mt-6 rounded-2xl bg-white p-6 shadow">
          <h3 className="text-lg font-bold text-purple-700">
            A note from your teacher
          </h3>
          <p className="mt-2 whitespace-pre-wrap text-gray-700">
            {profile.teacher_note || "No note yet."}
          </p>
        </div>

        <div className="mt-6 rounded-2xl bg-white p-6 shadow">
          <h3 className="text-lg font-bold text-purple-700">Quiz results</h3>
          <div className="mt-3 space-y-3">
            {subs.length === 0 && (
              <p className="text-sm text-gray-600">
                You have not done any quiz yet.
              </p>
            )}
            {subs.map((s) => (
              <div key={s.id} className="rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{s.quizzes?.title || "Quiz"}</p>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      s.status === "graded"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {s.status === "graded"
                      ? `Score: ${s.score}`
                      : "Waiting for teacher"}
                  </span>
                </div>
                {s.feedback && (
                  <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
                    Feedback: {s.feedback}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-white p-6 shadow">
          <h3 className="text-lg font-bold text-purple-700">
            Lessons opened: {openedCount} of {lessons.length}
          </h3>
          <div className="mt-3 space-y-2">
            {lessons.length === 0 && (
              <p className="text-sm text-gray-600">No lessons yet.</p>
            )}
            {lessons.map((l) => (
              <div
                key={l.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-2"
              >
                <span>{l.title}</span>
                <span
                  className={`text-sm font-semibold ${
                    opened.has(l.id) ? "text-green-600" : "text-gray-400"
                  }`}
                >
                  {opened.has(l.id) ? "✓ Opened" : "Not opened"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
