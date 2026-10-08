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

function formatDate(iso) {
  return new Date(iso).toLocaleString([], {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminLiveClasses() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [classes, setClasses] = useState([]);
  const [title, setTitle] = useState("");
  const [level, setLevel] = useState("All levels");
  const [startsAt, setStartsAt] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadClasses(supabase) {
    const { data } = await supabase
      .from("live_classes")
      .select("*")
      .order("starts_at", { ascending: false });
    setClasses(data || []);
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
      await loadClasses(supabase);
      setReady(true);
    }
    start();
  }, [router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!/^https?:\/\//i.test(url.trim())) {
      setError("The meeting link must start with https://");
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const { error: insertError } = await supabase.from("live_classes").insert({
      title,
      level,
      starts_at: new Date(startsAt).toISOString(),
      meeting_url: url.trim(),
      notes: notes.trim() || null,
    });

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    setTitle("");
    setLevel("All levels");
    setStartsAt("");
    setUrl("");
    setNotes("");
    await loadClasses(supabase);
    setSaving(false);
  }

  async function removeClass(id) {
    if (!confirm("Delete this live class?")) return;
    const supabase = createClient();
    await supabase.from("live_classes").delete().eq("id", id);
    await loadClasses(supabase);
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

  const now = Date.now();
  const upcoming = classes
    .filter((c) => new Date(c.starts_at).getTime() >= now - 2 * 60 * 60 * 1000)
    .sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at));
  const past = classes.filter(
    (c) => new Date(c.starts_at).getTime() < now - 2 * 60 * 60 * 1000,
  );

  function renderClass(c) {
    return (
      <div
        key={c.id}
        className="flex flex-col gap-3 rounded-xl border border-gray-800 bg-gray-900 p-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <p className="font-semibold text-white">{c.title}</p>
          <p className="text-sm text-gray-400">
            {formatDate(c.starts_at)} · {c.level}
          </p>
          <a
            href={c.meeting_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-block text-sm text-purple-300 hover:underline"
          >
            Open meeting link
          </a>
        </div>
        <button
          onClick={() => removeClass(c.id)}
          className="rounded-lg bg-red-700 px-3 py-2 text-sm font-semibold text-white hover:bg-red-600"
        >
          Delete
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 px-4 py-8 text-gray-100">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Live Classes</h1>
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
          <h2 className="text-lg font-semibold text-purple-300">
            Schedule a class
          </h2>

          <div>
            <label className="mb-1 block text-sm text-gray-300">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className={inputStyle}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
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
            <div>
              <label className="mb-1 block text-sm text-gray-300">
                Date and time
              </label>
              <input
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                required
                className={inputStyle}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-300">
              Meeting link (Google Meet, Zoom...)
            </label>
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              placeholder="https://meet.google.com/..."
              className={inputStyle}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-300">
              Note for students (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className={inputStyle}
            />
          </div>

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
            {saving ? "Saving..." : "Add class"}
          </button>
        </form>

        <h2 className="mt-10 text-lg font-semibold text-purple-300">
          Upcoming ({upcoming.length})
        </h2>
        <div className="mt-3 space-y-3">
          {upcoming.length === 0 && (
            <p className="text-sm text-gray-500">No upcoming classes.</p>
          )}
          {upcoming.map((c) => renderClass(c))}
        </div>

        <h2 className="mt-10 text-lg font-semibold text-purple-300">
          Past ({past.length})
        </h2>
        <div className="mt-3 space-y-3">
          {past.length === 0 && (
            <p className="text-sm text-gray-500">No past classes.</p>
          )}
          {past.map((c) => renderClass(c))}
        </div>
      </div>
    </main>
  );
}
