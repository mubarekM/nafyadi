"use client";
import Link from "next/link";
import { useState } from "react";
import { LANGS, usePrefs } from "@/lib/prefs";

const TG = "https://t.me/NAFYADWJ";
const TEL = "+251960889388";

// EDIT YOUR CLASS TIMES HERE. "s" = daytime (sun), "m" = night (moon)
const LIVE = [
  "satsun",
  [
    ["EST", "10:00 AM - 12:00 PM", "s"],
    ["PST", "7:00 AM - 9:00 AM", "s"],
    ["EAT", "5:00 PM - 7:00 PM", "m"],
    ["ETH-LT", "ማታ 11:00 - 1:00 ሰዓት", "m"],
  ],
];
const GROUPS = [
  [
    ["EST", "10:00 AM - 12:00 PM", "s"],
    ["PST", "7:00 AM - 9:00 AM", "s"],
    ["EAT", "5:00 PM - 7:00 PM", "m"],
    ["ETH-LT", "ማታ 11:00 - 1:00 ሰዓት", "m"],
  ],
  [
    ["EST", "1:00 PM - 3:00 PM", "s"],
    ["PST", "10:00 AM - 12:00 PM", "s"],
    ["EAT", "8:00 PM - 10:00 PM", "m"],
    ["ETH-LT", "ማታ 2:00 - 4:00 ሰዓት", "m"],
  ],
  [
    ["EST", "7:00 PM - 9:00 PM", "m"],
    ["PST", "4:00 PM - 6:00 PM", "m"],
    ["EAT", "2:00 AM - 4:00 AM", "m"],
    ["ETH-LT", "ለሊት 8:00 - 10:00 ሰዓት", "m"],
  ],
  [
    ["EST", "9:00 PM - 11:00 PM", "m"],
    ["PST", "6:00 PM - 8:00 PM", "m"],
    ["EAT", "4:00 AM - 6:00 AM", "s"],
    ["ETH-LT", "ጠዋት 10:00 - 12:00 ሰዓት", "s"],
  ],
];
const PRICES = [
  ["pKids", 500],
  ["pAdults", 400],
  ["pOne", 2000],
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
      className="tx flex items-center gap-3 py-1.5 text-sm font-bold"
    >
      <span className="pill w-24 shrink-0 text-center text-xs font-extrabold">
        {z} {d === "s" ? "☀️" : "🌙"}
      </span>
      <span>{time}</span>
    </div>
  ));
}

