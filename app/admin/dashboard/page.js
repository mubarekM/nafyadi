"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

const BADGE = { pending: "chip-y", approved: "chip-g", rejected: "chip-r" };

// Turn a local Ethiopian number (0912...) into international form (251912...)
function intl(phone) {
  const d = String(phone || "").replace(/\D/g, "");
  if (d.startsWith("251")) return d;
  if (d.startsWith("0")) return "251" + d.slice(1);
  if (d.length === 9) return "251" + d;
  return d;
}

function reminderText(name, month) {
  return (
    `Hello ${name}, this is Teacher Nafyad. Your payment for ${month} is not confirmed yet. ` +
    `Please send your payment screenshot on the website (Payments page). Thank you!\n\n` +
    `ሰላም ${name}፣ እኔ መምህር ናፍያድ ነኝ። የ${month} ክፍያዎ እስካሁን አልተረጋገጠም። ` +
    `እባክዎ በድረ ገጹ (የክፍያ ገጽ) የክፍያ ስክሪንሾት ይላኩ። እናመሰግናለን!`
  );
}

export default function AdminDashboard() {
  const [students, setStudents] = useState(null);
  const [opened, setOpened] = useState({});
  const [payMap, setPayMap] = useState({});
  const [stats, setStats] = useState({ lessons: 0, toGrade: 0 });
  const [search, setSearch] = useState("");
  const [savedId, setSavedId] = useState(null);
  const [reset, setReset] = useState(null);
  const [toast, setToast] = useState("");

  const monthLabel = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });

  async function load() {
    const supabase = createClient();
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

    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const { data: pays } = await supabase
      .from("payments")
      .select("student_id, status")
      .eq("month", month);
    const map = {};
    (pays || []).forEach((p) => {
      if (p.status === "approved") map[p.student_id] = "paid";
      else if (p.status === "pending" && map[p.student_id] !== "paid")
        map[p.student_id] = "review";
    });
    setPayMap(map);

    const l = await supabase
      .from("lessons")
      .select("id", { count: "exact", head: true });
    const g = await supabase
      .from("quiz_submissions")
      .select("id", { count: "exact", head: true })
      .eq("status", "submitted");
    setStats({ lessons: l.count || 0, toGrade: g.count || 0 });
  }

  useEffect(() => {
    load();
  }, []);

  function say(text) {
    setToast(text);
    setTimeout(() => setToast(""), 4000);
  }

  async function setStatus(id, status) {
    const supabase = createClient();
    await supabase.from("profiles").update({ status }).eq("id", id);
    await load();
  }

  async function toggleFree(s) {
    const supabase = createClient();
    await supabase
      .from("profiles")
      .update({ free_access: !s.free_access })
      .eq("id", s.id);
    await load();
  }

  async function setGroup(id, value) {
    const supabase = createClient();
    await supabase
      .from("profiles")
      .update({ study_group: value ? Number(value) : null })
      .eq("id", id);
    await load();
  }

  async function saveNote(e, id) {
    e.preventDefault();
    const note = String(new FormData(e.currentTarget).get("note") || "").trim();
    const supabase = createClient();
    await supabase
      .from("profiles")
      .update({ teacher_note: note || null })
      .eq("id", id);
    setSavedId(id);
    setTimeout(() => setSavedId(null), 2000);
  }

  async function resetPassword(e, s) {
    e.preventDefault();
    const form = e.currentTarget;
    const password = String(new FormData(form).get("password") || "").trim();
    if (password.length < 6) {
      setReset({ id: s.id, ok: false, text: "Use at least 6 characters." });
      return;
    }
    if (!confirm(`Change the password for ${s.full_name}?`)) return;

    setReset({ id: s.id, ok: true, text: "Saving..." });
    try {
      const res = await fetch("/api/admin/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: s.id, password }),
      });
      const result = await res.json();
      if (!res.ok) {
        setReset({ id: s.id, ok: false, text: result.error || "Failed." });
        return;
      }
      form.reset();
      setReset({
        id: s.id,
        ok: true,
        text: `Done. New password for ${s.full_name}: ${password}`,
      });
    } catch {
      setReset({ id: s.id, ok: false, text: "Something went wrong." });
    }
  }

  function copyReminder(s) {
    const text = reminderText(s.full_name, monthLabel);
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(text)
        .then(() =>
          say(
            `Message copied for ${s.full_name}. Paste it in Telegram and send.`,
          ),
        )
        .catch(() => {});
    }
  }

  if (!students) return <p className="mu font-bold">...</p>;

  const term = search.trim().toLowerCase();
  const shown = students.filter(
    (s) =>
      !term ||
      (s.full_name || "").toLowerCase().includes(term) ||
      (s.phone || "").includes(term),
  );
  const pending = shown.filter((s) => s.status === "pending");
  const others = shown.filter((s) => s.status !== "pending");

  const cards = [
    ["⏳", "Waiting", students.filter((s) => s.status === "pending").length],
    ["✅", "Approved", students.filter((s) => s.status === "approved").length],
    ["📚", "Lessons", stats.lessons],
    ["📝", "To grade", stats.toGrade],
  ];

  function studentCard(s) {
    const pay = payMap[s.id];
    const unpaid =
      s.status === "approved" &&
      !s.free_access &&
      pay !== "paid" &&
      pay !== "review";
    const num = intl(s.phone);
    const msg = reminderText(s.full_name, monthLabel);

    return (
      <div key={s.id} className="cd p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="truncate text-lg font-extrabold">{s.full_name}</p>
            <p className="text-sm font-bold">
              <a href={`tel:${s.phone}`} className="pr hover:underline">
                {s.phone}
              </a>
              <span className="mu"> · {s.english_level}</span>
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className={`chip ${BADGE[s.status]}`}>{s.status}</span>
              <span className="chip chip-n">
                {opened[s.id] || 0} lessons opened
              </span>
              {s.study_group && (
                <span className="chip chip-n">Group {s.study_group}</span>
              )}
              {s.status === "approved" &&
                (s.free_access ? (
                  <span className="chip chip-n">free access</span>
                ) : pay === "paid" ? (
                  <span className="chip chip-g">paid this month</span>
                ) : pay === "review" ? (
                  <span className="chip chip-y">payment under review</span>
                ) : (
                  <span className="chip chip-r">unpaid</span>
                ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {s.status !== "approved" && (
              <button
                onClick={() => setStatus(s.id, "approved")}
                className="btn btn-green sm"
              >
                Approve
              </button>
            )}
            {s.status !== "rejected" && (
              <button
                onClick={() => setStatus(s.id, "rejected")}
                className="btn btn-red sm"
              >
                Reject
              </button>
            )}
          </div>
        </div>

        {unpaid && (
          <div className="mt-4">
            <p className="lbl">Payment reminder for {monthLabel}</p>
            <div className="flex flex-wrap gap-2">
              <a
                href={`https://t.me/+${num}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => copyReminder(s)}
                className="btn sm"
              >
                ✈️ Telegram
              </a>
              <a
                href={`https://wa.me/${num}?text=${encodeURIComponent(msg)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost inline-block"
              >
                WhatsApp
              </a>
              <a href={`tel:+${num}`} className="btn-ghost inline-block">
                Call
              </a>
            </div>
            <p className="mu mt-1 text-xs font-bold">
              Telegram copies the message, then opens the chat: paste and send.
              If the chat does not open, the student&apos;s privacy settings may
              block it, so use WhatsApp or Call.
            </p>
          </div>
        )}

        {s.status === "approved" && (
          <>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="lbl">Study group</label>
                <select
                  value={s.study_group || ""}
                  onChange={(e) => setGroup(s.id, e.target.value)}
                  className="field"
                >
                  <option value="">No group yet</option>
                  <option value="1">Group 1</option>
                  <option value="2">Group 2</option>
                  <option value="3">Group 3</option>
                  <option value="4">Group 4</option>
                </select>
              </div>
              <div>
                <label className="lbl">Free access</label>
                <button
                  onClick={() => toggleFree(s)}
                  className="btn-ghost w-full"
                >
                  {s.free_access ? "Remove free access" : "Give free access"}
                </button>
              </div>
            </div>

            <form onSubmit={(e) => saveNote(e, s.id)} className="mt-4">
              <label className="lbl">
                Note for this student (they can read it)
              </label>
              <textarea
                name="note"
                defaultValue={s.teacher_note || ""}
                rows={2}
                className="field"
              />
              <div className="mt-2 flex items-center gap-3">
                <button type="submit" className="btn sm">
                  Save note
                </button>
                {savedId === s.id && (
                  <span className="text-sm font-bold text-green-500">
                    Saved
                  </span>
                )}
              </div>
            </form>

            <form
              onSubmit={(e) => resetPassword(e, s)}
              className="mt-4 border-t pt-4"
              style={{ borderColor: "var(--ln)" }}
            >
              <label className="lbl">
                Reset password (type a new temporary password)
              </label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  name="password"
                  type="text"
                  autoComplete="off"
                  placeholder="At least 6 characters"
                  className="field"
                />
                <button
                  type="submit"
                  className="btn-ghost sm:whitespace-nowrap"
                >
                  Reset password
                </button>
              </div>
              {reset?.id === s.id && (
                <p className={`mt-2 ${reset.ok ? "ok" : "err"}`}>
                  {reset.text}
                </p>
              )}
            </form>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="up">
      {toast && (
        <div className="ok fixed bottom-24 left-1/2 z-[60] w-[90%] max-w-md -translate-x-1/2 shadow-xl lg:bottom-6">
          {toast}
        </div>
      )}

      <h1 className="fluid-h2 font-extrabold">Students</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map(([icon, label, n]) => (
          <div key={label} className="cd p-4 sm:p-5">
            <p className="text-2xl">{icon}</p>
            <p className="pr mt-2 text-3xl font-extrabold">{n}</p>
            <p className="mu text-sm font-bold">{label}</p>
          </div>
        ))}
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name or phone..."
        className="field mt-6"
      />

      <h2 className="pr mt-8 text-lg font-extrabold">
        Waiting for approval ({pending.length})
      </h2>
      <div className="mt-3 space-y-3">
        {pending.length === 0 && (
          <p className="mu font-semibold">No new students waiting.</p>
        )}
        {pending.map(studentCard)}
      </div>

      <h2 className="pr mt-10 text-lg font-extrabold">
        All other students ({others.length})
      </h2>
      <div className="mt-3 space-y-3">
        {others.length === 0 && (
          <p className="mu font-semibold">No students yet.</p>
        )}
        {others.map(studentCard)}
      </div>
    </div>
  );
}
