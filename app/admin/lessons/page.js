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

const emptyForm = {
  title: "",
  level: "All levels",
  week: "1",
  week_title: "",
  content: "",
  video_url: "",
  checklist: "",
  file_path: "",
  file_name: "",
  published: false,
};

export default function AdminLessons() {
  const [lessons, setLessons] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [file, setFile] = useState(null);
  const [fileKey, setFileKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const supabase = createClient();
    const { data } = await supabase
      .from("lessons")
      .select("*")
      .order("week", { ascending: true })
      .order("created_at", { ascending: true });
    setLessons(data || []);
  }

  useEffect(() => {
    load();
  }, []);

  function update(field, value) {
    setForm((f) => {
      const next = { ...f, [field]: value };
      // When you pick a week that already has a title, reuse it
      if (field === "week" && !f.week_title.trim()) {
        const found = (lessons || []).find(
          (l) => String(l.week) === String(value) && l.week_title,
        );
        if (found) next.week_title = found.week_title;
      }
      return next;
    });
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setFile(null);
    setFileKey((k) => k + 1);
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const supabase = createClient();

    let filePath = form.file_path;
    let fileName = form.file_name;

    if (file) {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${Date.now()}-${safeName}`;
      const { error: uploadError } = await supabase.storage
        .from("lesson-files")
        .upload(path, file);
      if (uploadError) {
        setError("File upload failed: " + uploadError.message);
        setSaving(false);
        return;
      }
      // Remove the old file when it is replaced
      if (form.file_path) {
        await supabase.storage.from("lesson-files").remove([form.file_path]);
      }
      filePath = path;
      fileName = file.name;
    }

    const row = {
      title: form.title,
      level: form.level,
      week: Math.max(1, parseInt(form.week, 10) || 1),
      week_title: form.week_title.trim() || null,
      content: form.content,
      video_url: form.video_url || null,
      checklist: form.checklist
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      file_path: filePath || null,
      file_url: null, // public links are no longer used
      file_name: fileName || null,
      published: form.published,
    };

    const result = editingId
      ? await supabase.from("lessons").update(row).eq("id", editingId)
      : await supabase.from("lessons").insert(row);

    if (result.error) {
      setError(result.error.message);
      setSaving(false);
      return;
    }
    resetForm();
    await load();
    setSaving(false);
  }

  function startEdit(l) {
    setForm({
      title: l.title,
      level: l.level,
      week: String(l.week || 1),
      week_title: l.week_title || "",
      content: l.content || "",
      video_url: l.video_url || "",
      checklist: (l.checklist || []).join("\n"),
      file_path: l.file_path || "",
      file_name: l.file_name || "",
      published: l.published,
    });
    setEditingId(l.id);
    setFile(null);
    setFileKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function remove(l) {
    if (!confirm("Delete this lesson? This cannot be undone.")) return;
    const supabase = createClient();
    if (l.file_path) {
      await supabase.storage.from("lesson-files").remove([l.file_path]);
    }
    await supabase.from("lessons").delete().eq("id", l.id);
    await load();
  }

  async function toggle(l) {
    const supabase = createClient();
    await supabase
      .from("lessons")
      .update({ published: !l.published })
      .eq("id", l.id);
    await load();
  }

  if (!lessons) return <p className="mu font-bold">...</p>;

  // Group lessons by week for the list below
  const weeks = [];
  const byWeek = {};
  lessons.forEach((l) => {
    const w = l.week || 1;
    if (!byWeek[w]) {
      byWeek[w] = { week: w, title: null, items: [] };
      weeks.push(byWeek[w]);
    }
    if (!byWeek[w].title && l.week_title) byWeek[w].title = l.week_title;
    byWeek[w].items.push(l);
  });
  weeks.sort((a, b) => a.week - b.week);

  return (
    <div className="up">
      <h1 className="fluid-h2 font-extrabold">Lessons</h1>

      <form onSubmit={handleSubmit} className="cd mt-6 space-y-4 p-5 sm:p-6">
        <h2 className="pr text-lg font-extrabold">
          {editingId ? "Edit lesson" : "New lesson"}
        </h2>

        <div>
          <label className="lbl">Title</label>
          <input
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            required
            className="field"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="lbl">Level</label>
            <select
              value={form.level}
              onChange={(e) => update("level", e.target.value)}
              className="field"
            >
              {LEVELS.map((lv) => (
                <option key={lv}>{lv}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="lbl">Week number</label>
            <input
              type="number"
              min="1"
              value={form.week}
              onChange={(e) => update("week", e.target.value)}
              required
              className="field"
            />
          </div>
          <div>
            <label className="lbl">Week title (optional)</label>
            <input
              value={form.week_title}
              onChange={(e) => update("week_title", e.target.value)}
              placeholder="Example: Greetings and introductions"
              className="field"
            />
          </div>
        </div>

        <div>
          <label className="lbl">Lesson notes</label>
          <textarea
            value={form.content}
            onChange={(e) => update("content", e.target.value)}
            rows={7}
            className="field"
          />
        </div>

        <div>
          <label className="lbl">Video link (YouTube, optional)</label>
          <input
            value={form.video_url}
            onChange={(e) => update("video_url", e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="field"
          />
        </div>

        <div>
          <label className="lbl">
            Checklist for students (one item per line, optional)
          </label>
          <textarea
            value={form.checklist}
            onChange={(e) => update("checklist", e.target.value)}
            rows={4}
            placeholder={
              "Watch the video\nRead the notes\nPractice 10 sentences"
            }
            className="field"
          />
        </div>

        <div>
          <label className="lbl">
            File: PDF or audio (optional, max 50 MB). Stored privately.
          </label>
          {form.file_name && !file && (
            <p className="pr mb-2 text-sm font-bold">
              Current file: {form.file_name}
            </p>
          )}
          <input
            key={fileKey}
            type="file"
            accept=".pdf,audio/*"
            onChange={(e) => setFile(e.target.files[0] || null)}
            className="mu block w-full text-sm font-bold file:mr-4 file:rounded-full file:border-0 file:bg-[var(--acc)] file:px-4 file:py-2 file:font-extrabold file:text-white"
          />
        </div>

        <label className="flex items-center gap-2 font-bold">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => update("published", e.target.checked)}
          />
          Publish (students can see it)
        </label>

        {error && <p className="err">{error}</p>}

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn">
            {saving ? "Saving..." : editingId ? "Save changes" : "Add lesson"}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="btn-ghost">
              Cancel
            </button>
          )}
        </div>
      </form>

      <h2 className="pr mt-10 text-lg font-extrabold">
        All lessons ({lessons.length})
      </h2>
      {lessons.length === 0 && (
        <p className="mu mt-3 font-semibold">No lessons yet.</p>
      )}

      {weeks.map((w) => (
        <div key={w.week} className="mt-6">
          <p className="mb-3 font-extrabold">
            Week {w.week}
            {w.title ? `: ${w.title}` : ""}
          </p>
          <div className="space-y-3">
            {w.items.map((l) => (
              <div
                key={l.id}
                className="cd flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
              >
                <div className="min-w-0">
                  <p className="truncate text-lg font-extrabold">{l.title}</p>
                  <p className="mu text-sm font-bold">{l.level}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span
                      className={`chip ${l.published ? "chip-g" : "chip-n"}`}
                    >
                      {l.published ? "published" : "draft"}
                    </span>
                    {l.file_name && (
                      <span className="chip chip-n">🔒 {l.file_name}</span>
                    )}
                    {(l.checklist || []).length > 0 && (
                      <span className="chip chip-n">
                        {l.checklist.length} checklist items
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => toggle(l)} className="btn-ghost">
                    {l.published ? "Unpublish" : "Publish"}
                  </button>
                  <button onClick={() => startEdit(l)} className="btn sm">
                    Edit
                  </button>
                  <button onClick={() => remove(l)} className="btn btn-red sm">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