export default function Home() {
  const { t, lang, pick, dark, flip } = usePrefs();
  const nav = [
    ["#about", "about"],
    ["#programs", "programs"],
    ["#schedule", "schedule"],
    ["#prices", "prices"],
    ["#contact", "contact"],
  ];
  const programs = [
    ["kids", "kidsD", "/kids.jpg"],
    ["teens", "teensD", "/teens.jpg"],
    ["adults", "adultsD", "/adults.jpg"],
  ];

  return (
    <main className="b0 tx overflow-x-hidden">
      <style>{`
        :root{--bg:#fff;--soft:#eff6ff;--card:#fff;--tx:#0f172a;--mu:#475569;--ln:#dbe5f3;--pri:#1d4ed8;--acc:#f97316}
        html.dark{--bg:#0b1220;--soft:#0f1a2e;--card:#121d35;--tx:#f1f5f9;--mu:#a3b1c6;--ln:#24334f;--pri:#7db2ff;--acc:#fb923c}
        html{scroll-behavior:smooth} section{scroll-margin-top:72px}
        .b0{background:var(--bg)} .b1{background:var(--soft)}
        .cd{background:var(--card);border:1px solid var(--ln);border-radius:1.25rem}
        .tx{color:var(--tx)} .mu{color:var(--mu)} .pr{color:var(--pri)} .ac{color:var(--acc)}
        .pill{background:var(--soft);border-radius:.5rem;padding:.3rem .5rem}
        .btn{background:var(--acc);color:#fff;border-radius:999px;font-weight:800;padding:.85rem 1.6rem;display:inline-block;transition:.2s}
        .btn:hover{transform:translateY(-2px);filter:brightness(1.08)}
        .btn2{border:2px solid var(--pri);color:var(--pri);border-radius:999px;font-weight:800;padding:.8rem 1.6rem;display:inline-block}
        .grad{background:linear-gradient(135deg,#1d4ed8,#f97316)}
        .lift{transition:.25s} .lift:hover{transform:translateY(-6px);box-shadow:0 20px 40px -20px rgba(29,78,216,.5)}
        @keyframes up{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:none}} .up{animation:up .7s ease both}
        @keyframes fl{50%{transform:translateY(-10px)}} .fl{animation:fl 4s ease-in-out infinite}
        @media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
      `}</style>

      {/* NAVBAR */}
      <header
        className="b0 fixed inset-x-0 top-0 z-50 border-b"
        style={{ borderColor: "var(--ln)" }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3">
          <a href="#top" className="pr text-lg font-extrabold">
            English with Nafyad
          </a>
          <nav className="hidden gap-6 md:flex">
            {nav.map(([h, k]) => (
              <a
                key={h}
                href={h}
                className="mu text-sm font-bold hover:opacity-70"
              >
                {t(k)}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <select
              value={lang}
              onChange={(e) => pick(e.target.value)}
              aria-label="Language"
              className="cd tx px-2 py-1.5 text-sm font-bold"
            >
              {Object.entries(LANGS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
            <button
              onClick={flip}
              aria-label="Dark mode"
              className="cd px-3 py-1.5 text-lg"
            >
              {dark ? "☀️" : "🌙"}
            </button>
            <Link
              href="/signup"
              className="btn hidden !px-4 !py-2 text-sm sm:inline-block"
            >
              {t("join")}
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section id="top" className="b1 px-5 pb-20 pt-32">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div className="up">
            <span className="cd pr inline-block px-4 py-2 text-sm font-extrabold">
              🎓 {t("badge")}
            </span>
            <h1 className="mt-5 text-5xl font-extrabold leading-tight sm:text-6xl">
              {t("h1a")} <span className="ac">{t("h1b")}</span>
            </h1>
            <p className="mu mt-5 max-w-xl text-lg font-semibold leading-relaxed">
              {t("sub")}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/signup" className="btn">
                {t("cta1")} →
              </Link>
              <Link href="/login" className="btn2">
                {t("cta2")}
              </Link>
            </div>
          </div>
          <div className="relative">
            <Photo
              src="/hero.jpg"
              alt="Student learning English online"
              cls="h-80 w-full rounded-3xl shadow-2xl sm:h-[26rem]"
            />
            <div className="cd fl pr absolute -bottom-5 left-4 px-5 py-3 text-sm font-extrabold shadow-xl">
              🔴 Live · Zoom / Meet
            </div>
          </div>
        </div>
      </section>

      {/* PROGRAMS */}
      <section id="programs" className="px-5 py-20">
        <h2 className="mx-auto max-w-3xl text-center text-3xl font-extrabold sm:text-4xl">
          {t("progT")}
        </h2>
        <div className="mx-auto mt-12 grid max-w-6xl gap-6 md:grid-cols-3">
          {programs.map(([n, d, img]) => (
            <div key={n} className="cd lift overflow-hidden">
              <Photo src={img} alt={t(n)} cls="h-48 w-full" />
              <div className="p-6">
                <h3 className="pr text-xl font-extrabold">{t(n)}</h3>
                <p className="mu mt-2 font-semibold">{t(d)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SCHEDULE */}
      <section id="schedule" className="b1 px-5 py-20">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <h2 className="text-4xl font-extrabold">{t("schT")}</h2>
            <p className="mu mt-4 font-semibold leading-relaxed">{t("schD")}</p>
            <div className="cd mt-8 p-6">
              <p className="text-lg font-extrabold">🔴 {t("live")}</p>
              <p
                className="pr mt-4 border-t pt-4 font-extrabold"
                style={{ borderColor: "var(--ln)" }}
              >
                📅 {t(LIVE[0])}
              </p>
              <Times rows={LIVE[1]} />
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {GROUPS.map((rows, i) => (
              <div key={i} className="cd p-6">
                <p className="text-lg font-extrabold">
                  {t("group")} {i + 1}
                </p>
                <p
                  className="pr mt-1 border-b pb-3 font-extrabold"
                  style={{ borderColor: "var(--ln)" }}
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
      <section id="prices" className="px-5 py-20">
        <h2 className="text-center text-3xl font-extrabold sm:text-4xl">
          {t("prT")}
        </h2>
        <p className="mu mt-3 text-center font-semibold">{t("pNote")}</p>
        <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
          {PRICES.map(([k, p]) => (
            <div key={k} className="cd lift p-8 text-center">
              <p className="text-lg font-extrabold">{t(k)}</p>
              <p className="pr mt-4 text-5xl font-extrabold">
                {p.toLocaleString("en-US")}
              </p>
              <p className="mu mt-1 font-bold">
                {t("etb")} {t("mo")}
              </p>
              <Link href="/signup" className="btn mt-6">
                {t("join")}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="b1 px-5 py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <Photo
            src="/nafyad.jpg"
            alt="Teacher Nafyad WJ"
            cls="mx-auto h-96 w-full max-w-sm rounded-3xl shadow-2xl"
          />
          <div>
            <h2 className="text-4xl font-extrabold">{t("aboutT")}</h2>
            <p className="mu mt-5 text-lg font-semibold leading-relaxed">
              {t("aboutD")}
            </p>
          </div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="px-5 py-20">
        <div className="grad mx-auto max-w-4xl rounded-3xl p-10 text-center text-white">
          <h2 className="text-3xl font-extrabold sm:text-4xl">{t("conT")}</h2>
          <p className="mt-3 font-semibold text-white/90">{t("conD")}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a
              href={TG}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-white px-7 py-3 font-extrabold text-blue-700"
            >
              ✈️ {t("tg")}
            </a>
            <a
              href={`tel:${TEL}`}
              className="rounded-full border-2 border-white px-7 py-3 font-extrabold"
            >
              📞 {t("call")} {TEL}
            </a>
          </div>
        </div>
      </section>

      <footer
        className="mu border-t px-5 py-8 text-center text-sm font-bold"
        style={{ borderColor: "var(--ln)" }}
      >
        © 2026 English with Nafyad. {t("foot")}
      </footer>
    </main>
  );
}
