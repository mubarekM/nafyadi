"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Link from "next/link";

export default function StudentHome() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    async function start() {
      const supabase = createClient();

      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        router.replace("/login");
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userData.user.id)
        .single();

      if (!data || data.status !== "approved" || data.role !== "student") {
        await supabase.auth.signOut();
        router.replace("/login");
        return;
      }

      setProfile(data);
    }

    start();
  }, [router]);

  async function logout() {
    const supabase = createClient();

    await supabase.auth.signOut();
    router.replace("/login");
  }

  if (!profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-purple-50 text-gray-700">
        Loading...
      </main>
    );
  }

  const cards = [
    {
      title: "Lessons",
      text: "Read lessons and watch videos",
      href: "/student/lessons",
    },
    {
      title: "Quizzes",
      text: "Practice and test yourself",
      href: "/student/quizzes",
    },
    {
      title: "My Progress",
      text: "See your grades and progress",
      href: "/student/progress",
    },
    {
      title: "Live Class",
      text: "Join your teacher's live class",
      href: "/student/live-class",
    },
  ];

  return (
    <main className="min-h-screen bg-purple-50 text-gray-900">
      <header className="flex items-center justify-between border-b border-purple-100 bg-white px-6 py-4">
        <h1 className="text-xl font-bold text-purple-700">
          English with Nafyad
        </h1>

        <button
          onClick={logout}
          className="rounded-full border border-purple-300 px-4 py-2 text-sm font-semibold text-purple-700 hover:bg-purple-50"
        >
          Log out
        </button>
      </header>

      <section className="mx-auto max-w-4xl px-6 py-10">
        <h2 className="text-3xl font-extrabold">
          Welcome, <span className="text-purple-600">{profile.full_name}</span>!
        </h2>

        <p className="mt-2 text-gray-600">
          Your level: {profile.english_level}
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {cards.map((c) =>
            c.href ? (
              <Link
                key={c.title}
                href={c.href}
                className="block rounded-2xl bg-white p-6 shadow hover:shadow-md"
              >
                <h3 className="text-lg font-bold text-purple-700">{c.title}</h3>

                <p className="mt-1 text-sm text-gray-600">{c.text}</p>
              </Link>
            ) : (
              <div key={c.title} className="rounded-2xl bg-white p-6 shadow">
                <h3 className="text-lg font-bold text-purple-700">{c.title}</h3>

                <p className="mt-1 text-sm text-gray-600">{c.text}</p>

                <span className="mt-3 inline-block rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                  Coming soon
                </span>
              </div>
            ),
          )}
        </div>
      </section>
    </main>
  );
}
