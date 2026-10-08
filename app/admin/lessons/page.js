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
  const router = useRouter();
  const [lessons, setLessons] = useState([]);
  const [ready, setReady] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [file, setFile] = useState(null);
  const [fileKey, setFileKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadLessons(supabase) {
    const { data } = await supabase
      .from("lessons")
      .select("*")
      .order("created_at", { ascending: false });
    setLessons(data || []);
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
      await loadLessons(supabase);
      setReady(true);
    }
    start();
  }, [router]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
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
    await loadLessons(supabase);
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

  async function removeLesson(id) {
    if (!confirm("Delete this lesson? This cannot be undone.")) return;
    const supabase = createClient();
    await supabase.from("lessons").delete().eq("id", id);
    await loadLessons(supabase);
  }

  async function togglePublished(l) {
    const supabase = createClient();
    await supabase
      .from("lessons")
      .update({ published: !l.published })
      .eq("id", l.id);
    await loadLessons(supabase);
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

  return (
    <main className="min-h-screen bg-gray-950 px-4 py-8 text-gray-100">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Lessons</h1>
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
            {editingId ? "Edit lesson" : "New lesson"}
          </h2>

          <div>
            <label className="mb-1 block text-sm text-gray-300">Title</label>
            <input
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              required
              className={inputStyle}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-300">Level</label>
            <select
              value={form.level}
              onChange={(e) => update("level", e.target.value)}
              className={inputStyle}
            >
              {LEVELS.map((lv) => (
                <option key={lv}>{lv}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-300">
              Lesson text
            </label>
            <textarea
              value={form.content}
              onChange={(e) => update("content", e.target.value)}
              rows={8}
              className={inputStyle}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-300">
              Video link (YouTube, optional)
            </label>
            <input
              value={form.video_url}
              onChange={(e) => update("video_url", e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className={inputStyle}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-300">
              File: PDF or audio (optional, max 50 MB)
            </label>
            {form.file_name && !file && (
              <p className="mb-2 text-sm text-purple-300">
                Current file: {form.file_name}
              </p>
            )}
            <input
              key={fileKey}
              type="file"
              accept=".pdf,audio/*"
              onChange={(e) => setFile(e.target.files[0] || null)}
              className="block w-full text-sm text-gray-300 file:mr-4 file:rounded-lg file:border-0 file:bg-purple-600 file:px-4 file:py-2 file:text-white"
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-200">
            <input
              type="checkbox"
              checked={form.published}
              onChange={(e) => update("published", e.target.checked)}
            />
            Publish (students can see it)
          </label>

          {error && (
            <p className="rounded-lg bg-red-950 p-3 text-sm text-red-300">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-purple-600 px-6 py-2 font-semibold text-white hover:bg-purple-500 disabled:opacity-60"
            >
              {saving ? "Saving..." : editingId ? "Save changes" : "Add lesson"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-gray-700 px-6 py-2 hover:bg-gray-800"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <h2 className="mt-10 text-lg font-semibold text-purple-300">
          All lessons ({lessons.length})
        </h2>
        <div className="mt-3 space-y-3">
          {lessons.length === 0 && (
            <p className="text-sm text-gray-500">No lessons yet.</p>
          )}
          {lessons.map((l) => (
            <div
              key={l.id}
              className="flex flex-col gap-3 rounded-xl border border-gray-800 bg-gray-900 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold text-white">{l.title}</p>
                <p className="text-sm text-gray-400">{l.level}</p>
                <span
                  className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                    l.published
                      ? "bg-green-900 text-green-300"
                      : "bg-gray-800 text-gray-400"
                  }`}
                >
                  {l.published ? "published" : "draft"}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => togglePublished(l)}
                  className="rounded-lg border border-gray-700 px-3 py-2 text-sm hover:bg-gray-800"
                >
                  {l.published ? "Unpublish" : "Publish"}
                </button>
                <button
                  onClick={() => startEdit(l)}
                  className="rounded-lg bg-purple-700 px-3 py-2 text-sm font-semibold text-white hover:bg-purple-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => removeLesson(l.id)}
                  className="rounded-lg bg-red-700 px-3 py-2 text-sm font-semibold text-white hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
