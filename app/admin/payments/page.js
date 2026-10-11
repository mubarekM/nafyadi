"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

const PLAN_NAME = {
  kids: "Kids group class",
  adults: "Adults group class",
  one: "One-on-one class",
};
const CHIP = { pending: "chip-y", approved: "chip-g", rejected: "chip-r" };
const AUTO = {
  verified: ["chip-g", "⚡ auto-verified"],
  mismatch: ["chip-r", "⚠ receipt does not match"],
  not_found: ["chip-y", "receipt not found"],
  unavailable: ["chip-n", "not checked"],
};
const etb = (n) => Number(n).toLocaleString("en-US");
const monthName = (m) => {
  const [y, mo] = m.split("-");
  return new Date(+y, +mo - 1, 1).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });
};
const when = (iso) =>
  new Date(iso).toLocaleString([], {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function AdminPayments() {
  const [pays, setPays] = useState(null);
  const [people, setPeople] = useState({});
  const [urls, setUrls] = useState({});
  const [tab, setTab] = useState("pending");
  const [notes, setNotes] = useState({});
  const [busyId, setBusyId] = useState(null);
  const [msg, setMsg] = useState("");

  async function load() {
    const supabase = createClient();
    const { data } = await supabase
      .from("payments")
      .select("*")
      .order("created_at", { ascending: false });
    const rows = data || [];
    setPays(rows);

    const n = {};
    rows.forEach((r) => {
      n[r.id] = r.admin_note || "";
    });
    setNotes((prev) => ({ ...n, ...prev }));

    const ids = [...new Set(rows.map((r) => r.student_id))];
    if (ids.length) {
      const { data: pr } = await supabase
        .from("profiles")
        .select("id, full_name, phone")
        .in("id", ids);
      const map = {};
      (pr || []).forEach((p) => {
        map[p.id] = p;
      });
      setPeople(map);
    }

    const paths = rows.map((r) => r.proof_path);
    if (paths.length) {
      const { data: signed } = await supabase.storage
        .from("payment-proofs")
        .createSignedUrls(paths, 3600);
      const u = {};
      (signed || []).forEach((s) => {
        if (s.signedUrl) u[s.path] = s.signedUrl;
      });
      setUrls(u);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function decide(p, status) {
    setMsg("");
    setBusyId(p.id);
    const supabase = createClient();
    const { error } = await supabase
      .from("payments")
      .update({
        status,
        admin_note: (notes[p.id] || "").trim() || null,
        reviewed_at: status === "pending" ? null : new Date().toISOString(),
      })
      .eq("id", p.id);
    if (error) setMsg("Could not save: " + error.message);
    else await load();
    setBusyId(null);
  }

  async function recheck(p) {
    setMsg("");
    setBusyId(p.id);
    try {
      const res = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId: p.id, force: true }),
      });
      const out = await res.json();
      if (!res.ok) setMsg(out.error || "Re-check failed.");
      await load();
    } catch {
      setMsg("Re-check failed.");
    }
    setBusyId(null);
  }

  if (!pays) return <p className="mu font-bold">...</p>;

  const today = new Date();
  const thisMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  const approvedNow = pays.filter(
    (p) => p.status === "approved" && p.month === thisMonth,
  );
  const total = approvedNow.reduce((s, p) => s + Number(p.amount), 0);
  const autoNow = approvedNow.filter(
    (p) => p.auto_status === "verified",
  ).length;

  const counts = {
    pending: pays.filter((p) => p.status === "pending").length,
    approved: pays.filter((p) => p.status === "approved").length,
    rejected: pays.filter((p) => p.status === "rejected").length,
    all: pays.length,
  };
  const shown = tab === "all" ? pays : pays.filter((p) => p.status === tab);

  const cards = [
    ["⏳", "Waiting for you", counts.pending],
    ["✅", "Paid this month", approvedNow.length],
    ["⚡", "Auto-confirmed", autoNow],
    ["💰", "ETB this month", etb(total)],
  ];

  return (
    <div className="up">
      <h1 className="fluid-h2 font-extrabold">Payments</h1>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {cards.map(([icon, label, n]) => (
          <div key={label} className="cd p-3 sm:p-5">
            <p className="text-2xl">{icon}</p>
            <p className="pr mt-2 break-all text-xl font-extrabold sm:text-3xl">
              {n}
            </p>
            <p className="mu text-xs font-bold sm:text-sm">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {["pending", "approved", "rejected", "all"].map((k) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`rounded-full px-4 py-2 text-sm font-extrabold capitalize ${
              tab === k ? "grad text-white" : "btn-ghost"
            }`}
          >
            {k} ({counts[k]})
          </button>
        ))}
      </div>

      {msg && <p className="err mt-4">{msg}</p>}

      <div className="mt-5 space-y-4">
        {shown.length === 0 && (
          <p className="mu font-semibold">Nothing here.</p>
        )}

        {shown.map((p) => {
          const who = people[p.student_id];
          const url = urls[p.proof_path];
          const auto = p.auto_status ? AUTO[p.auto_status] : null;
          return (
            <div
              key={p.id}
              className="cd flex flex-col gap-4 p-4 sm:flex-row sm:p-5"
            >
              <div className="sm:w-32 sm:shrink-0">
                {url ? (
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt="Payment screenshot"
                      className="h-44 w-full rounded-xl border object-cover object-top sm:h-40"
                      style={{ borderColor: "var(--ln)" }}
                    />
                  </a>
                ) : (
                  <div className="pill mu flex h-24 items-center justify-center text-xs font-bold">
                    No image
                  </div>
                )}
                {url && (
                  <p className="mu mt-1 text-center text-xs font-bold">
                    Tap to enlarge
                  </p>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="truncate text-lg font-extrabold">
                    {who?.full_name || "Student"}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {auto && (
                      <span className={`chip ${auto[0]}`}>{auto[1]}</span>
                    )}
                    <span className={`chip ${CHIP[p.status]}`}>{p.status}</span>
                  </div>
                </div>
                {who?.phone && (
                  <a
                    href={`tel:${who.phone}`}
                    className="pr text-sm font-extrabold hover:underline"
                  >
                    {who.phone}
                  </a>
                )}
                <p className="pr mt-2 text-xl font-extrabold">
                  {etb(p.amount)} ETB
                </p>
                <p className="mu text-sm font-bold">
                  {PLAN_NAME[p.plan] || p.plan} · for {monthName(p.month)}
                </p>
                <p className="mu break-all text-sm font-bold">
                  {p.bank || "Bank not given"}
                  {p.reference ? ` · Ref: ${p.reference}` : ""}
                </p>
                <p className="mu text-xs font-bold">
                  Sent {when(p.created_at)}
                </p>

                {p.auto_note && (
                  <p
                    className="mt-2 rounded-lg px-3 py-2 text-sm font-bold"
                    style={{ background: "var(--soft)" }}
                  >
                    🤖 {p.auto_note}
                  </p>
                )}

                <input
                  value={notes[p.id] ?? ""}
                  onChange={(e) =>
                    setNotes((n) => ({ ...n, [p.id]: e.target.value }))
                  }
                  placeholder="Note for the student (optional)"
                  className="field mt-3"
                />

                <div className="mt-3 flex flex-wrap gap-2">
                  {p.status !== "approved" && (
                    <button
                      disabled={busyId === p.id}
                      onClick={() => decide(p, "approved")}
                      className="btn btn-green sm"
                    >
                      Approve
                    </button>
                  )}
                  {p.status !== "rejected" && (
                    <button
                      disabled={busyId === p.id}
                      onClick={() => decide(p, "rejected")}
                      className="btn btn-red sm"
                    >
                      Reject
                    </button>
                  )}
                  {p.status === "pending" && p.reference && (
                    <button
                      disabled={busyId === p.id}
                      onClick={() => recheck(p)}
                      className="btn-ghost"
                    >
                      {busyId === p.id
                        ? "Checking..."
                        : "🤖 Re-check automatically"}
                    </button>
                  )}
                  {p.status !== "pending" && (
                    <button
                      disabled={busyId === p.id}
                      onClick={() => decide(p, "pending")}
                      className="btn-ghost"
                    >
                      Move to pending
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
