"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { PageHead, Stat, Empty, Seg } from "@/components/ui";

const LABEL = {
  payment_approved: ["Payment approved", "chip-g"],
  payment_rejected: ["Payment rejected", "chip-r"],
  payment_pending: ["Payment moved to pending", "chip-y"],
  student_approved: ["Student approved", "chip-g"],
  student_rejected: ["Student rejected", "chip-r"],
  student_pending: ["Student set to pending", "chip-y"],
  free_access_on: ["Free access given", "chip-y"],
  free_access_off: ["Free access removed", "chip-n"],
  role_changed: ["Role changed", "chip-r"],
  password_reset: ["Password reset", "chip-y"],
  data_exported: ["Data downloaded", "chip-n"],
  account_deleted: ["Account deleted", "chip-r"],
};

const GROUP = {
  payments: (a) => a.startsWith("payment_"),
  students: (a) => a.startsWith("student_") || a.startsWith("free_access"),
  security: (a) =>
    [
      "role_changed",
      "password_reset",
      "data_exported",
      "account_deleted",
    ].includes(a),
};

const when = (iso) =>
  new Date(iso).toLocaleString([], {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

function detail(row) {
  const d = row.detail || {};
  const bits = [];
  if (d.month) bits.push(d.month);
  if (d.amount) bits.push(`${Number(d.amount).toLocaleString("en-US")} ETB`);
  if (d.by) bits.push(`by ${d.by}`);
  if (d.from && d.to) bits.push(`${d.from} to ${d.to}`);
  return bits.join(" · ");
}

export default function AdminActivity() {
  const [rows, setRows] = useState(null);
  const [tab, setTab] = useState("all");
  const line = { borderColor: "var(--ln)" };

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("audit_log")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(300);
      setRows(data || []);
    }
    load();
  }, []);

  if (!rows) return <p className="mu font-semibold">...</p>;

  const shown = tab === "all" ? rows : rows.filter((r) => GROUP[tab](r.action));
  const security = rows.filter((r) => GROUP.security(r.action)).length;
  const dayAgo = Date.now() - 86400000;
  const today = rows.filter(
    (r) => new Date(r.created_at).getTime() > dayAgo,
  ).length;

  return (
    <div className="up space-y-6">
      <PageHead
        title="Activity log"
        sub="A record of important changes: payments, student approvals, password resets and data requests"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat value={today} label="Last 24 hours" />
        <Stat
          value={security}
          label="Security events"
          tone={security > 0 ? "warn" : ""}
        />
        <Stat value={rows.length} label="Shown (latest 300)" />
      </div>

      <Seg
        value={tab}
        onChange={setTab}
        options={[
          ["all", "All"],
          ["payments", "Payments"],
          ["students", "Students"],
          ["security", "Security"],
        ]}
      />

      <section className="cd overflow-hidden">
        {shown.length === 0 ? (
          <Empty icon="clock">Nothing recorded yet.</Empty>
        ) : (
          <ul className="divide-y" style={line}>
            {shown.map((r) => {
              const [text, chip] = LABEL[r.action] || [r.action, "chip-n"];
              const more = detail(r);
              return (
                <li key={r.id} className="p-4 sm:p-5" style={line}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`chip ${chip}`}>{text}</span>
                    <span className="mu ml-auto text-xs">
                      {when(r.created_at)}
                    </span>
                  </div>
                  <p className="mt-2">
                    <span className="font-semibold">
                      {r.target_name || "–"}
                    </span>
                    <span className="mu">
                      {" "}
                      · by {r.actor_name || "automatic check"}
                      {more ? ` · ${more}` : ""}
                    </span>
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
