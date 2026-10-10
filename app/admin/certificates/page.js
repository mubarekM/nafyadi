"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

const day = (iso) =>
  new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export default function AdminCertificates() {
  const [students, setStudents] = useState(null);
  const [certs, setCerts] = useState([]);
  const [studentId, setStudentId] = useState("");
  const [title, setTitle] = useState("English Speaking Course");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const supabase = createClient();
    const { data: st } = await supabase
      .from("profiles")
      .select("id, full_name, english_level, status")
      .eq("role", "student")
      .order("full_name", { ascending: true });
    setStudents(st || []);

    const { data: cs } = await supabase
      .from("certificates")
      .select("*")
      .order("issued_at", { ascending: false });
    setCerts(cs || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function issue(e) {
    e.preventDefault();
    setError("");
    if (!studentId) {
      setError("Please choose a student.");
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const { error: insertError } = await supabase
      .from("certificates")
      .insert({ student_id: studentId, title: title.trim() });
    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }
    setStudentId("");
    await load();
    setSaving(false);
  }

  async function revoke(id) {
    if (!confirm("Delete this certificate? The student will no longer see it."))
      return;
    const supabase = createClient();
    await supabase.from("certificates").delete().eq("id", id);
    await load();
  }

  if (!students) return <p className="mu font-bold">...</p>;

  const names = {};
  students.forEach((s) => {
    names[s.id] = s.full_name;
  });
  const approved = students.filter((s) => s.status === "approved");

  return (
    <div className="up">
      <h1 className="fluid-h2 font-extrabold">Certificates</h1>

      <form onSubmit={issue} className="cd mt-6 space-y-4 p-5 sm:p-6">
        <h2 className="pr text-lg font-extrabold">Issue a certificate</h2>

        <div>
          <label className="lbl">Student</label>
          <select
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="field"
          >
            <option value="">Choose a student...</option>
            {approved.map((s) => (
              <option key={s.id} value={s.id}>
                {s.full_name} ({s.english_level})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="lbl">Course name on the certificate</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={120}
            className="field"
          />
        </div>

        {error && <p className="err">{error}</p>}

        <button type="submit" disabled={saving} className="btn">
          {saving ? "Saving..." : "Issue certificate"}
        </button>
      </form>

      <h2 className="pr mt-10 text-lg font-extrabold">
        Issued ({certs.length})
      </h2>
      <div className="mt-3 space-y-3">
        {certs.length === 0 && (
          <p className="mu font-semibold">No certificates issued yet.</p>
        )}
        {certs.map((c) => (
          <div
            key={c.id}
            className="cd flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
          >
            <div className="min-w-0">
              <p className="truncate text-lg font-extrabold">
                {names[c.student_id] || "Student"}
              </p>
              <p className="mu text-sm font-bold">
                {c.title} · {day(c.issued_at)}
              </p>
              <span className="chip chip-n mt-2">ID {c.code}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <a
                href={`/certificate/${c.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn sm"
              >
                View / Print
              </a>
              <button onClick={() => revoke(c.id)} className="btn btn-red sm">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
