"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

// Turn a normal YouTube link into an embeddable one
function getEmbedUrl(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    let id = null;
    if (u.hostname.includes("youtu.be")) id = u.pathname.slice(1);
    else if (u.searchParams.get("v")) id = u.searchParams.get("v");
    else if (u.pathname.startsWith("/embed/")) id = u.pathname.split("/")[2];
    else if (u.pathname.startsWith("/shorts/")) id = u.pathname.split("/")[2];
    return id ? `https://www.youtube.com/embed/${id}` : null;
  } catch {
    return null;
  }
}

function isAudio(name) {
  return /\.(mp3|wav|m4a|ogg|aac)$/i.test(name || "");
}

export default function StudentLessons() {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [lessons, setLessons] = useState(null);
  const [selected, setSelected] = useState(null);

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
        .from("lessons")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });

      // Show lessons for the student's level and for "All levels"
      const mine = (data || []).filter(
        (l) => l.level === "All levels" || l.level === profile.english_level,
      );
      setLessons(mine);
    }
    start();
  }, [router]);

  async function openLesson(l) {
    setSelected(l);
    window.scrollTo({ top: 0 });
    if (userId) {
      const supabase = createClient();
      await supabase
        .from("lesson_views")
        .upsert(
          { student_id: userId, lesson_id: l.id },
          { onConflict: "student_id,lesson_id", ignoreDuplicates: true },
        );
    }
  }

  if (!lessons) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-purple-50 text-gray-700">
        Loading...
      </main>
    );
  }

  const embed = selected ? getEmbedUrl(selected.video_url) : null;

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
            <h2 className="text-3xl font-extrabold">Your lessons</h2>
            <div className="mt-6 space-y-3">
              {lessons.length === 0 && (
                <p className="text-gray-600">
                  No lessons yet. Check back soon!
                </p>
              )}
              {lessons.map((l) => (
                <button
                  key={l.id}
                  onClick={() => openLesson(l)}
                  className="block w-full rounded-2xl bg-white p-5 text-left shadow hover:shadow-md"
                >
                  <p className="text-lg font-bold text-purple-700">{l.title}</p>
                  <p className="mt-1 text-sm text-gray-600">{l.level}</p>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <button
              onClick={() => setSelected(null)}
              className="text-sm font-semibold text-purple-600 hover:underline"
            >
              ← All lessons
            </button>
            <h2 className="mt-4 text-3xl font-extrabold">{selected.title}</h2>
            <p className="mt-1 text-sm text-gray-600">{selected.level}</p>

            {embed && (
              <div className="mt-6 aspect-video overflow-hidden rounded-2xl bg-black">
                <iframe
                  src={embed}
                  title={selected.title}
                  className="h-full w-full"
                  allowFullScreen
                />
              </div>
            )}

            {selected.content && (
              <div className="mt-6 whitespace-pre-wrap rounded-2xl bg-white p-6 leading-relaxed shadow">
                {selected.content}
              </div>
            )}

            {selected.file_url && (
              <div className="mt-6 rounded-2xl bg-white p-6 shadow">
                <p className="mb-3 font-semibold text-purple-700">
                  {selected.file_name || "Lesson file"}
                </p>
                {isAudio(selected.file_name) ? (
                  <audio controls src={selected.file_url} className="w-full" />
                ) : (
                  <a
                    href={selected.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block rounded-full bg-purple-600 px-6 py-2 font-semibold text-white hover:bg-purple-700"
                  >
                    Open file
                  </a>
                )}
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}
