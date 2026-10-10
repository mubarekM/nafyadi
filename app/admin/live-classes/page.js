"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

const LEVELS = [
  "All levels",
  "Beginner",
  "Elementary",
  "Intermediate",
  "Upper-intermediate",
  "Advanced",
];

const fmt = (iso) =>
  new Date(iso).toLocaleString([], {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function AdminLiveClasses() {
  const [classes, setClasses] = useState(null);
  const [title, setTitle] = useState("");
  const [level, setLevel] = useState("All levels");
  const [startsAt, setStartsAt] = useState("");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const supabase = createClient();
    const { data } = await supabase
      .from("live_classes")
      .select("*")
      .order("starts_at", { ascending: false });
    setClasses(data || []);
  }

  useEffect(() => {
    load();
  }, []);

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
    await load();
    setSaving(false);
  }

  async function remove(id) {
    if (!confirm("Delete this live class?")) return;
    const supabase = createClient();
    await supabase.from("live_classes").delete().eq("id", id);
    await load();
  }

  if (!classes) return <p className="mu font-bold">...</p>;

  const cutoff = Date.now() - 2 * 60 * 60 * 1000;
  const upcoming = classes
    .filter((c) => new Date(c.starts_at).getTime() >= cutoff)
    .sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at));
  const past = classes.filter((c) => new Date(c.starts_at).getTime() < cutoff);

  function row(c) {
    return (
      <div
        key={c.id}
        className="cd flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
      >
        <div className="min-w-0">
          <p className="truncate text-lg font-extrabold">{c.title}</p>
          <p className="mu text-sm font-bold">
            {fmt(c.starts_at)} · {c.level}
          </p>
          <a
            href={c.meeting_url}
            target="_blank"
            rel="noopener noreferrer"
            className="pr mt-1 inline-block text-sm font-extrabold hover:underline"
          >
            Open meeting link
          </a>
        </div>
        <button onClick={() => remove(c.id)} className="btn btn-red sm">
          Delete
        </button>
      </div>
    );
  }

  return (
    <div className="up">
      <h1 className="fluid-h2 font-extrabold">Live Classes</h1>

      <form onSubmit={handleSubmit} className="cd mt-6 space-y-4 p-5 sm:p-6">
        <h2 className="pr text-lg font-extrabold">Schedule a class</h2>

        <div>
          <label className="lbl">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="field"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="lbl">Level</label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="field"
            >
              {LEVELS.map((lv) => (
                <option key={lv}>{lv}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="lbl">Date and time</label>
            <input
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              required
              className="field"
            />
          </div>
        </div>

        <div>
          <label className="lbl">Meeting link (Google Meet, Zoom...)</label>
          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            placeholder="https://meet.google.com/..."
            className="field"
          />
        </div>

        <div>
          <label className="lbl">Note for students (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="field"
          />
        </div>

        {error && <p className="err">{error}</p>}

        <button type="submit" disabled={saving} className="btn">
          {saving ? "Saving..." : "Add class"}
        </button>
      </form>

      <h2 className="pr mt-10 text-lg font-extrabold">
        Upcoming ({upcoming.length})
      </h2>
      <div className="mt-3 space-y-3">
        {upcoming.length === 0 && (
          <p className="mu font-semibold">No upcoming classes.</p>
        )}
        {upcoming.map(row)}
      </div>

      <h2 className="pr mt-10 text-lg font-extrabold">Past ({past.length})</h2>
      <div className="mt-3 space-y-3">
        {past.length === 0 && (
          <p className="mu font-semibold">No past classes.</p>
        )}
        {past.map(row)}
      </div>
    </div>
  );
}
