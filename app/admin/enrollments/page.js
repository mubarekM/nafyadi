"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

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

  if (!rows) return <p className="mu font-bold">...</p>;

  const fresh = rows.filter((r) => r.status === "new").length;

  return (
    <div className="up">
      <h1 className="fluid-h2 font-extrabold">Enrollments</h1>
      <p className="mu mt-1 font-semibold">
        People who filled the enroll form on your home page. {fresh} new.
      </p>

      <div className="mt-6 space-y-3">
        {rows.length === 0 && (
          <p className="mu font-semibold">No enrollment requests yet.</p>
        )}
        {rows.map((r) => (
          <div
            key={r.id}
            className="cd flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
          >
            <div className="min-w-0">
              <p className="truncate text-lg font-extrabold">{r.full_name}</p>
              <p className="text-sm font-bold">
                <a href={`tel:${r.phone}`} className="pr hover:underline">
                  {r.phone}
                </a>
                <span className="mu"> · </span>
                <a
                  href={`mailto:${r.email}`}
                  className="pr break-all hover:underline"
                >
                  {r.email}
                </a>
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span
                  className={`chip ${r.status === "new" ? "chip-y" : "chip-g"}`}
                >
                  {r.status}
                </span>
                <span className="mu text-xs font-bold">
                  {fmt(r.created_at)}
                </span>
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
              <button onClick={() => remove(r.id)} className="btn btn-red sm">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
