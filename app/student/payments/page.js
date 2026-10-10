"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { usePrefs } from "@/lib/prefs";
import { useStudent } from "@/components/StudentShell";
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
  const [err, setErr] = useState("");
  const [done, setDone] = useState(false);
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
    setDone(false);
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
    const ins = await supabase.from("payments").insert({
      student_id: id,
      plan,
      amount: chosen.amount,
      month,
      bank: bank || null,
      reference: ref.trim() || null,
      proof_path: path,
    });
    if (ins.error) {
      setErr(t("errUpload"));
      setBusy(false);
      return;
    }

    setRef("");
    setFile(null);
    setFileKey((k) => k + 1);
    setDone(true);
    await load();
    setBusy(false);
  }

  const line = { borderColor: "var(--ln)" };

  return (
    <div className="up space-y-6">
      <div>
        <h1 className="fluid-h2 font-extrabold">💳 {t("payT")}</h1>
        <p className="mu mt-1 font-semibold">{t("paySub")}</p>
      </div>

      <div className="cd p-5 sm:p-6">
        <h2 className="pr font-extrabold">{t("payHow")}</h2>
        <ol className="mu mt-3 list-decimal space-y-1 pl-5 font-bold">
          <li>{t("payS1")}</li>
          <li>{t("payS2")}</li>
          <li>{t("payS3")}</li>
        </ol>

        <h3 className="mt-5 font-extrabold">{t("payBanksT")}</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {BANKS.map((b) => (
            <div key={b.name} className="rounded-xl border p-4" style={line}>
              <p className="pr font-extrabold">{b.name}</p>
              <p className="mu mt-2 text-xs font-bold">{t("accHolder")}</p>
              <p className="font-extrabold">{b.holder}</p>
              <p className="mu mt-2 text-xs font-bold">{t("accNumber")}</p>
              <div className="flex items-center justify-between gap-2">
                <p className="break-all text-lg font-extrabold">{b.number}</p>
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
      </div>

      <form onSubmit={submit} className="cd space-y-4 p-5 sm:p-6">
        <h2 className="pr font-extrabold">{t("payNewT")}</h2>

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
            <label className="lbl">{t("payRef")}</label>
            <input
              value={ref}
              onChange={(e) => setRef(e.target.value)}
              maxLength={60}
              className="field"
            />
          </div>
        </div>

        <div>
          <label className="lbl">{t("payProof")}</label>
          <input
            key={fileKey}
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0] || null)}
            className="mu block w-full text-sm font-bold file:mr-4 file:rounded-full file:border-0 file:bg-[var(--acc)] file:px-4 file:py-2 file:font-extrabold file:text-white"
          />
          <p className="mu mt-1 text-xs font-bold">{t("payProofHint")}</p>
        </div>

        {err && <p className="err">{err}</p>}
        {done && <p className="ok">{t("payThanks")}</p>}

        <button type="submit" disabled={busy} className="btn w-full sm:w-auto">
          {busy ? t("paySending") : t("paySubmit")}
        </button>
      </form>

      <div className="cd p-5 sm:p-6">
        <h2 className="pr font-extrabold">{t("payHist")}</h2>
        <div className="mt-3 space-y-3">
          {!list && <p className="mu font-bold">...</p>}
          {list && list.length === 0 && (
            <p className="mu font-semibold">{t("payNone")}</p>
          )}
          {list &&
            list.map((p) => (
              <div key={p.id} className="rounded-xl border p-4" style={line}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-extrabold">{monthName(p.month)}</p>
                  <span className={`chip ${CHIP[p.status]}`}>
                    {t(ST[p.status])}
                  </span>
                </div>
                <p className="mu mt-1 text-sm font-bold">
                  {planLabel(p.plan)} ·{" "}
                  {Number(p.amount).toLocaleString("en-US")} {t("etb")}
                  {p.bank ? ` · ${p.bank}` : ""}
                </p>
                {p.admin_note && (
                  <p className="mt-2 whitespace-pre-wrap text-sm font-semibold">
                    {t("payNoteT")}: {p.admin_note}
                  </p>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
