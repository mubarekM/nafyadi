"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import Icon from "@/components/Icon";
import { PageHead, Stat, Panel, Empty } from "@/components/ui";

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
  const line = { borderColor: "var(--ln)" };

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

  if (!students) return <p className="mu font-semibold">...</p>;

  const names = {};
  students.forEach((s) => {
    names[s.id] = s.full_name;
  });
  const approved = students.filter((s) => s.status === "approved");

  return (
    <div className="up space-y-6">
      <PageHead
        title="Certificates"
        sub="Issue a printable certificate when a student finishes"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat value={certs.length} label="Issued" tone="ok" />
        <Stat value={approved.length} label="Approved students" />
      </div>

      <Panel title="Issue a certificate" icon="award">
        <form onSubmit={issue} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
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
          </div>

          {error && <p className="err">{error}</p>}

          <button type="submit" disabled={saving} className="btn">
            {saving ? "Saving..." : "Issue certificate"}
          </button>
        </form>
      </Panel>

      <Panel title={`Issued (${certs.length})`} icon="checkCircle" flush>
        {certs.length === 0 ? (
          <Empty icon="award">No certificates issued yet.</Empty>
        ) : (
          <ul className="divide-y" style={line}>
            {certs.map((c) => (
              <li
                key={c.id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
                style={line}
              >
                <div className="min-w-0">
                  <p className="truncate text-lg font-semibold">
                    {names[c.student_id] || "Student"}
                  </p>
                  <p className="mu text-sm">
                    {c.title} · {day(c.issued_at)}
                  </p>
                  <span className="chip chip-n mt-1.5">ID {c.code}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a
                    href={`/certificate/${c.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn sm"
                  >
                    View / Print
                    <Icon name="arrowUpRight" size={14} />
                  </a>
                  <button
                    onClick={() => revoke(c.id)}
                    className="btn btn-red sm"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
