"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { usePrefs } from "@/lib/prefs";
import { useStudent, lvLabel } from "@/components/StudentShell";
import Icon from "@/components/Icon";
import { PageHead, Panel, Avatar } from "@/components/ui";

const TG = "https://t.me/NAFYADWJ";
const TEL = "+251960889388";

export default function StudentAccount() {
  const { profile } = useStudent();
  const { t, lang } = usePrefs();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState(false);
  const [toast, setToast] = useState("");
  const line = { borderColor: "var(--ln)" };

  const loc = lang === "am" ? "am-ET" : lang === "om" ? "om-ET" : "en-US";
  const day = (iso) =>
    iso
      ? new Date(iso).toLocaleDateString(loc, {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "";

  useEffect(() => {
    createClient()
      .auth.getSession()
      .then(({ data }) => setEmail(data?.session?.user?.email || ""));
  }, []);

  async function changePassword(e) {
    e.preventDefault();
    setErr("");
    setOk(false);
    if (pw.length < 8) {
      setErr(t("pwShort"));
      return;
    }
    if (pw !== pw2) {
      setErr(t("pwMatch"));
      return;
    }
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) {
      setErr(t("pwErr"));
      return;
    }
    setPw("");
    setPw2("");
    setOk(true);
  }

  // Copies a ready message, then the link opens Telegram
  function copyMessage(key) {
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(t(key))
        .then(() => {
          setToast(t("dataCopied"));
          setTimeout(() => setToast(""), 5000);
        })
        .catch(() => {});
    }
  }

  const details = [
    [t("fullName"), profile.full_name],
    [t("phone"), profile.phone],
    [t("email"), email],
    [t("level"), lvLabel(t, profile.english_level)],
    [
      t("myGroup"),
      profile.study_group ? `${t("group")} ${profile.study_group}` : "–",
    ],
    [t("accSince"), day(profile.created_at)],
  ];

  return (
    <div className="up space-y-6">
      {toast && (
        <div className="ok fixed bottom-24 left-1/2 z-[60] w-[90%] max-w-md -translate-x-1/2 shadow-xl lg:bottom-6">
          {toast}
        </div>
      )}

      <PageHead title={t("navAccount")} sub={t("subAccount")} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title={t("accProfile")} icon="user">
          <div className="mb-4 flex items-center gap-3">
            <Avatar name={profile.full_name} size={48} />
            <p className="text-lg font-semibold">{profile.full_name}</p>
          </div>
          <dl className="divide-y" style={line}>
            {details.map(([k, v]) => (
              <div
                key={k}
                className="flex flex-wrap justify-between gap-x-4 gap-y-1 py-2.5"
                style={line}
              >
                <dt className="mu text-sm">{k}</dt>
                <dd className="break-all text-right font-semibold">
                  {v || "–"}
                </dd>
              </div>
            ))}
          </dl>
          <p className="callout mt-4 flex items-start gap-2 p-3 text-sm">
            <Icon
              name="info"
              size={16}
              className="mt-0.5 shrink-0 text-[var(--pri)]"
            />
            <span>{t("accChange")}</span>
          </p>
          {profile.consent_at && (
            <p className="mu mt-3 text-xs">
              {t("accConsent")} {day(profile.consent_at)}.
            </p>
          )}
        </Panel>

        <Panel title={t("pwT")} icon="lock">
          <form onSubmit={changePassword} className="space-y-4">
            <div>
              <label className="lbl">{t("pwNew")}</label>
              <input
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                autoComplete="new-password"
                required
                className="field"
              />
            </div>
            <div>
              <label className="lbl">{t("pwConfirm")}</label>
              <input
                type="password"
                value={pw2}
                onChange={(e) => setPw2(e.target.value)}
                autoComplete="new-password"
                required
                className="field"
              />
            </div>
            <p className="mu text-xs">{t("pwHint8")}</p>
            {err && <p className="err">{err}</p>}
            {ok && <p className="ok">{t("pwOk")}</p>}
            <button
              type="submit"
              disabled={busy}
              className="btn w-full sm:w-auto"
            >
              {busy ? t("wait") : t("pwSave")}
            </button>
          </form>
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title={t("helpT")} icon="message">
          <p className="mu mb-4">{t("helpD")}</p>
          <div className="mb-5 flex flex-wrap gap-2">
            <a
              href={TG}
              target="_blank"
              rel="noopener noreferrer"
              className="btn sm"
            >
              <Icon name="send" size={14} />
              {t("tg")}
            </a>
            <a href={`tel:${TEL}`} className="btn-ghost">
              <Icon name="phone" size={14} />
              {TEL}
            </a>
          </div>
          <div className="divide-y rounded-md border" style={line}>
            {[3, 4, 6].map((n) => (
              <details key={n} className="group p-4" style={line}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold [&::-webkit-details-marker]:hidden">
                  {t("q" + n)}
                  <Icon
                    name="chevronDown"
                    size={16}
                    className="transition-transform group-open:rotate-180"
                  />
                </summary>
                <p className="mu mt-2 text-sm">{t("a" + n)}</p>
              </details>
            ))}
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel title={t("dataT")} icon="shield">
            <p className="mu mb-4">{t("dataD")}</p>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <a
                href={TG}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => copyMessage("dataMsgSee")}
                className="btn-ghost"
              >
                {t("dataSee")}
              </a>
              <a
                href={TG}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => copyMessage("dataMsgDel")}
                className="btn-ghost"
              >
                {t("dataDel")}
              </a>
            </div>
            <p className="mu mt-3 text-xs">{t("dataOpen")}</p>
          </Panel>

          <Panel title={t("installT")} icon="monitor">
            <p className="mu">{t("installD")}</p>
          </Panel>
        </div>
      </div>
    </div>
  );
}
