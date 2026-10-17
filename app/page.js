"use client";
import Link from "next/link";
import { useState } from "react";
import { usePrefs } from "@/lib/prefs";
import Controls from "@/components/Controls";
import HeaderAuth from "@/components/HeaderAuth";
import Captcha, { captchaOn } from "@/components/Captcha";
import Icon from "@/components/Icon";
import { BANKS, PLANS } from "@/lib/pay-config";
import { GROUPS, LIVE } from "@/lib/schedule";

const TG = "https://t.me/NAFYADWJ";
const TEL = "+251960889388";

const LEVELS = [
  ["A1", "lvBeginner", "ld1"],
  ["A2", "lvElementary", "ld2"],
  ["B1", "lvIntermediate", "ld3"],
  ["B2", "lvUpper", "ld4"],
  ["C1+", "lvAdvanced", "ld5"],
];
const SKILLS = [
  ["sk1", "mic"],
  ["sk2", "headphones"],
  ["sk3", "book"],
  ["sk4", "edit"],
  ["sk5", "layers"],
  ["sk6", "type"],
  ["sk7", "message"],
  ["sk8", "monitor"],
];
const STEPS = [
  ["htp1T", "htp1D", "user"],
  ["htp2T", "htp2D", "bank"],
  ["htp3T", "htp3D", "upload"],
  ["htp4T", "htp4D", "award"],
];
const ZONES = ["EST", "PST", "EAT"];
const FAQ = [1, 2, 3, 4, 5, 6];
const PLAN_DESC = { kids: "pKidsD", adults: "pAdultsD", one: "pOneD" };

function Photo({ src, alt, cls }) {
  const [bad, setBad] = useState(false);
  return bad ? (
    <div className={`${cls} grad`} role="img" aria-label={alt} />
  ) : (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      onError={() => setBad(true)}
      className={`${cls} object-cover`}
    />
  );
}

