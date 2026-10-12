"use client";
import Link from "next/link";
import { useState } from "react";
import { usePrefs } from "@/lib/prefs";
import { createClient } from "@/lib/supabase";
import Controls from "@/components/Controls";
import { BANKS, PLANS } from "@/lib/pay-config";
import { GROUPS, LIVE } from "@/lib/schedule";

const TG = "https://t.me/NAFYADWJ";
const TEL = "+251960889388";

// [CEFR badge, level name key, description key, badge background, badge text color]
const LEVELS = [
  ["A1", "lvBeginner", "ld1", "#dbeafe", "#1e3a8a"],
  ["A2", "lvElementary", "ld2", "#dcfce7", "#14532d"],
  ["B1", "lvIntermediate", "ld3", "#fef3c7", "#78350f"],
  ["B2", "lvUpper", "ld4", "#ede9fe", "#4c1d95"],
  ["C1+", "lvAdvanced", "ld5", "#fee2e2", "#7f1d1d"],
];
const SKILLS = [
  ["sk1", "🗣️"],
  ["sk2", "👂"],
  ["sk3", "📖"],
  ["sk4", "✍️"],
  ["sk5", "🧩"],
  ["sk6", "💬"],
  ["sk7", "🎤"],
  ["sk8", "📊"],
];
const STEPS = [
  ["1", "htp1T", "htp1D", "📝"],
  ["2", "htp2T", "htp2D", "🏦"],
  ["3", "htp3T", "htp3D", "📸"],
  ["4", "htp4T", "htp4D", "🎓"],
];

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

function Times({ rows }) {
  return rows.map(([z, time, d]) => (
    <div
      key={z}
      className="flex flex-wrap items-center gap-x-3 gap-y-1 py-1.5 text-sm font-bold"
    >
      <span className="pill w-24 shrink-0 text-center text-xs font-extrabold">
        {z} {d === "s" ? "☀️" : "🌙"}
      </span>
      <span className="min-w-0 break-words">{time}</span>
    </div>
  ));
}

