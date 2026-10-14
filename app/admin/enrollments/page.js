"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { PageHead, Stat, Empty, Avatar } from "@/components/ui";

const fmt = (iso) =>
  new Date(iso).toLocaleString([], {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function AdminEnrollments() {
  const [rows, setRows] = useState(null);
  const line = { borderColor: "var(--ln)" };

  async function load() {
    const supabase = createClient();
    const { data } = await supabase
      .from("enrollments")
      .select("*")
      .order("created_at", { ascending: false });
    setRows(data || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function setStatus(id, status) {
    const supabase = createClient();
    await supabase.from("enrollments").update({ status }).eq("id", id);
    await load();
  }

  async function remove(id) {
    if (!confirm("Delete this enrollment request?")) return;
    const supabase = createClient();
    await supabase.from("enrollments").delete().eq("id", id);
    await load();
  }

  if (!rows) return <p className="mu font-semibold">...</p>;

  const fresh = rows.filter((r) => r.status === "new").length;

  return (
    <div className="up space-y-6">
      <PageHead
        title="Enrollments"
        sub="People who filled the enroll form on your home page"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          value={fresh}
          label="New requests"
          tone={fresh > 0 ? "warn" : ""}
        />
        <Stat value={rows.length - fresh} label="Contacted" tone="ok" />
        <Stat value={rows.length} label="Total" />
      </div>

      <section className="cd overflow-hidden">
        {rows.length === 0 ? (
          <Empty icon="mail">No enrollment requests yet.</Empty>
        ) : (
          <ul className="divide-y" style={line}>
            {rows.map((r) => (
              <li
                key={r.id}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
                style={line}
              >
                <div className="flex min-w-0 gap-3">
                  <Avatar name={r.full_name} />
                  <div className="min-w-0">
                    <p className="truncate text-lg font-semibold">
                      {r.full_name}
                    </p>
                    <p className="text-sm">
                      <a
                        href={`tel:${r.phone}`}
                        className="pr font-semibold hover:underline"
                      >
                        {r.phone}
                      </a>
                      <span className="mu"> · </span>
                      <a
                        href={`mailto:${r.email}`}
                        className="pr break-all font-semibold hover:underline"
                      >
                        {r.email}
                      </a>
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <span
                        className={`chip ${r.status === "new" ? "chip-y" : "chip-g"}`}
                      >
                        {r.status}
                      </span>
                      <span className="mu text-xs">{fmt(r.created_at)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {r.status === "new" ? (
                    <button
                      onClick={() => setStatus(r.id, "contacted")}
                      className="btn btn-green sm"
                    >
                      Mark contacted
                    </button>
                  ) : (
                    <button
                      onClick={() => setStatus(r.id, "new")}
                      className="btn-ghost"
                    >
                      Mark new
                    </button>
                  )}
                  <button
                    onClick={() => remove(r.id)}
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