export default function Home() {
  const { t } = usePrefs();
  const [menu, setMenu] = useState(false);
  const [enr, setEnr] = useState("idle"); // idle | sending | ok | error | limit | captcha
  const [token, setToken] = useState("");
  const [reset, setReset] = useState(0);
  const line = { borderColor: "var(--ln)" };

  const nav = [
    ["#programs", "programs"],
    ["#learn", "navLearn"],
    ["#schedule", "schedule"],
    ["#prices", "prices"],
    ["#about", "about"],
    ["#contact", "contact"],
  ];

  // One row per group for the schedule table
  const rows = [
    { label: t("live"), days: t("satsun"), times: LIVE.map((r) => r[1]) },
    ...GROUPS.map((g, i) => ({
      label: `${t("group")} ${i + 1}`,
      days: t("tuethu"),
      times: g.map((r) => r[1]),
    })),
  ];

  async function sendEnroll(e) {
    e.preventDefault();
    if (enr === "sending") return;
    const form = e.currentTarget; // keep it: it is empty after the first await
    const fd = new FormData(form);

    if (captchaOn && !token) {
      setEnr("captcha");
      return;
    }
    setEnr("sending");

    try {
      const res = await fetch("/api/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: String(fd.get("full_name") || "").trim(),
          email: String(fd.get("email") || "").trim(),
          phone: String(fd.get("phone") || "").trim(),
          consent: fd.get("consent") === "on",
          website: String(fd.get("website") || ""), // hidden trap field
          token,
        }),
      });
      if (res.ok) {
        form.reset();
        setEnr("ok");
      } else if (res.status === 429) {
        setEnr("limit");
      } else {
        const j = await res.json().catch(() => ({}));
        setEnr(j.error === "captcha" ? "captcha" : "error");
      }
    } catch {
      setEnr("error");
    }
    setToken("");
    setReset((n) => n + 1);
  }

  const Head = ({ k, title, text }) => (
    <div className="max-w-2xl">
      <p className="overline">{t(k)}</p>
      <h2 className="display mt-2 text-3xl sm:text-4xl">{title}</h2>
      {text && <p className="mu mt-3 text-lg">{text}</p>}
    </div>
  );

  const logo = (
    <span
      className="display flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-lg text-white"
      style={{ background: "var(--deep)" }}
      aria-hidden="true"
    >
      N
    </span>
  );

  return (
    <main id="main" tabIndex={-1} className="b0 tx outline-none">
      {/* ===== Top bar ===== */}
      <header className="b0 sticky top-0 z-50 border-b" style={line}>
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <a href="#top" className="flex shrink-0 items-center gap-3">
            {logo}
            <span className="hidden font-semibold min-[420px]:inline">
              English with Nafyad
            </span>
          </a>
          <nav aria-label="Main" className="hidden items-center gap-6 xl:flex">
            {nav.map(([h, k]) => (
              <a
                key={h}
                href={h}
                className="mu text-sm font-semibold hover:text-[var(--pri)]"
              >
                {t(k)}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Controls />
            <HeaderAuth />
            <button
              onClick={() => setMenu(!menu)}
              aria-label="Menu"
              aria-expanded={menu}
              className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-md border xl:hidden"
              style={{ borderColor: "var(--ln)", background: "var(--card)" }}
            >
              <Icon name={menu ? "x" : "menu"} size={18} />
            </button>
          </div>
        </div>
        {menu && (
          <div
            className="border-t px-4 pb-5 pt-2 xl:hidden"
            style={{ ...line, background: "var(--card)" }}
          >
            {nav.map(([h, k]) => (
              <a
                key={h}
                href={h}
                onClick={() => setMenu(false)}
                className="tx block py-3 font-semibold"
              >
                {t(k)}
              </a>
            ))}
            <HeaderAuth layout="menu" />
          </div>
        )}
      </header>

      {/* ===== Hero ===== */}
      <section id="top" className="px-4 pb-16 pt-12 sm:px-6 sm:pb-24 sm:pt-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="up">
            <p className="overline">{t("heroKicker")}</p>
            <h1 className="display fluid-h1 mt-4">
              {t("h1a")} <span className="pr">{t("h1b")}</span>
            </h1>
            <p className="mu mt-5 max-w-xl text-lg leading-relaxed">
              {t("sub")}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/signup" className="btn w-full sm:w-auto">
                {t("joinStudent")}
                <Icon name="arrowRight" size={16} />
              </Link>
              <Link href="/login" className="btn2 w-full sm:w-auto">
                {t("loginStudentT")}
              </Link>
            </div>
            <p className="mu mt-5 text-sm">
              {t("teacherQ")}{" "}
              <Link
                href="/login?as=teacher"
                className="pr font-semibold underline underline-offset-4"
              >
                {t("teacherLink")}
              </Link>
            </p>

            <dl
              className="mt-10 grid max-w-xl grid-cols-3 border-t pt-6"
              style={line}
            >
              {[
                ["f1v", "f1l"],
                ["f2v", "f2l"],
                ["f3v", "f3l"],
              ].map(([v, l], i) => (
                <div
                  key={v}
                  className={i > 0 ? "border-l pl-4" : ""}
                  style={line}
                >
                  <dt className="display text-2xl sm:text-3xl">{t(v)}</dt>
                  <dd className="mu mt-1 text-sm">{t(l)}</dd>
                </div>
              ))}
            </dl>
          </div>

          <figure className="relative">
            <Photo
              src="/hero.jpg"
              alt="Student learning English online"
              cls="aspect-[4/5] w-full rounded-lg border sm:aspect-[5/4] lg:aspect-[4/5]"
            />
            <figcaption className="cd absolute -bottom-5 left-4 right-4 flex items-center gap-3 p-4 sm:right-auto sm:max-w-xs">
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md"
                style={{ background: "var(--brand-soft)", color: "var(--pri)" }}
              >
                <Icon name="video" size={20} />
              </span>
              <span className="min-w-0 leading-tight">
                <span className="block font-semibold">{t("wkLive")}</span>
                <span className="mu block text-sm">
                  {t("satsun")} · {LIVE[0][1]} EST
                </span>
              </span>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ===== Programs ===== */}
      <section
        id="programs"
        className="scroll-mt-20 border-t px-4 py-16 sm:px-6 sm:py-20"
        style={line}
      >
        <div className="mx-auto max-w-6xl">
          <Head k="ovPrograms" title={t("progT")} />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              ["kids", "kidsD", "/kids.jpg"],
              ["teens", "teensD", "/teens.jpg"],
              ["adults", "adultsD", "/adults.jpg"],
            ].map(([n, d, img]) => (
              <article key={n} className="cd lift overflow-hidden">
                <Photo
                  src={img}
                  alt={t(n)}
                  cls="aspect-[16/10] w-full border-b"
                />
                <div className="p-5">
                  <h3 className="text-xl font-semibold">{t(n)}</h3>
                  <p className="mu mt-2">{t(d)}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Curriculum ===== */}
      <section
        id="learn"
        className="b1 scroll-mt-20 border-y px-4 py-16 sm:px-6 sm:py-20"
        style={line}
      >
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <Head k="ovLearn" title={t("learnT")} text={t("learnD")} />
            <h3 className="mt-10 font-semibold">{t("skillsT")}</h3>
            <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3">
              {SKILLS.map(([k, icon]) => (
                <li key={k} className="flex items-center gap-3">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border"
                    style={{
                      borderColor: "var(--ln)",
                      background: "var(--card)",
                      color: "var(--pri)",
                    }}
                  >
                    <Icon name={icon} size={18} />
                  </span>
                  <span className="font-semibold">{t(k)}</span>
                </li>
              ))}
            </ul>
          </div>

          <ol
            className="cd divide-y"
            style={{ ...line, borderColor: "var(--ln)" }}
          >
            {LEVELS.map(([code, nameKey, descKey], i) => (
              <li
                key={code}
                className="flex items-start gap-4 p-5"
                style={line}
              >
                <span
                  className="display flex h-12 w-12 shrink-0 items-center justify-center rounded-md border text-lg"
                  style={{ borderColor: "var(--pri)", color: "var(--pri)" }}
                >
                  {code}
                </span>
                <div className="min-w-0">
                  <h3 className="font-semibold">
                    {i + 1}. {t(nameKey)}
                  </h3>
                  <p className="mu mt-1">{t(descKey)}</p>
                </div>
              </li>
            ))}
            <li className="mu p-4 text-sm" style={line}>
              {t("cefrNote")}
            </li>
          </ol>
        </div>
      </section>

      {/* ===== Schedule ===== */}
      <section
        id="schedule"
        className="scroll-mt-20 px-4 py-16 sm:px-6 sm:py-20"
      >
        <div className="mx-auto max-w-6xl">
          <Head k="ovSchedule" title={t("schT")} text={t("schD")} />

          {/* Table on laptops and bigger */}
          <div className="cd mt-10 hidden overflow-x-auto lg:block">
            <table className="w-full text-left">
              <thead style={{ background: "var(--soft)" }}>
                <tr className="text-sm">
                  <th className="p-4 font-semibold">{t("thGroup")}</th>
                  <th className="p-4 font-semibold">{t("thDays")}</th>
                  {ZONES.map((z) => (
                    <th key={z} className="p-4 font-semibold">
                      {z}
                    </th>
                  ))}
                  <th className="p-4 font-semibold">{t("thEth")}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-t" style={line}>
                    <td className="p-4 font-semibold">{r.label}</td>
                    <td className="mu p-4">{r.days}</td>
                    {r.times.map((time, j) => (
                      <td key={j} className="p-4 text-sm">
                        {time}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cards on phones and tablets */}
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:hidden">
            {rows.map((r, i) => (
              <div key={i} className="cd p-4">
                <div
                  className="flex items-baseline justify-between gap-3 border-b pb-3"
                  style={line}
                >
                  <p className="font-semibold">{r.label}</p>
                  <p className="pr text-sm font-semibold">{r.days}</p>
                </div>
                <dl className="mt-3 space-y-2 text-sm">
                  {[...ZONES, t("thEth")].map((z, j) => (
                    <div key={z} className="flex justify-between gap-4">
                      <dt className="mu">{z}</dt>
                      <dd className="text-right font-semibold">{r.times[j]}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Pricing ===== */}
      <section
        id="prices"
        className="b1 scroll-mt-20 border-y px-4 py-16 sm:px-6 sm:py-20"
        style={line}
      >
        <div className="mx-auto max-w-6xl">
          <Head k="ovPricing" title={t("prT")} text={t("pNote")} />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {PLANS.map((p) => (
              <article key={p.plan} className="cd stat flex flex-col p-6">
                <h3 className="text-lg font-semibold">{t(p.key)}</h3>
                <p className="mu mt-1 text-sm">{t(PLAN_DESC[p.plan])}</p>
                <p className="mt-5 flex items-baseline gap-2">
                  <span className="display text-5xl">
                    {p.amount.toLocaleString("en-US")}
                  </span>
                  <span className="mu">
                    {t("etb")} {t("mo")}
                  </span>
                </p>
                <ul
                  className="mt-5 space-y-2 border-t pt-5 text-sm"
                  style={line}
                >
                  {["inc1", "inc2", "inc3"].map((k) => (
                    <li key={k} className="flex items-start gap-2">
                      <Icon
                        name="check"
                        size={16}
                        className="mt-0.5 text-[var(--pri)]"
                      />
                      <span>{t(k)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto pt-6">
                  <Link href="/signup" className="btn w-full">
                    {t("startNow")}
                  </Link>
                  <p className="mu mt-3 text-center text-sm">
                    {t("hasAcc")}{" "}
                    <Link
                      href="/login"
                      className="pr font-semibold underline underline-offset-4"
                    >
                      {t("goLogin")}
                    </Link>
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ===== How to pay ===== */}
      <section id="pay" className="scroll-mt-20 px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <Head k="ovPay" title={t("htpT")} text={t("htpD")} />
          <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(([tk, dk, icon], i) => (
              <li key={tk} className="cd p-5">
                <div className="flex items-center justify-between">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-md"
                    style={{
                      background: "var(--brand-soft)",
                      color: "var(--pri)",
                    }}
                  >
                    <Icon name={icon} size={20} />
                  </span>
                  <span className="display mu text-2xl">0{i + 1}</span>
                </div>
                <h3 className="mt-4 font-semibold">{t(tk)}</h3>
                <p className="mu mt-1 text-sm">{t(dk)}</p>
              </li>
            ))}
          </ol>

          <div className="callout mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 p-4">
            <span className="mu text-sm font-semibold">{t("htpAccept")}:</span>
            <div className="flex flex-wrap gap-2">
              {BANKS.map((b) => (
                <span key={b.name} className="chip chip-n">
                  {b.name}
                </span>
              ))}
            </div>
            <span className="text-sm font-semibold sm:ml-auto">
              {t("htpNote")}
            </span>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="b1 border-y px-4 py-16 sm:px-6 sm:py-20" style={line}>
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <Head k="ovFaq" title={t("faqT")} />
          <div className="cd divide-y">
            {FAQ.map((n) => (
              <details key={n} className="group p-5" style={line}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
                  {t("q" + n)}
                  <Icon
                    name="chevronDown"
                    size={18}
                    className="transition-transform group-open:rotate-180"
                  />
                </summary>
                <p className="mu mt-3">{t("a" + n)}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Enroll ===== */}
      <section id="enroll" className="scroll-mt-20 px-4 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto grid max-w-6xl items-start gap-12 lg:grid-cols-2">
          <div>
            <Head k="ovEnroll" title={t("enrollT")} text={t("enrollD")} />
            <p className="mt-5 flex items-center gap-2 font-semibold text-[var(--pri)]">
              <Icon name="check" size={18} />
              {t("enrollNote")}
            </p>
          </div>

          <div className="cd p-6 sm:p-8">
            {enr === "ok" ? (
              <p className="ok">{t("enrollOk")}</p>
            ) : (
              <form onSubmit={sendEnroll} className="space-y-4">
                <div>
                  <label className="lbl">{t("fullName")}</label>
                  <input
                    name="full_name"
                    type="text"
                    required
                    minLength={2}
                    maxLength={100}
                    className="field"
                  />
                </div>
                <div>
                  <label className="lbl">{t("email")}</label>
                  <input
                    name="email"
                    type="email"
                    required
                    maxLength={200}
                    className="field"
                  />
                </div>
                <div>
                  <label className="lbl">{t("phone")}</label>
                  <input
                    name="phone"
                    type="tel"
                    required
                    minLength={5}
                    maxLength={40}
                    className="field"
                  />
                </div>
                <input
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  style={{ position: "absolute", left: "-9999px", opacity: 0 }}
                />

                <label className="flex items-start gap-3 text-sm">
                  <input
                    name="consent"
                    type="checkbox"
                    required
                    className="mt-0.5"
                  />
                  <span>
                    {t("consentA")}{" "}
                    <Link
                      href="/terms"
                      target="_blank"
                      className="pr font-semibold underline"
                    >
                      {t("termsT")}
                    </Link>{" "}
                    {t("consentAnd")}{" "}
                    <Link
                      href="/privacy"
                      target="_blank"
                      className="pr font-semibold underline"
                    >
                      {t("privacyT")}
                    </Link>
                    . {t("consentKid")}
                  </span>
                </label>

                <Captcha onToken={setToken} resetSignal={reset} />

                {enr === "error" && <p className="err">{t("enrollErr")}</p>}
                {enr === "limit" && <p className="err">{t("enrollLimit")}</p>}
                {enr === "captcha" && <p className="err">{t("captchaErr")}</p>}
                <button
                  type="submit"
                  disabled={enr === "sending"}
                  className="btn w-full"
                >
                  {enr === "sending" ? t("wait") : t("enrollBtn")}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ===== Teacher ===== */}
      <section
        id="about"
        className="b1 scroll-mt-20 border-y px-4 py-16 sm:px-6 sm:py-20"
        style={line}
      >
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <Photo
            src="/nafyad.jpg"
            alt="Teacher Nafyad WJ"
            cls="aspect-[4/5] w-full max-w-sm rounded-lg border"
          />
          <div>
            <p className="overline">{t("ovAbout")}</p>
            <h2 className="display mt-2 text-3xl sm:text-4xl">{t("aboutT")}</h2>
            <p className="mu mt-4 max-w-2xl text-lg leading-relaxed">
              {t("aboutD")}
            </p>
            <dl
              className="mt-8 grid max-w-xl grid-cols-3 border-t pt-6"
              style={line}
            >
              {[
                ["f1v", "f1l"],
                ["f2v", "f2l"],
                ["f3v", "f3l"],
              ].map(([v, l], i) => (
                <div
                  key={v}
                  className={i > 0 ? "border-l pl-4" : ""}
                  style={line}
                >
                  <dt className="display text-2xl">{t(v)}</dt>
                  <dd className="mu mt-1 text-sm">{t(l)}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* ===== Contact ===== */}
      <section
        id="contact"
        className="scroll-mt-20 px-4 py-16 sm:px-6 sm:py-20"
      >
        <div className="mx-auto max-w-6xl">
          <div
            className="flex flex-col items-start justify-between gap-6 rounded-lg p-8 text-white sm:p-10 md:flex-row md:items-center"
            style={{ background: "var(--deep)" }}
          >
            <div>
              <h2 className="display text-3xl">{t("conT")}</h2>
              <p className="mt-2 max-w-lg text-white/90">{t("conD")}</p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <a
                href={TG}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md bg-white px-5 font-semibold text-[#0b4a38]"
              >
                <Icon name="send" size={16} />
                {t("tg")}
              </a>
              <a
                href={`tel:${TEL}`}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md border border-white/60 px-5 font-semibold"
              >
                <Icon name="phone" size={16} />
                {TEL}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer
        className="border-t px-4 py-12 sm:px-6"
        style={{ ...line, background: "var(--card)" }}
      >
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              {logo}
              <span className="font-semibold">English with Nafyad</span>
            </div>
            <p className="mu mt-3 max-w-xs text-sm">{t("badge")}</p>
          </div>
          <div>
            <p className="font-semibold">{t("ftExplore")}</p>
            <ul className="mu mt-3 space-y-2 text-sm">
              {nav.slice(0, 5).map(([h, k]) => (
                <li key={h}>
                  <a href={h} className="hover:text-[var(--pri)]">
                    {t(k)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-semibold">{t("login")}</p>
            <ul className="mu mt-3 space-y-2 text-sm">
              <li>
                <Link href="/login" className="hover:text-[var(--pri)]">
                  {t("loginStudentT")}
                </Link>
              </li>
              <li>
                <Link
                  href="/login?as=teacher"
                  className="hover:text-[var(--pri)]"
                >
                  {t("loginTeacherT")}
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-[var(--pri)]">
                  {t("joinStudent")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="font-semibold">{t("ftContactT")}</p>
            <ul className="mu mt-3 space-y-2 text-sm">
              <li>
                <a
                  href={TG}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--pri)]"
                >
                  {t("tg")}
                </a>
              </li>
              <li>
                <a href={`tel:${TEL}`} className="hover:text-[var(--pri)]">
                  {TEL}
                </a>
              </li>
              <li>
                <Link href="/verify" className="hover:text-[var(--pri)]">
                  {t("verFoot")}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[var(--pri)]">
                  {t("privacyT")}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[var(--pri)]">
                  {t("termsT")}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <p
          className="mu mx-auto mt-10 max-w-6xl border-t pt-6 text-sm"
          style={line}
        >
          © 2026 English with Nafyad. {t("foot")}
        </p>
      </footer>
    </main>
  );
}
