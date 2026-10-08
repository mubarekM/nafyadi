"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Link from "next/link";

export default function AdminDashboard() {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [ready, setReady] = useState(false);

  async function loadStudents(supabase) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "student")
      .order("created_at", { ascending: false });
    setStudents(data || []);
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

  function Row({ s }) {
    return (
      <div className="flex flex-col gap-3 rounded-xl border border-gray-800 bg-gray-900 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-white">{s.full_name}</p>
          <p className="text-sm text-gray-400">
            {s.phone} · {s.english_level}
          </p>
          <span
            className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${badge[s.status]}`}
          >
            {s.status}
          </span>
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
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 px-4 py-8 text-gray-100">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <Link
              href="/admin/lessons"
              className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-500"
            >
              Lessons
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
          {pending.map((s) => (
            <Row key={s.id} s={s} />
          ))}
        </div>

        <h2 className="mt-10 text-lg font-semibold text-purple-300">
          All other students ({others.length})
        </h2>
        <div className="mt-3 space-y-3">
          {others.length === 0 && (
            <p className="text-sm text-gray-500">No students yet.</p>
          )}
          {others.map((s) => (
            <Row key={s.id} s={s} />
          ))}
        </div>
      </div>
    </main>
  );
}
