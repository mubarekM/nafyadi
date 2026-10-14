"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
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
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export default function AdminAnnouncements() {
  const [items, setItems] = useState(null);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [level, setLevel] = useState("All levels");
  const [pinned, setPinned] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const line = { borderColor: "var(--ln)" };

  async function load() {
    const supabase = createClient();
    const { data } = await supabase
      .from("announcements")
      .select("*")
      .order("created_at", { ascending: false });
    setItems(data || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function post(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const supabase = createClient();
    const { error: insertError } = await supabase
      .from("announcements")
      .insert({ title: title.trim(), body: body.trim(), level, pinned });
    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }
    setTitle("");
    setBody("");
    setLevel("All levels");
    setPinned(false);
    await load();
    setSaving(false);
  }

  async function patch(id, fields) {
    const supabase = createClient();
    await supabase.from("announcements").update(fields).eq("id", id);
    await load();
  }

  async function remove(id) {
    if (!confirm("Delete this announcement?")) return;
    const supabase = createClient();
    await supabase.from("announcements").delete().eq("id", id);
    await load();
  }

  if (!items) return <p className="mu font-semibold">...</p>;

  const active = items.filter((a) => a.active).length;

  return (
    <div className="up space-y-6">
      <PageHead
        title="Announcements"
        sub="Messages every student sees on their home page, for example a cancelled class or a holiday"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          value={active}
          label="Showing now"
          tone={active > 0 ? "ok" : ""}
        />
        <Stat
          value={items.filter((a) => a.pinned && a.active).length}
          label="Pinned"
        />
        <Stat value={items.length} label="Total" />
      </div>

      <Panel title="New announcement" icon="plus">
        <form onSubmit={post} className="space-y-4">
          <div>
            <label className="lbl">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              minLength={2}
              maxLength={120}
              placeholder="Example: No class this Saturday"
              className="field"
            />
          </div>
          <div>
            <label className="lbl">Message</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              minLength={2}
              maxLength={2000}
              rows={4}
              className="field"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="lbl">Who sees it</label>
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
            <label className="flex items-center gap-3 self-end pb-3 font-medium">
              <input
                type="checkbox"
                checked={pinned}
                onChange={(e) => setPinned(e.target.checked)}
              />
              Pin to the top
            </label>
          </div>

          {error && <p className="err">{error}</p>}

          <button type="submit" disabled={saving} className="btn">
            {saving ? "Posting..." : "Post announcement"}
          </button>
        </form>
      </Panel>

      <section className="cd overflow-hidden">
        {items.length === 0 ? (
          <Empty icon="message">
            No announcements yet. Post your first one above.
          </Empty>
        ) : (
          <ul className="divide-y" style={line}>
            {items.map((a) => (
              <li key={a.id} className="p-4 sm:p-5" style={line}>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-lg font-semibold">{a.title}</p>
                  <span className={`chip ${a.active ? "chip-g" : "chip-n"}`}>
                    {a.active ? "showing" : "hidden"}
                  </span>
                  {a.pinned && <span className="chip chip-y">pinned</span>}
                  <span className="chip chip-n">{a.level}</span>
                  <span className="mu ml-auto text-xs">
                    {fmt(a.created_at)}
                  </span>
                </div>
                <p className="mu mt-2 whitespace-pre-wrap">{a.body}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => patch(a.id, { active: !a.active })}
                    className="btn-ghost"
                  >
                    {a.active ? "Hide" : "Show again"}
                  </button>
                  <button
                    onClick={() => patch(a.id, { pinned: !a.pinned })}
                    className="btn-ghost"
                  >
                    {a.pinned ? "Unpin" : "Pin"}
                  </button>
                  <button
                    onClick={() => remove(a.id)}
                    className="btn btn-red sm"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