export default function Home() {
  const { t } = usePrefs();
  const [menu, setMenu] = useState(false);
  const [enr, setEnr] = useState("idle"); // idle | sending | ok | error

  const nav = [
    ["#learn", "navLearn"],
    ["#programs", "programs"],
    ["#schedule", "schedule"],
    ["#prices", "prices"],
    ["#about", "about"],
    ["#contact", "contact"],
  ];
  const programs = [
    ["kids", "kidsD", "/kids.jpg"],
    ["teens", "teensD", "/teens.jpg"],
    ["adults", "adultsD", "/adults.jpg"],
  ];
  const line = { borderColor: "var(--ln)" };

  async function sendEnroll(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    // Hidden trap field: real people never fill it, spam bots often do
    if (fd.get("website")) {
      setEnr("ok");
      return;
    }

    setEnr("sending");
    const supabase = createClient();
    const { error } = await supabase.from("enrollments").insert({
      full_name: String(fd.get("full_name") || "").trim(),
      email: String(fd.get("email") || "").trim(),
      phone: String(fd.get("phone") || "").trim(),
      consent_at: new Date().toISOString(),
    });
    if (error) {
      setEnr("error");
      return;
    }
    form.reset();
    setEnr("ok");
  }

  return (
    <main
      id="main"
      tabIndex={-1}
      className="b0 tx overflow-x-hidden outline-none"
    >
      {/* NAVBAR */}
      <header className="b0 fixed inset-x-0 top-0 z-50 border-b-2" style={line}>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3 sm:px-6">
          <a
            href="#top"
            className="pr shrink-0 text-base font-extrabold sm:text-lg"
          >
            <span className="hidden min-[400px]:inline">English with </span>
            Nafyad
          </a>
          <nav aria-label="Main" className="hidden gap-6 xl:flex">
            {nav.map(([h, k]) => (
              <a
                key={h}
                href={h}
                className="tx text-sm font-bold underline-offset-4 hover:underline"
              >
                {t(k)}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Controls />
            <div className="hidden sm:block">
              <Link href="/signup" className="btn !px-4 !py-2 text-sm">
                {t("join")}
              </Link>
            </div>
            <button
              onClick={() => setMenu(!menu)}
              aria-label="Menu"
              aria-expanded={menu}
              className="cd min-h-[44px] min-w-[44px] px-3 py-1.5 text-lg xl:hidden"
            >
              {menu ? "✕" : "☰"}
            </button>
          </div>
        </div>
        {menu && (
          <div className="b0 border-t-2 px-4 pb-5 pt-2 xl:hidden" style={line}>
            {nav.map(([h, k]) => (
              <a
                key={h}
                href={h}
                onClick={() => setMenu(false)}
                className="tx block py-3 text-base font-bold"
              >
                {t(k)}
              </a>
            ))}
            <Link href="/signup" className="btn mt-3 flex w-full">
              {t("join")}
            </Link>
            <Link href="/login" className="btn2 mt-3 flex w-full">
              {t("login")}
            </Link>
          </div>
        )}
      </header>

      {/* HERO */}
      <section
        id="top"
        className="b1 px-4 pb-16 pt-28 sm:px-6 sm:pb-20 sm:pt-32"
      >
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="up">
            <span className="cd pr inline-block px-4 py-2 text-sm font-extrabold">
              🎓 {t("badge")}
            </span>
            <h1 className="fluid-h1 mt-5 font-extrabold">
              {t("h1a")} <span className="ac">{t("h1b")}</span>
            </h1>
            <p className="mu mt-5 max-w-xl text-base font-semibold leading-relaxed sm:text-lg">
              {t("sub")}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Link href="/signup" className="btn w-full sm:w-auto">
                {t("cta1")} →
              </Link>
              <Link href="/login" className="btn2 w-full sm:w-auto">
                {t("cta2")}
              </Link>
            </div>
            <a
              href="#enroll"
              className="pr mt-5 inline-block text-sm font-extrabold underline underline-offset-4"
            >
              {t("enrollLink")} →
            </a>
          </div>
          <div className="relative">
            <Photo
              src="/hero.jpg"
              alt="Student learning English online"
              cls="h-64 w-full rounded-3xl border-2 shadow-2xl sm:h-80 lg:h-[28rem]"
            />
            <div className="cd fl pr absolute -bottom-4 left-3 px-4 py-2.5 text-sm font-extrabold shadow-xl">
              🔴 Live · Zoom / Meet
            </div>
          </div>
        </div>
      </section>

      {/* PROGRAMS */}
      <section
        id="programs"
        className="scroll-mt-20 px-4 py-14 sm:px-6 sm:py-20"
      >
        <h2 className="fluid-h2 mx-auto max-w-3xl text-center font-extrabold">
          {t("progT")}
        </h2>
        <div className="mx-auto mt-10 grid max-w-7xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map(([n, d, img]) => (
            <div
              key={n}
              className="cd lift overflow-hidden sm:last:col-span-2 lg:last:col-span-1"
            >
              <Photo src={img} alt={t(n)} cls="h-44 w-full sm:h-48" />
              <div className="p-6">
                <h3 className="pr text-xl font-extrabold">{t(n)}</h3>
                <p className="mu mt-2 font-semibold">{t(d)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WHAT YOU LEARN */}
      <section
        id="learn"
        className="b1 scroll-mt-20 px-4 py-14 sm:px-6 sm:py-20"
      >
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="fluid-h2 font-extrabold">{t("learnT")}</h2>
          <p className="mu mt-4 text-base font-semibold sm:text-lg">
            {t("learnD")}
          </p>
        </div>

        <div className="cd mx-auto mt-10 max-w-3xl p-2 sm:p-4">
          {LEVELS.map(([code, nameKey, descKey, bg, fg], i) => (
            <div
              key={code}
              className={`flex items-start gap-4 p-4 sm:gap-5 sm:p-5 ${i > 0 ? "border-t-2" : ""}`}
              style={line}
            >
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 text-base font-extrabold sm:h-14 sm:w-14 sm:text-lg"
                style={{ background: bg, color: fg, borderColor: fg }}
              >
                {code}
              </span>
              <div className="min-w-0">
                <h3 className="text-lg font-extrabold">
                  {i + 1}. {t(nameKey)}
                </h3>
                <p className="mu mt-1 font-semibold leading-relaxed">
                  {t(descKey)}
                </p>
              </div>
            </div>
          ))}
        </div>
        <p className="mu mx-auto mt-4 max-w-3xl text-center text-sm font-bold">
          {t("cefrNote")}
        </p>

        <h3 className="mt-14 text-center text-xl font-extrabold">
          {t("skillsT")}
        </h3>
        <div className="mx-auto mt-6 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {SKILLS.map(([k, icon]) => (
            <div
              key={k}
              className="cd lift flex flex-col items-center gap-2 p-4 text-center"
            >
              <span className="text-3xl" aria-hidden="true">
                {icon}
              </span>
              <span className="text-sm font-extrabold sm:text-base">
                {t(k)}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* SCHEDULE */}
      <section
        id="schedule"
        className="scroll-mt-20 px-4 py-14 sm:px-6 sm:py-20"
      >
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <h2 className="fluid-h2 font-extrabold">{t("schT")}</h2>
            <p className="mu mt-4 font-semibold leading-relaxed">{t("schD")}</p>
            <div className="cd mt-8 p-5 sm:p-6">
              <p className="text-lg font-extrabold">🔴 {t("live")}</p>
              <p
                className="pr mt-4 border-t-2 pt-4 font-extrabold"
                style={line}
              >
                📅 {t("satsun")}
              </p>
              <Times rows={LIVE} />
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {GROUPS.map((rows, i) => (
              <div key={i} className="cd p-5 sm:p-6">
                <p className="text-lg font-extrabold">
                  {t("group")} {i + 1}
                </p>
                <p
                  className="pr mt-1 border-b-2 pb-3 font-extrabold"
                  style={line}
                >
                  {t("tuethu")}
                </p>
                <Times rows={rows} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICES */}
      <section
        id="prices"
        className="b1 scroll-mt-20 px-4 py-14 sm:px-6 sm:py-20"
      >
        <h2 className="fluid-h2 text-center font-extrabold">{t("prT")}</h2>
        <p className="mu mt-3 text-center font-semibold">{t("pNote")}</p>
        <div className="mx-auto mt-10 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PLANS.map((p) => (
            <div
              key={p.plan}
              className="cd lift p-8 text-center sm:last:col-span-2 lg:last:col-span-1"
            >
              <p className="text-lg font-extrabold">{t(p.key)}</p>
              <p className="pr mt-4 text-4xl font-extrabold sm:text-5xl">
                {p.amount.toLocaleString("en-US")}
              </p>
              <p className="mu mt-1 font-bold">
                {t("etb")} {t("mo")}
              </p>
              <Link href="/signup" className="btn mt-6 flex w-full">
                {t("join")}
              </Link>
              <p className="mu mt-4 text-sm font-bold">
                {t("hasAcc")}{" "}
                <Link
                  href="/login"
                  className="pr font-extrabold underline underline-offset-4"
                >
                  {t("goLogin")}
                </Link>
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW TO PAY */}
      <section id="pay" className="scroll-mt-20 px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="fluid-h2 font-extrabold">{t("htpT")}</h2>
            <p className="mu mt-3 font-semibold sm:text-lg">{t("htpD")}</p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map(([n, tk, dk, icon]) => (
              <div key={n} className="cd lift p-6 text-center">
                <div className="grad mx-auto flex h-14 w-14 items-center justify-center rounded-full text-xl font-extrabold text-white">
                  {n}
                </div>
                <p className="mt-3 text-2xl" aria-hidden="true">
                  {icon}
                </p>
                <h3 className="mt-2 font-extrabold">{t(tk)}</h3>
                <p className="mu mt-2 text-sm font-semibold leading-relaxed">
                  {t(dk)}
                </p>
              </div>
            ))}
          </div>

          <div className="cd mx-auto mt-8 max-w-3xl p-6 text-center">
            <p className="mu text-sm font-extrabold uppercase tracking-widest">
              {t("htpAccept")}
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {BANKS.map((b) => (
                <span key={b.name} className="chip chip-n">
                  🏦 {b.name}
                </span>
              ))}
            </div>
            <p className="pr mt-4 font-extrabold">✓ {t("htpNote")}</p>
            <Link href="/signup" className="btn mt-5">
              {t("htpBtn")} →
            </Link>
          </div>
        </div>
      </section>

      {/* ENROLL */}
      <section
        id="enroll"
        className="b1 scroll-mt-20 px-4 py-14 sm:px-6 sm:py-20"
      >
        <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-2">
          <div>
            <h2 className="fluid-h2 font-extrabold">{t("enrollT")}</h2>
            <p className="mu mt-4 text-base font-semibold leading-relaxed sm:text-lg">
              {t("enrollD")}
            </p>
            <p className="pr mt-4 font-extrabold">✓ {t("enrollNote")}</p>
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

                <label
                  className="flex items-start gap-3 rounded-xl border-2 p-3 text-sm font-bold"
                  style={{ borderColor: "var(--bd)" }}
                >
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
                      className="pr font-extrabold underline"
                    >
                      {t("termsT")}
                    </Link>{" "}
                    {t("consentAnd")}{" "}
                    <Link
                      href="/privacy"
                      target="_blank"
                      className="pr font-extrabold underline"
                    >
                      {t("privacyT")}
                    </Link>
                    . {t("consentKid")}
                  </span>
                </label>

                {enr === "error" && <p className="err">{t("enrollErr")}</p>}
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

      {/* ABOUT */}
      <section id="about" className="scroll-mt-20 px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <Photo
            src="/nafyad.jpg"
            alt="Teacher Nafyad WJ"
            cls="mx-auto h-80 w-full max-w-sm rounded-3xl border-2 shadow-2xl sm:h-96"
          />
          <div>
            <h2 className="fluid-h2 font-extrabold">{t("aboutT")}</h2>
            <p className="mu mt-5 text-base font-semibold leading-relaxed sm:text-lg">
              {t("aboutD")}
            </p>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section
        id="contact"
        className="b1 scroll-mt-20 px-4 py-14 sm:px-6 sm:py-20"
      >
        <div
          className="grad mx-auto max-w-4xl rounded-3xl border-2 p-6 text-center text-white sm:p-10"
          style={{ borderColor: "rgba(255,255,255,.35)" }}
        >
          <h2 className="fluid-h2 font-extrabold">{t("conT")}</h2>
          <p className="mt-3 font-semibold text-white">{t("conD")}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
            <a
              href={TG}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[48px] items-center justify-center rounded-full bg-white px-7 py-3 text-center font-extrabold text-blue-900"
            >
              ✈️ {t("tg")}
            </a>
            <a
              href={`tel:${TEL}`}
              className="inline-flex min-h-[48px] items-center justify-center break-words rounded-full border-2 border-white px-7 py-3 text-center font-extrabold"
            >
              📞 {t("call")} {TEL}
            </a>
          </div>
        </div>
      </section>

      <footer
        className="border-t-2 px-4 py-8 text-center text-sm font-bold"
        style={line}
      >
        <div className="mb-3 flex flex-wrap justify-center gap-x-6 gap-y-2">
          <Link
            href="/privacy"
            className="pr font-extrabold underline underline-offset-4"
          >
            {t("privacyT")}
          </Link>
          <Link
            href="/terms"
            className="pr font-extrabold underline underline-offset-4"
          >
            {t("termsT")}
          </Link>
        </div>
        <p className="mu">© 2026 English with Nafyad. {t("foot")}</p>
      </footer>
    </main>
  );
}
