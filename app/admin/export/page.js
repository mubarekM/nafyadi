"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import Icon from "@/components/Icon";
import { PageHead } from "@/components/ui";

const when = (iso) => (iso ? String(iso).replace("T", " ").slice(0, 16) : "");
const yn = (v) => (v ? "yes" : "no");

function toCsv(rows, cols) {
  const esc = (v) => {
    const s = v == null ? "" : String(v);
    return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const head = cols.map(([label]) => esc(label)).join(",");
  const body = rows.map((r) => cols.map(([, get]) => esc(get(r))).join(","));
  return [head, ...body].join("\r\n");
}

function download(name, text) {
  // The first character helps Excel read Amharic and Afaan Oromoo correctly
  const blob = new Blob(["\uFEFF" + text], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function fetchAll(sb, table, select = "*", filter = (q) => q) {
  const rows = [];
  const step = 1000;
  for (let from = 0; ; from += step) {
    const { data, error } = await filter(sb.from(table).select(select))
      .order("id", { ascending: true })
      .range(from, from + step - 1);
    if (error) throw error;
    rows.push(...(data || []));
    if (!data || data.length < step) break;
  }
  return rows;
}

async function people(sb) {
  const rows = await fetchAll(sb, "profiles", "id, full_name, phone");
  const map = {};
  rows.forEach((p) => {
    map[p.id] = p;
  });
  return map;
}

const EXPORTS = [
  {
    key: "students",
    title: "Students",
    icon: "users",
    text: "Names, phones, levels, groups, status, free access and your notes.",
    run: async (sb) => ({
      rows: await fetchAll(sb, "profiles", "*", (q) => q.eq("role", "student")),
      cols: [
        ["Name", (r) => r.full_name],
        ["Phone", (r) => r.phone],
        ["Level", (r) => r.english_level],
        ["Status", (r) => r.status],
        ["Study group", (r) => r.study_group],
        ["Free access", (r) => yn(r.free_access)],
        ["Joined", (r) => when(r.created_at)],
        ["Agreed to terms", (r) => when(r.consent_at)],
        ["Teacher note", (r) => r.teacher_note],
      ],
    }),
  },
  {
    key: "payments",
    title: "Payments",
    icon: "card",
    text: "Every payment: student, month, amount, bank, transaction number and status.",
    run: async (sb) => {
      const p = await people(sb);
      return {
        rows: await fetchAll(sb, "payments"),
        cols: [
          ["Student", (r) => p[r.student_id]?.full_name],
          ["Phone", (r) => p[r.student_id]?.phone],
          ["Month", (r) => r.month],
          ["Plan", (r) => r.plan],
          ["Amount (ETB)", (r) => r.amount],
          ["Bank", (r) => r.bank],
          ["Transaction number", (r) => r.reference],
          ["Status", (r) => r.status],
          ["Automatic check", (r) => r.auto_status],
          ["Automatic note", (r) => r.auto_note],
          ["Your note", (r) => r.admin_note],
          ["Sent", (r) => when(r.created_at)],
          ["Reviewed", (r) => when(r.reviewed_at)],
        ],
      };
    },
  },
  {
    key: "attendance",
    title: "Attendance",
    icon: "checkCircle",
    text: "Who attended which live class, and who marked it.",
    run: async (sb) => {
      const p = await people(sb);
      const classes = {};
      (await fetchAll(sb, "live_classes")).forEach((c) => {
        classes[c.id] = c;
      });
      return {
        rows: await fetchAll(sb, "attendance"),
        cols: [
          ["Class", (r) => classes[r.class_id]?.title],
          ["Class date", (r) => when(classes[r.class_id]?.starts_at)],
          ["Student", (r) => p[r.student_id]?.full_name],
          ["Status", (r) => r.status],
          ["Marked by", (r) => r.marked_by],
        ],
      };
    },
  },
  {
    key: "quizzes",
    title: "Quiz scores",
    icon: "clipboard",
    text: "Scores and your feedback for every quiz answer.",
    run: async (sb) => {
      const p = await people(sb);
      const quizzes = {};
      (await fetchAll(sb, "quizzes")).forEach((q) => {
        quizzes[q.id] = q;
      });
      return {
        rows: await fetchAll(sb, "quiz_submissions"),
        cols: [
          ["Quiz", (r) => quizzes[r.quiz_id]?.title],
          ["Student", (r) => p[r.student_id]?.full_name],
          ["Status", (r) => r.status],
          ["Score", (r) => r.score],
          ["Feedback", (r) => r.feedback],
          ["Submitted", (r) => when(r.submitted_at)],
          ["Graded", (r) => when(r.graded_at)],
        ],
      };
    },
  },
  {
    key: "enrollments",
    title: "Enrollment requests",
    icon: "mail",
    text: "People who used the enroll form: name, email, phone and when.",
    run: async (sb) => ({
      rows: await fetchAll(sb, "enrollments"),
      cols: [
        ["Name", (r) => r.full_name],
        ["Email", (r) => r.email],
        ["Phone", (r) => r.phone],
        ["Status", (r) => r.status],
        ["Sent", (r) => when(r.created_at)],
        ["Agreed to terms", (r) => when(r.consent_at)],
      ],
    }),
  },
  {
    key: "certificates",
    title: "Certificates",
    icon: "award",
    text: "Certificate numbers, students, course names and dates.",
    run: async (sb) => {
      const p = await people(sb);
      return {
        rows: await fetchAll(sb, "certificates"),
        cols: [
          ["Certificate ID", (r) => r.code],
          ["Student", (r) => p[r.student_id]?.full_name],
          ["Course", (r) => r.title],
          ["Issued", (r) => when(r.issued_at)],
        ],
      };
    },
  },
];

export default function AdminExport() {
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function run(item) {
    setBusy(item.key);
    setMsg("");
    setErr("");
    try {
      const sb = createClient();
      const { rows, cols } = await item.run(sb);
      const day = new Date().toISOString().slice(0, 10);
      download(`${item.key}-${day}.csv`, toCsv(rows, cols));
      setMsg(`${item.title}: downloaded ${rows.length} rows.`);
    } catch (e) {
      setErr("Could not download: " + (e?.message || "please try again."));
    }
    setBusy("");
  }

  return (
    <div className="up space-y-6">
      <PageHead
        title="Reports and export"
        sub="Download your data as spreadsheets (CSV files that open in Excel or Google Sheets)"
      />

      <div className="callout flex items-start gap-3 p-4">
        <Icon name="shield" size={20} className="mt-0.5 text-[var(--acc-t)]" />
        <div className="text-sm">
          <p className="font-semibold">Keep a backup</p>
          <p className="mu mt-1">
            Download these files once a month and save them somewhere safe, like
            your email or Google Drive. They contain private information, so
            keep them private. Email addresses of students are kept by the login
            system and are not in these files. In Excel, format the phone column
            as Text so the leading 0 stays.
          </p>
        </div>
      </div>

      {msg && <p className="ok">{msg}</p>}
      {err && <p className="err">{err}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        {EXPORTS.map((item) => (
          <article key={item.key} className="cd flex flex-col p-5">
            <div className="flex items-center gap-3">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-md"
                style={{ background: "var(--brand-soft)", color: "var(--pri)" }}
              >
                <Icon name={item.icon} size={20} />
              </span>
              <h2 className="font-semibold">{item.title}</h2>
            </div>
            <p className="mu mt-3 flex-1 text-sm">{item.text}</p>
            <button
              onClick={() => run(item)}
              disabled={busy !== ""}
              className="btn sm mt-4 w-full sm:w-auto"
            >
              <Icon name="upload" size={14} className="rotate-180" />
              {busy === item.key ? "Preparing..." : "Download CSV"}
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
