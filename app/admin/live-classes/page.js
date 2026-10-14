"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import Icon from "@/components/Icon";
import { PageHead, Stat, Panel, Empty } from "@/components/ui";

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
  const line = { borderColor: "var(--ln)" };

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

  if (!classes) return <p className="mu font-semibold">...</p>;

  const cutoff = Date.now() - 2 * 60 * 60 * 1000;
  const upcoming = classes
    .filter((c) => new Date(c.starts_at).getTime() >= cutoff)
    .sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at));
  const past = classes.filter((c) => new Date(c.starts_at).getTime() < cutoff);

  function row(c) {
    return (
      <li
        key={c.id}
        className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
        style={line}
      >
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold">{c.title}</p>
          <p className="mu flex items-center gap-2 text-sm">
            <Icon name="clock" size={14} />
            {fmt(c.starts_at)} · {c.level}
          </p>
          <a
            href={c.meeting_url}
            target="_blank"
            rel="noopener noreferrer"
            className="pr mt-1 inline-flex items-center gap-1 text-sm font-semibold hover:underline"
          >
            Open meeting link
            <Icon name="arrowUpRight" size={13} />
          </a>
        </div>
        <button onClick={() => remove(c.id)} className="btn btn-red sm">
          Delete
        </button>
      </li>
    );
  }

  return (
    <div className="up space-y-6">
      <PageHead
        title="Live classes"
        sub="Schedule classes and share the meeting link"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          value={upcoming.length}
          label="Upcoming"
          tone={upcoming.length > 0 ? "ok" : "warn"}
        />
        <Stat value={past.length} label="Past" />
        <Stat value={classes.length} label="Total" />
      </div>

      <Panel title="Schedule a class" icon="calendar">
        <form onSubmit={handleSubmit} className="space-y-4">
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
      </Panel>

      <Panel title={`Upcoming (${upcoming.length})`} icon="video" flush>
        {upcoming.length === 0 ? (
          <Empty icon="calendar">No upcoming classes.</Empty>
        ) : (
          <ul className="divide-y" style={line}>
            {upcoming.map(row)}
          </ul>
        )}
      </Panel>

      <Panel title={`Past (${past.length})`} icon="clock" flush>
        {past.length === 0 ? (
          <Empty icon="clock">No past classes.</Empty>
        ) : (
          <ul className="divide-y" style={line}>
            {past.map(row)}
          </ul>
        )}
      </Panel>
    </div>
  );
}
