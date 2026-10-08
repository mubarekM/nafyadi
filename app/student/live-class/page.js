"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

function formatDate(iso) {
  return new Date(iso).toLocaleString([], {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function StudentLiveClass() {
  const router = useRouter();
  const [classes, setClasses] = useState(null);

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

      // Show classes that start from 2 hours ago onwards (so a running class stays visible)
      const since = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      const { data } = await supabase
        .from("live_classes")
        .select("*")
        .gte("starts_at", since)
        .order("starts_at", { ascending: true });

      const mine = (data || []).filter(
        (c) => c.level === "All levels" || c.level === profile.english_level,
      );
      setClasses(mine);
    }
    start();
  }, [router]);

  if (!classes) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-purple-50 text-gray-700">
        Loading...
      </main>
    );
  }

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
        <h2 className="text-3xl font-extrabold">Live classes</h2>
        <p className="mt-1 text-sm text-gray-600">
          Times are shown in your own time zone.
        </p>

        <div className="mt-6 space-y-4">
          {classes.length === 0 && (
            <p className="text-gray-600">
              No live classes scheduled right now. Check back soon!
            </p>
          )}
          {classes.map((c) => (
            <div key={c.id} className="rounded-2xl bg-white p-6 shadow">
              <p className="text-lg font-bold text-purple-700">{c.title}</p>
              <p className="mt-1 text-gray-700">{formatDate(c.starts_at)}</p>
              <p className="text-sm text-gray-500">{c.level}</p>
              {c.notes && (
                <p className="mt-3 whitespace-pre-wrap text-sm text-gray-700">
                  {c.notes}
                </p>
              )}
              <a
                href={c.meeting_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block rounded-full bg-purple-600 px-6 py-2 font-semibold text-white hover:bg-purple-700"
              >
                Join class
              </a>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
