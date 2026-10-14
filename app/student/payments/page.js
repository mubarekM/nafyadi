"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { usePrefs } from "@/lib/prefs";
import { useStudent } from "@/components/StudentShell";
import Icon from "@/components/Icon";
import { PageHead, Stat, Panel, Empty } from "@/components/ui";
import { BANKS, PLANS } from "@/lib/pay-config";

const MAX = 5 * 1024 * 1024;
const EXT = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
const pad = (n) => String(n).padStart(2, "0");
const ym = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;

// Make big phone photos smaller so they upload fast on mobile data
async function shrink(file) {
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
    const c = document.createElement("canvas");
    c.width = Math.round(bmp.width * scale);
    c.height = Math.round(bmp.height * scale);
    c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
    const blob = await new Promise((r) => c.toBlob(r, "image/jpeg", 0.82));
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}

const CHIP = { pending: "chip-y", approved: "chip-g", rejected: "chip-r" };
const ST = {
  pending: "stPending",
  approved: "stApproved",
  rejected: "stRejected",
};

export default function StudentPayments() {
  const { id } = useStudent();
  const { t, lang } = usePrefs();
  const loc = lang === "am" ? "am-ET" : lang === "om" ? "om-ET" : "en-US";

  const [list, setList] = useState(null);
  const [plan, setPlan] = useState(PLANS[0].plan);
  const [month, setMonth] = useState(ym(new Date()));
  const [bank, setBank] = useState(BANKS[0]?.name || "");
  const [ref, setRef] = useState("");
  const [file, setFile] = useState(null);
  const [fileKey, setFileKey] = useState(0);
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(false);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [copied, setCopied] = useState("");

  async function load() {
    const supabase = createClient();
    const { data } = await supabase
      .from("payments")
      .select("*")
      .eq("student_id", id)
      .order("created_at", { ascending: false });
    setList(data || []);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const now = new Date();
  const cur = ym(now);
  const months = [-1, 0, 1, 2].map((o) => {
    const d = new Date(now.getFullYear(), now.getMonth() + o, 1);
    return [
      ym(d),
      d.toLocaleDateString(loc, { year: "numeric", month: "long" }),
    ];
  });
  const monthName = (m) => {
    const [y, mo] = m.split("-");
    return new Date(+y, +mo - 1, 1).toLocaleDateString(loc, {
      year: "numeric",
      month: "long",
    });
  };
  const planLabel = (p) => {
    const x = PLANS.find((q) => q.plan === p);
    return x ? t(x.key) : p;
  };

  async function copy(text, key) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(""), 1500);
    } catch {}
  }

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setMsg("");
    if (!ref.trim()) {
      setErr(t("errRef"));
      return;
    }
    if (!file) {
      setErr(t("errFile"));
      return;
    }
    setBusy(true);

    const blob = await shrink(file);
    const ext = EXT[blob.type];
    if (!ext) {
      setErr(t("errType"));
      setBusy(false);
      return;
    }
    if (blob.size > MAX) {
      setErr(t("errSize"));
      setBusy(false);
      return;
    }

    const supabase = createClient();
    const path = `${id}/${Date.now()}.${ext}`;
    const up = await supabase.storage
      .from("payment-proofs")
      .upload(path, blob, { contentType: blob.type });
    if (up.error) {
      setErr(t("errUpload"));
      setBusy(false);
      return;
    }

    const chosen = PLANS.find((p) => p.plan === plan);
    const ins = await supabase
      .from("payments")
      .insert({
        student_id: id,
        plan,
        amount: chosen.amount,
        month,
        bank: bank || null,
        reference: ref.trim(),
        proof_path: path,
      })
      .select("id")
      .single();
    if (ins.error) {
      setErr(ins.error.code === "23505" ? t("errDup") : t("errUpload"));
      setBusy(false);
      return;
    }

    // Ask the server to check the receipt automatically
    setChecking(true);
    let approved = false;
    try {
      const res = await fetch("/api/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId: ins.data.id }),
      });
      const out = await res.json();
      approved = out.status === "approved";
    } catch {}
    setChecking(false);

    setMsg(approved ? t("autoOk") : t("autoWait"));
    setRef("");
    setFile(null);
    setFileKey((k) => k + 1);
    await load();
    setBusy(false);
  }

  const line = { borderColor: "var(--ln)" };
  const paidNow = list?.some((p) => p.month === cur && p.status === "approved");
  const reviewNow = list?.some(
    (p) => p.month === cur && p.status === "pending",
  );
  const confirmed = list
    ? list.filter((p) => p.status === "approved").length
    : 0;
  const waiting = list ? list.filter((p) => p.status === "pending").length : 0;

  return (
    <div className="up space-y-6">
      <PageHead title={t("payT")} sub={t("paySub")} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          value={
            list
              ? paidNow
                ? t("stPaid")
                : reviewNow
                  ? t("stReview")
                  : t("stDue")
              : "–"
          }
          label={`${t("stPayment")} · ${monthName(cur)}`}
          tone={list ? (paidNow ? "ok" : reviewNow ? "warn" : "bad") : ""}
        />
        <Stat value={confirmed} label={t("psConfirmed")} tone="ok" />
        <Stat
          value={waiting}
          label={t("stPending")}
          tone={waiting > 0 ? "warn" : ""}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        {/* How to pay + accounts */}
        <Panel title={t("payHow")} icon="bank">
          <ol className="space-y-3">
            {[
              ["payS1", "bank"],
              ["payS2", "file"],
              ["payS3", "upload"],
            ].map(([k, icon], i) => (
              <li key={k} className="flex items-center gap-3">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md"
                  style={{
                    background: "var(--brand-soft)",
                    color: "var(--pri)",
                  }}
                >
                  <Icon name={icon} size={18} />
                </span>
                <span>
                  <span className="mu mr-2 font-semibold">{i + 1}.</span>
                  {t(k)}
                </span>
              </li>
            ))}
          </ol>

          <h3 className="mt-6 font-semibold">{t("payBanksT")}</h3>
          <div className="mt-3 space-y-3">
            {BANKS.map((b) => (
              <div key={b.name} className="rounded-md border p-4" style={line}>
                <p className="pr font-semibold">{b.name}</p>
                <p className="mu mt-2 text-xs">{t("accHolder")}</p>
                <p className="font-semibold">{b.holder}</p>
                <p className="mu mt-2 text-xs">{t("accNumber")}</p>
                <div className="flex items-center justify-between gap-2">
                  <p className="break-all text-lg font-semibold">{b.number}</p>
                  <button
                    type="button"
                    onClick={() => copy(b.number, b.name)}
                    className="btn-ghost shrink-0"
                  >
                    {copied === b.name ? t("copied") : t("copy")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        {/* New payment */}
        <Panel title={t("payNewT")} icon="upload">
          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="lbl">{t("payPlan")}</label>
                <select
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                  className="field"
                >
                  {PLANS.map((p) => (
                    <option key={p.plan} value={p.plan}>
                      {t(p.key)} - {p.amount.toLocaleString("en-US")} {t("etb")}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="lbl">{t("payMonth")}</label>
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="field"
                >
                  {months.map(([v, label]) => (
                    <option key={v} value={v}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="lbl">{t("payBank")}</label>
                <select
                  value={bank}
                  onChange={(e) => setBank(e.target.value)}
                  className="field"
                >
                  {BANKS.map((b) => (
                    <option key={b.name} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                  <option value="Other">{t("payBankOther")}</option>
                </select>
              </div>
              <div>
                <label className="lbl">{t("payRefReq")}</label>
                <input
                  value={ref}
                  onChange={(e) => setRef(e.target.value)}
                  required
                  maxLength={200}
                  className="field"
                />
              </div>
            </div>
            <p className="mu -mt-2 text-xs">{t("payRefHint")}</p>

            <div>
              <label className="lbl">{t("payProof")}</label>
              <input
                key={fileKey}
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files[0] || null)}
                className="mu block w-full text-sm"
              />
              <p className="mu mt-1 text-xs">{t("payProofHint")}</p>
            </div>

            {err && <p className="err">{err}</p>}
            {msg && <p className="ok">{msg}</p>}

            <button
              type="submit"
              disabled={busy}
              className="btn w-full sm:w-auto"
            >
              {busy
                ? checking
                  ? t("autoChecking")
                  : t("paySending")
                : t("paySubmit")}
            </button>
          </form>
        </Panel>
      </div>

      {/* History */}
      <Panel title={t("payHist")} icon="card" flush>
        {!list ? (
          <p className="mu p-5">...</p>
        ) : list.length === 0 ? (
          <Empty icon="card">{t("payNone")}</Empty>
        ) : (
          <ul className="divide-y" style={line}>
            {list.map((p) => (
              <li key={p.id} className="p-4" style={line}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">{monthName(p.month)}</p>
                  <div className="flex flex-wrap gap-2">
                    {p.auto_status === "verified" &&
                      p.status === "approved" && (
                        <span className="chip chip-g">{t("chipAuto")}</span>
                      )}
                    <span className={`chip ${CHIP[p.status]}`}>
                      {t(ST[p.status])}
                    </span>
                  </div>
                </div>
                <p className="mu mt-1 text-sm">
                  {planLabel(p.plan)} ·{" "}
                  {Number(p.amount).toLocaleString("en-US")} {t("etb")}
                  {p.bank ? ` · ${p.bank}` : ""}
                </p>
                {p.admin_note && (
                  <p className="mt-2 whitespace-pre-wrap text-sm">
                    <span className="font-semibold">{t("payNoteT")}:</span>{" "}
                    {p.admin_note}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
