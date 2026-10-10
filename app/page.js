"use client";
import Link from "next/link";
import { useState } from "react";
import { usePrefs } from "@/lib/prefs";
import { createClient } from "@/lib/supabase";
import Controls from "@/components/Controls";

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

// [CEFR badge, level name key, description key, badge background, badge text color]
const LEVELS = [
  ["A1", "lvBeginner", "ld1", "#dbeafe", "#1d4ed8"],
  ["A2", "lvElementary", "ld2", "#dcfce7", "#166534"],
  ["B1", "lvIntermediate", "ld3", "#fef3c7", "#92400e"],
  ["B2", "lvUpper", "ld4", "#ede9fe", "#6d28d9"],
  ["C1+", "lvAdvanced", "ld5", "#fee2e2", "#b91c1c"],
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
    });
    if (error) {
      setEnr("error");
      return;
    }
    form.reset();
    setEnr("ok");
  }

  return (
    <main className="b0 tx overflow-x-hidden">
      {/* NAVBAR */}
      <header className="b0 fixed inset-x-0 top-0 z-50 border-b" style={line}>
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-3 sm:px-6">
          <a
            href="#top"
            className="pr shrink-0 text-base font-extrabold sm:text-lg"
          >
            <span className="hidden min-[400px]:inline">English with </span>
            Nafyad
          </a>
          <nav className="hidden gap-6 xl:flex">
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
            <Controls />
            <div className="hidden sm:block">
              <Link href="/signup" className="btn !px-4 !py-2 text-sm">
                {t("join")}
              </Link>
            </div>
            <button
              onClick={() => setMenu(!menu)}
              aria-label="Menu"
              className="cd px-3 py-1.5 text-lg xl:hidden"
            >
              {menu ? "✕" : "☰"}
            </button>
          </div>
        </div>
        {menu && (
          <div className="b0 border-t px-4 pb-5 pt-2 xl:hidden" style={line}>
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
            <Link href="/signup" className="btn mt-3 block w-full">
              {t("join")}
            </Link>
            <Link href="/login" className="btn2 mt-3 block w-full">
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
              className="pr mt-5 inline-block text-sm font-extrabold hover:underline"
            >
              {t("enrollLink")} →
            </a>
          </div>
          <div className="relative">
            <Photo
              src="/hero.jpg"
              alt="Student learning English online"
              cls="h-64 w-full rounded-3xl shadow-2xl sm:h-80 lg:h-[28rem]"
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
              className={`flex items-start gap-4 p-4 sm:gap-5 sm:p-5 ${i > 0 ? "border-t" : ""}`}
              style={line}
            >
              <span
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-base font-extrabold sm:h-14 sm:w-14 sm:text-lg"
                style={{ background: bg, color: fg }}
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
              <span className="text-3xl">{icon}</span>
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
              <p className="pr mt-4 border-t pt-4 font-extrabold" style={line}>
                📅 {t(LIVE[0])}
              </p>
              <Times rows={LIVE[1]} />
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            {GROUPS.map((rows, i) => (
              <div key={i} className="cd p-5 sm:p-6">
                <p className="text-lg font-extrabold">
                  {t("group")} {i + 1}
                </p>
                <p
                  className="pr mt-1 border-b pb-3 font-extrabold"
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
          {PRICES.map(([k, p]) => (
            <div
              key={k}
              className="cd lift p-8 text-center sm:last:col-span-2 lg:last:col-span-1"
            >
              <p className="text-lg font-extrabold">{t(k)}</p>
              <p className="pr mt-4 text-4xl font-extrabold sm:text-5xl">
                {p.toLocaleString("en-US")}
              </p>
              <p className="mu mt-1 font-bold">
                {t("etb")} {t("mo")}
              </p>
              <Link href="/signup" className="btn mt-6 w-full">
                {t("join")}
              </Link>
              <p className="mu mt-4 text-sm font-bold">
                {t("hasAcc")}{" "}
                <Link
                  href="/login"
                  className="pr font-extrabold hover:underline"
                >
                  {t("goLogin")}
                </Link>
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ENROLL */}
      <section id="enroll" className="scroll-mt-20 px-4 py-14 sm:px-6 sm:py-20">
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
      <section
        id="about"
        className="b1 scroll-mt-20 px-4 py-14 sm:px-6 sm:py-20"
      >
        <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <Photo
            src="/nafyad.jpg"
            alt="Teacher Nafyad WJ"
            cls="mx-auto h-80 w-full max-w-sm rounded-3xl shadow-2xl sm:h-96"
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
        className="scroll-mt-20 px-4 py-14 sm:px-6 sm:py-20"
      >
        <div className="grad mx-auto max-w-4xl rounded-3xl p-6 text-center text-white sm:p-10">
          <h2 className="fluid-h2 font-extrabold">{t("conT")}</h2>
          <p className="mt-3 font-semibold text-white/90">{t("conD")}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
            <a
              href={TG}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-full bg-white px-7 py-3 text-center font-extrabold text-blue-700"
            >
              ✈️ {t("tg")}
            </a>
            <a
              href={`tel:${TEL}`}
              className="inline-block break-words rounded-full border-2 border-white px-7 py-3 text-center font-extrabold"
            >
              📞 {t("call")} {TEL}
            </a>
          </div>
        </div>
      </section>

      <footer
        className="mu border-t px-4 py-8 text-center text-sm font-bold"
        style={line}
      >
        © 2026 English with Nafyad. {t("foot")}
      </footer>
    </main>
  );
}
