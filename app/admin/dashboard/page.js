"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function AdminDashboard() {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [opened, setOpened] = useState({});
  const [ready, setReady] = useState(false);
  const [savedId, setSavedId] = useState(null);

  async function loadStudents(supabase) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "student")
      .order("created_at", { ascending: false });
    setStudents(data || []);

    const { data: views } = await supabase
      .from("lesson_views")
      .select("student_id");
    const counts = {};
    (views || []).forEach((v) => {
      counts[v.student_id] = (counts[v.student_id] || 0) + 1;
    });
    setOpened(counts);
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
      await loadStudents(supabase);
      setReady(true);
    }
    start();
  }, [router]);

  async function setStatus(id, status) {
    const supabase = createClient();
    await supabase.from("profiles").update({ status }).eq("id", id);
    await loadStudents(supabase);
  }

  async function saveNote(e, id) {
    e.preventDefault();
    const note = new FormData(e.currentTarget).get("note");
    const supabase = createClient();
    await supabase
      .from("profiles")
      .update({ teacher_note: String(note).trim() || null })
      .eq("id", id);
    setSavedId(id);
    setTimeout(() => setSavedId(null), 2000);
  }

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/admin/login");
  }

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-950 text-gray-300">
        Loading...
      </main>
    );
  }

  const pending = students.filter((s) => s.status === "pending");
  const others = students.filter((s) => s.status !== "pending");

  const badge = {
    pending: "bg-yellow-900 text-yellow-300",
    approved: "bg-green-900 text-green-300",
    rejected: "bg-red-900 text-red-300",
  };

  function renderStudent(s) {
    return (
      <div
        key={s.id}
        className="rounded-xl border border-gray-800 bg-gray-900 p-4"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-white">{s.full_name}</p>
            <p className="text-sm text-gray-400">
              {s.phone} · {s.english_level}
            </p>
            <div className="mt-2 flex gap-2">
              <span
                className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${badge[s.status]}`}
              >
                {s.status}
              </span>
              <span className="inline-block rounded-full bg-gray-800 px-3 py-1 text-xs font-semibold text-gray-300">
                {opened[s.id] || 0} lessons opened
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            {s.status !== "approved" && (
              <button
                onClick={() => setStatus(s.id, "approved")}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-500"
              >
                Approve
              </button>
            )}
            {s.status !== "rejected" && (
              <button
                onClick={() => setStatus(s.id, "rejected")}
                className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
              >
                Reject
              </button>
            )}
          </div>
        </div>

        {s.status === "approved" && (
          <form onSubmit={(e) => saveNote(e, s.id)} className="mt-4">
            <label className="mb-1 block text-sm text-gray-300">
              Note for this student (they can read it)
            </label>
            <textarea
              name="note"
              defaultValue={s.teacher_note || ""}
              rows={2}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-white placeholder-gray-500 focus:border-purple-400 focus:outline-none"
            />
            <div className="mt-2 flex items-center gap-3">
              <button
                type="submit"
                className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-500"
              >
                Save note
              </button>
              {savedId === s.id && (
                <span className="text-sm text-green-400">Saved</span>
              )}
            </div>
          </form>
        )}
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 px-4 py-8 text-gray-100">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <Link
              href="/admin/lessons"
              className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-500"
            >
              Lessons
            </Link>
            <Link
              href="/admin/quizzes"
              className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-500"
            >
              Quizzes
            </Link>
            <Link
              href="/admin/live-classes"
              className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-500"
            >
              Live Classes
            </Link>
          </div>
          <button
            onClick={logout}
            className="rounded-lg border border-gray-700 px-4 py-2 text-sm hover:bg-gray-800"
          >
            Log out
          </button>
        </div>

        <h2 className="mt-8 text-lg font-semibold text-purple-300">
          Waiting for approval ({pending.length})
        </h2>
        <div className="mt-3 space-y-3">
          {pending.length === 0 && (
            <p className="text-sm text-gray-500">No new students waiting.</p>
          )}
          {pending.map((s) => renderStudent(s))}
        </div>

        <h2 className="mt-10 text-lg font-semibold text-purple-300">
          All other students ({others.length})
        </h2>
        <div className="mt-3 space-y-3">
          {others.length === 0 && (
            <p className="text-sm text-gray-500">No students yet.</p>
          )}
          {others.map((s) => renderStudent(s))}
        </div>
      </div>
    </main>
  );
}
