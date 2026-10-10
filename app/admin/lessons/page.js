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
  content: "",
  video_url: "",
  file_url: "",
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
      .order("created_at", { ascending: false });
    setLessons(data || []);
  }

  useEffect(() => {
    load();
  }, []);

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

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

    let fileUrl = form.file_url;
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
      const { data } = supabase.storage.from("lesson-files").getPublicUrl(path);
      fileUrl = data.publicUrl;
      fileName = file.name;
    }

    const row = {
      title: form.title,
      level: form.level,
      content: form.content,
      video_url: form.video_url || null,
      file_url: fileUrl || null,
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
      content: l.content || "",
      video_url: l.video_url || "",
      file_url: l.file_url || "",
      file_name: l.file_name || "",
      published: l.published,
    });
    setEditingId(l.id);
    setFile(null);
    setFileKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function remove(id) {
    if (!confirm("Delete this lesson? This cannot be undone.")) return;
    const supabase = createClient();
    await supabase.from("lessons").delete().eq("id", id);
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
          <label className="lbl">Lesson text</label>
          <textarea
            value={form.content}
            onChange={(e) => update("content", e.target.value)}
            rows={8}
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
            File: PDF or audio (optional, max 50 MB)
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
      <div className="mt-3 space-y-3">
        {lessons.length === 0 && (
          <p className="mu font-semibold">No lessons yet.</p>
        )}
        {lessons.map((l) => (
          <div
            key={l.id}
            className="cd flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
          >
            <div className="min-w-0">
              <p className="truncate text-lg font-extrabold">{l.title}</p>
              <p className="mu text-sm font-bold">{l.level}</p>
              <span
                className={`chip mt-2 ${l.published ? "chip-g" : "chip-n"}`}
              >
                {l.published ? "published" : "draft"}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => toggle(l)} className="btn-ghost">
                {l.published ? "Unpublish" : "Publish"}
              </button>
              <button onClick={() => startEdit(l)} className="btn sm">
                Edit
              </button>
              <button onClick={() => remove(l.id)} className="btn btn-red sm">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
