"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import Icon from "@/components/Icon";
import { PageHead, Stat, Empty, Avatar } from "@/components/ui";

export default function AdminPrivacy() {
  const [students, setStudents] = useState(null);
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState("");
  const [delFor, setDelFor] = useState(null);
  const [typed, setTyped] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const line = { borderColor: "var(--ln)" };

  async function load() {
    const supabase = createClient();
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, phone, status, created_at")
      .eq("role", "student")
      .order("full_name", { ascending: true });
    setStudents(data || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function call(action, s, extra = {}) {
    const res = await fetch("/api/admin/student-data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, studentId: s.id, ...extra }),
    });
    const json = await res.json().catch(() => ({}));
    return { res, json };
  }

  async function exportData(s) {
    setMsg("");
    setErr("");
    setBusy(s.id);
    try {
      const { res, json } = await call("export", s);
      if (!res.ok) {
        setErr(json.error || "Could not download.");
      } else {
        const text = JSON.stringify(json, null, 2);
        const blob = new Blob([text], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        const slug = (s.full_name || "student")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-");
        a.href = url;
        a.download = `student-data-${slug}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        setMsg(`Downloaded everything we keep about ${s.full_name}.`);
      }
    } catch {
      setErr("Could not download. Check your connection.");
    }
    setBusy("");
  }

  async function remove(s) {
    setMsg("");
    setErr("");
    setBusy(s.id);
    try {
      const { res, json } = await call("delete", s, { confirmName: typed });
      if (!res.ok) {
        setErr(json.error || "Could not delete.");
      } else {
        setMsg(`${s.full_name} and all their data were deleted.`);
        setDelFor(null);
        setTyped("");
        await load();
      }
    } catch {
      setErr("Could not delete. Check your connection.");
    }
    setBusy("");
  }

  if (!students) return <p className="mu font-semibold">...</p>;

  const term = search.trim().toLowerCase();
  const shown = students.filter(
    (s) =>
      !term ||
      (s.full_name || "").toLowerCase().includes(term) ||
      (s.phone || "").includes(term),
  );

  return (
    <div className="up space-y-6">
      <PageHead
        title="Privacy tools"
        sub="Answer a student's request to see or delete their information"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat value={students.length} label="Student accounts" />
      </div>

      <div className="callout flex items-start gap-3 p-4">
        <Icon
          name="shield"
          size={20}
          className="mt-0.5 shrink-0 text-[var(--acc-t)]"
        />
        <div className="text-sm">
          <p className="font-semibold">How to use this page</p>
          <p className="mu mt-1">
            When a student asks to see their information, press{" "}
            <b>Download data</b> and send them the file. When they ask to delete
            their account, press <b>Delete</b>. Deleting is permanent: it
            removes the login, details, quiz answers, attendance, chat messages,
            certificates, <b>payments and receipt pictures</b>. If you must keep
            payment records for your accounts, download them first (here, or on
            Reports and export).
          </p>
        </div>
      </div>

      {msg && <p className="ok">{msg}</p>}
      {err && <p className="err">{err}</p>}

      <div>
        <label className="lbl">Search</label>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Name or phone number"
          className="field"
        />
      </div>

      <section className="cd overflow-hidden">
        {shown.length === 0 ? (
          <Empty icon="users">No students found.</Empty>
        ) : (
          <ul className="divide-y" style={line}>
            {shown.map((s) => (
              <li key={s.id} className="p-4 sm:p-5" style={line}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar name={s.full_name} />
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{s.full_name}</p>
                      <p className="mu text-sm">
                        {s.phone} · {s.status}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => exportData(s)}
                      disabled={busy !== ""}
                      className="btn-ghost"
                    >
                      <Icon name="upload" size={14} className="rotate-180" />
                      {busy === s.id ? "Preparing..." : "Download data"}
                    </button>
                    <button
                      onClick={() => {
                        setDelFor(delFor === s.id ? null : s.id);
                        setTyped("");
                        setErr("");
                      }}
                      disabled={busy !== ""}
                      className="btn btn-red sm"
                    >
                      Delete...
                    </button>
                  </div>
                </div>

                {delFor === s.id && (
                  <div className="err mt-4">
                    <p className="font-semibold">
                      This permanently deletes {s.full_name} and everything
                      linked to them.
                    </p>
                    <p className="mt-1 text-sm">
                      To confirm, type their full name exactly:{" "}
                      <b>{s.full_name}</b>
                    </p>
                    <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                      <input
                        value={typed}
                        onChange={(e) => setTyped(e.target.value)}
                        placeholder="Type the full name"
                        className="field"
                      />
                      <button
                        onClick={() => remove(s)}
                        disabled={busy !== "" || !typed.trim()}
                        className="btn btn-red sm sm:whitespace-nowrap"
                      >
                        {busy === s.id ? "Deleting..." : "Delete forever"}
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
