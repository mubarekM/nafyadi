"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const WORDS = ["confidently", "fluently", "naturally", "like a native"];

const MARQUEE = [
  "Real-world conversation",
  "Academic success",
  "Powerful presentations",
  "Business English",
  "Kids & teens",
  "Adults & professionals",
  "Live interactive classes",
  "Step-by-step learning",
];

const PROGRAMS = [
  {
    icon: "🧒",
    title: "Kids",
    color: "#fde68a",
    text: "Playful, friendly lessons that build a love for English from the very first class.",
  },
  {
    icon: "🎒",
    title: "Teens & Students",
    color: "#c4b5fd",
    text: "Reach your academic goals with clear explanations, practice, and teacher feedback.",
  },
  {
    icon: "🌍",
    title: "Adults",
    color: "#fbcfe8",
    text: "Speak naturally in everyday life, travel, and new friendships without fear of mistakes.",
  },
  {
    icon: "💼",
    title: "Professionals",
    color: "#a7f3d0",
    text: "Communicate with confidence at work and deliver presentations people remember.",
  },
];

const FEATURES = [
  {
    icon: "🎬",
    title: "Lessons you can revisit",
    text: "Read, watch videos, listen to audio, and download PDFs. Learn at your own pace, any time.",
  },
  {
    icon: "📝",
    title: "Quizzes with real feedback",
    text: "Your teacher personally checks your answers and tells you exactly how to improve.",
  },
  {
    icon: "📈",
    title: "See your progress",
    text: "Track your scores, completed lessons, and notes from your teacher in one place.",
  },
  {
    icon: "🎥",
    title: "Live classes",
    text: "Join interactive classes with your teacher, ask questions, and practice speaking out loud.",
  },
];

const STEPS = [
  {
    n: "1",
    title: "Create your account",
    text: "Fill in a short form with your name, level, and contact details.",
  },
  {
    n: "2",
    title: "Get approved",
    text: "Your teacher reviews your request and approves your account.",
  },
  {
    n: "3",
    title: "Start learning",
    text: "Open lessons, take quizzes, and track your progress.",
  },
  {
    n: "4",
    title: "Speak live",
    text: "Join live classes and practice real conversations.",
  },
];

const FAQ = [
  {
    q: "Who can join?",
    a: "Kids, teenagers, students, adults, and professionals. All levels are welcome, from complete beginner to advanced.",
  },
  {
    q: "How do I join?",
    a: "Create an account with your details. Your teacher reviews it and approves it, and then you can log in.",
  },
  {
    q: "How do live classes work?",
    a: "Your teacher schedules classes on the platform. Open the Live Class page, check the time, and click Join.",
  },
  {
    q: "Will I get feedback on my work?",
    a: "Yes. Your teacher checks your quizzes personally and leaves feedback and notes you can read on your progress page.",
  },
  {
    q: "What do I need to start?",
    a: "A phone, tablet, or computer with internet, and the wish to practice. That is all.",
  },
];

function SectionTitle({ eyebrow, title, text, light }) {
  return (
    <div className="nh-reveal mx-auto max-w-2xl text-center">
      <p
        className={`text-sm font-bold uppercase tracking-widest ${
          light ? "text-fuchsia-300" : "text-purple-600"
        }`}
      >
        {eyebrow}
      </p>
      <h2
        className={`mt-3 text-3xl font-extrabold leading-tight sm:text-4xl ${
          light ? "text-white" : "text-gray-900"
        }`}
      >
        {title}
      </h2>
      {text && (
        <p
          className={`mt-4 text-lg ${light ? "text-purple-200" : "text-gray-600"}`}
        >
          {text}
        </p>
      )}
    </div>
  );
}

export default function Home() {
  const rootRef = useRef(null);
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const [photoOk, setPhotoOk] = useState(true);

  // Scroll-reveal animation
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    root.classList.add("nh-anim");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("nh-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    root.querySelectorAll(".nh-reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Navbar background on scroll
  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Rotating headline word
  useEffect(() => {
    const t = setInterval(() => {
      setWordIndex((i) => (i + 1) % WORDS.length);
    }, 2600);
    return () => clearInterval(t);
  }, []);

  const navLinks = [
    { href: "#about", label: "About" },
    { href: "#programs", label: "Programs" },
    { href: "#how", label: "How it works" },
    { href: "#faq", label: "FAQ" },
  ];

  return (
    <main
      ref={rootRef}
      className="nh-root overflow-x-hidden bg-white text-gray-900"
    >
      <style>{`
        html { scroll-behavior: smooth; }
        .nh-section { scroll-margin-top: 80px; }

        @keyframes nh-float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-14px) } }
        @keyframes nh-blob {
          0%,100% { transform: translate(0,0) scale(1) }
          33% { transform: translate(40px,-50px) scale(1.12) }
          66% { transform: translate(-30px,30px) scale(0.94) }
        }
        @keyframes nh-marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }
        @keyframes nh-pop { from { opacity: 0; transform: translateY(14px) scale(.96) } to { opacity: 1; transform: none } }
        @keyframes nh-shine { to { background-position: 200% center } }
        @keyframes nh-word { from { opacity: 0; transform: translateY(.4em) } to { opacity: 1; transform: none } }
        @keyframes nh-pulse { 0% { box-shadow: 0 0 0 0 rgba(74,222,128,.6) } 100% { box-shadow: 0 0 0 12px rgba(74,222,128,0) } }

        .nh-float { animation: nh-float 5s ease-in-out infinite; }
        .nh-float-slow { animation: nh-float 7s ease-in-out infinite; animation-delay: -2s; }
        .nh-blob { animation: nh-blob 14s ease-in-out infinite; }
        .nh-blob-2 { animation: nh-blob 18s ease-in-out infinite reverse; }
        .nh-marquee-track { display: flex; width: max-content; animation: nh-marquee 32s linear infinite; }
        .nh-pop { opacity: 0; animation: nh-pop .7s ease forwards; }
        .nh-word { display: inline-block; animation: nh-word .6s ease both; }
        .nh-live-dot { animation: nh-pulse 1.6s ease-out infinite; }

        .nh-grad-hero { background: linear-gradient(135deg, #1a0b3b 0%, #3b1a7a 45%, #7e22ce 100%); }
        .nh-grad-dark { background: linear-gradient(160deg, #12082b 0%, #2a1060 100%); }
        .nh-grad-band { background: linear-gradient(90deg, #7e22ce, #c026d3, #7e22ce); }
        .nh-grad-cta { background: linear-gradient(135deg, #6d28d9 0%, #c026d3 55%, #f59e0b 120%); }
        .nh-grad-text {
          background: linear-gradient(90deg, #f0abfc, #fde68a, #f0abfc);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: nh-shine 4s linear infinite;
        }
        .nh-glass {
          background: rgba(255,255,255,.1);
          border: 1px solid rgba(255,255,255,.2);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
        }
        .nh-dots {
          background-image: radial-gradient(rgba(255,255,255,.18) 1.5px, transparent 1.5px);
          background-size: 26px 26px;
        }
        .nh-card { transition: transform .3s ease, box-shadow .3s ease; }
        .nh-card:hover { transform: translateY(-8px); box-shadow: 0 24px 50px -20px rgba(109,40,217,.45); }

        .nh-anim .nh-reveal { opacity: 0; transform: translateY(32px); transition: opacity .8s ease, transform .8s ease; }
        .nh-anim .nh-reveal.nh-in { opacity: 1; transform: none; }
        .nh-d1 { transition-delay: .1s !important; }
        .nh-d2 { transition-delay: .2s !important; }
        .nh-d3 { transition-delay: .3s !important; }

        .nh-faq summary { list-style: none; cursor: pointer; }
        .nh-faq summary::-webkit-details-marker { display: none; }
        .nh-faq details[open] .nh-plus { transform: rotate(45deg); }
        .nh-plus { transition: transform .25s ease; }

        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition: none !important; }
          .nh-anim .nh-reveal { opacity: 1; transform: none; }
          .nh-pop { opacity: 1; }
        }
      `}</style>

      {/* ============ NAVBAR ============ */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#1a0b3b]/90 shadow-lg backdrop-blur"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <a href="#top" className="text-xl font-extrabold text-white">
            English with <span className="nh-grad-text">Nafyad</span>
          </a>

          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm font-semibold text-purple-100 transition hover:text-white"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/login"
              className="rounded-full border border-white/30 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Student Login
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-amber-300 px-5 py-2 text-sm font-bold text-purple-900 transition hover:bg-amber-200"
            >
              Join Now
            </Link>
          </div>

          <button
            onClick={() => setMenu((m) => !m)}
            aria-label="Menu"
            className="rounded-lg border border-white/30 px-3 py-2 text-white md:hidden"
          >
            {menu ? "✕" : "☰"}
          </button>
        </div>

        {menu && (
          <div className="border-t border-white/10 bg-[#1a0b3b] px-6 pb-6 pt-2 md:hidden">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMenu(false)}
                className="block py-3 font-semibold text-purple-100"
              >
                {l.label}
              </a>
            ))}
            <div className="mt-3 flex gap-3">
              <Link
                href="/login"
                className="flex-1 rounded-full border border-white/30 py-2 text-center text-sm font-semibold text-white"
              >
                Student Login
              </Link>
              <Link
                href="/signup"
                className="flex-1 rounded-full bg-amber-300 py-2 text-center text-sm font-bold text-purple-900"
              >
                Join Now
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ============ HERO ============ */}
      <section
        id="top"
        className="nh-grad-hero relative overflow-hidden pb-28 pt-32 text-white"
      >
        <div className="nh-dots absolute inset-0 opacity-60" />
        <div className="nh-blob absolute -left-24 top-10 h-80 w-80 rounded-full bg-fuchsia-500/40 blur-3xl" />
        <div className="nh-blob-2 absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-indigo-500/40 blur-3xl" />

        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-6 lg:grid-cols-2">
          <div>
            <span className="nh-glass inline-block rounded-full px-4 py-2 text-sm font-semibold text-purple-100">
              🎓 Live English classes, from the comfort of home
            </span>

            <h1 className="mt-6 text-5xl font-extrabold leading-[1.08] sm:text-6xl">
              Speak English
              <br />
              <span
                key={wordIndex}
                className="nh-word nh-grad-text font-serif italic"
              >
                {WORDS[wordIndex]}
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-purple-100">
              Interactive, step-by-step live classes with a teacher who guides
              you personally. Master real-world communication, reach your
              academic goals, and deliver powerful presentations.
            </p>

            <div className="mt-9 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/signup"
                className="rounded-full bg-amber-300 px-8 py-4 text-center text-lg font-extrabold text-purple-900 shadow-[0_10px_40px_-10px_rgba(252,211,77,.8)] transition hover:-translate-y-1 hover:bg-amber-200"
              >
                Join as a Student →
              </Link>
              <Link
                href="/login"
                className="nh-glass rounded-full px-8 py-4 text-center text-lg font-bold text-white transition hover:bg-white/20"
              >
                I already have an account
              </Link>
            </div>

            <div className="mt-10 grid max-w-md grid-cols-3 gap-4 text-center">
              {[
                ["5+", "years teaching"],
                ["All", "levels welcome"],
                ["Live", "& interactive"],
              ].map(([big, small]) => (
                <div key={small} className="nh-glass rounded-2xl px-2 py-3">
                  <p className="text-2xl font-extrabold text-amber-300">
                    {big}
                  </p>
                  <p className="text-xs text-purple-100">{small}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Hero visual: live chat card */}
          <div className="relative mx-auto w-full max-w-md">
            <div className="nh-float absolute -left-3 -top-7 z-10 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-purple-700 shadow-xl">
              🔥 Live class today
            </div>
            <div className="nh-float-slow absolute -bottom-7 -right-2 z-10 rounded-2xl bg-amber-300 px-4 py-3 text-sm font-bold text-purple-900 shadow-xl">
              ⭐ Step by step
            </div>

            <div className="nh-glass rounded-3xl p-6 shadow-2xl">
              <div className="flex items-center gap-3 border-b border-white/15 pb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-300 text-xl font-extrabold text-purple-900">
                  N
                </div>
                <div>
                  <p className="font-bold">Nafyad WJ</p>
                  <p className="flex items-center gap-2 text-xs text-purple-100">
                    <span className="nh-live-dot inline-block h-2.5 w-2.5 rounded-full bg-green-400" />
                    Online · Live class
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3 text-sm">
                <div
                  className="nh-pop max-w-[85%] rounded-2xl rounded-tl-sm bg-white/90 px-4 py-3 text-gray-800"
                  style={{ animationDelay: ".4s" }}
                >
                  Hello! How are you feeling today? 😊
                </div>
                <div
                  className="nh-pop ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-purple-500 px-4 py-3 text-white"
                  style={{ animationDelay: "1.2s" }}
                >
                  I am great! Today I want to practice speaking.
                </div>
                <div
                  className="nh-pop max-w-[85%] rounded-2xl rounded-tl-sm bg-white/90 px-4 py-3 text-gray-800"
                  style={{ animationDelay: "2s" }}
                >
                  Perfect! Let us start. Tell me about your day. 🎤
                </div>
                <div
                  className="nh-pop ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-amber-300 px-4 py-3 font-semibold text-purple-900"
                  style={{ animationDelay: "2.8s" }}
                >
                  Great job! Your English sounds natural! 👏
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave */}
        <svg
          className="absolute bottom-0 left-0 w-full"
          viewBox="0 0 1440 90"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            fill="#ffffff"
            d="M0,40 C240,100 480,0 720,40 C960,80 1200,10 1440,50 L1440,90 L0,90 Z"
          />
        </svg>
      </section>

      {/* ============ MARQUEE BAND ============ */}
      <div className="nh-grad-band overflow-hidden py-4">
        <div className="nh-marquee-track">
          {[...MARQUEE, ...MARQUEE].map((item, i) => (
            <span
              key={i}
              className="mx-6 whitespace-nowrap text-sm font-bold uppercase tracking-widest text-white"
            >
              ✦ {item}
            </span>
          ))}
        </div>
      </div>

      {/* ============ ABOUT ============ */}
      <section id="about" className="nh-section bg-white px-6 py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-2">
          <div className="nh-reveal relative mx-auto w-full max-w-sm">
            <div className="absolute -inset-4 rotate-3 rounded-[2rem] bg-gradient-to-br from-purple-300 to-fuchsia-300 opacity-70" />
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-gradient-to-br from-purple-600 to-fuchsia-600 shadow-2xl">
              {photoOk ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src="/nafyad.jpg"
                  alt="Nafyad WJ, English teacher"
                  className="h-full w-full object-cover"
                  onError={() => setPhotoOk(false)}
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center text-white">
                  <div className="nh-float flex h-32 w-32 items-center justify-center rounded-full bg-white/20 text-7xl font-extrabold">
                    N
                  </div>
                  <p className="mt-6 text-2xl font-bold">Nafyad WJ</p>
                  <p className="text-purple-100">English Teacher</p>
                </div>
              )}
            </div>
            <div className="nh-float-slow absolute -bottom-5 -right-4 rounded-2xl bg-white px-5 py-3 text-center shadow-xl">
              <p className="text-2xl font-extrabold text-purple-700">5+</p>
              <p className="text-xs font-semibold text-gray-600">
                years of teaching
              </p>
            </div>
          </div>

          <div className="nh-reveal nh-d1">
            <p className="text-sm font-bold uppercase tracking-widest text-purple-600">
              Meet your teacher
            </p>
            <h2 className="mt-3 text-4xl font-extrabold leading-tight sm:text-5xl">
              Hi, I&apos;m{" "}
              <span className="font-serif italic text-purple-600">
                Nafyad WJ!
              </span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-gray-600">
              With 5 years of teaching experience, I help students and
              professionals speak English naturally and confidently, just like a
              native speaker. Through interactive, step-by-step live classes,
              you will master real-world communication, ace your academic goals,
              and deliver powerful presentations.
            </p>

            <ul className="mt-8 space-y-4">
              {[
                ["🗣️", "Speak naturally and confidently"],
                ["🎯", "Reach your academic goals"],
                ["🎤", "Deliver powerful presentations"],
              ].map(([icon, text]) => (
                <li key={text} className="flex items-center gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-2xl">
                    {icon}
                  </span>
                  <span className="text-lg font-semibold">{text}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/signup"
              className="mt-10 inline-block rounded-full bg-purple-600 px-8 py-3.5 font-bold text-white shadow-lg shadow-purple-300 transition hover:-translate-y-1 hover:bg-purple-700"
            >
              Start learning with me →
            </Link>
          </div>
        </div>
      </section>

      {/* ============ PROGRAMS ============ */}
      <section id="programs" className="nh-section bg-purple-50 px-6 py-24">
        <SectionTitle
          eyebrow="For everyone"
          title="English for every age and every goal"
          text="From a child's first words to a professional's big presentation, there is a place for you here."
        />
        <div className="mx-auto mt-14 grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PROGRAMS.map((p, i) => (
            <div
              key={p.title}
              className={`nh-reveal nh-card rounded-3xl bg-white p-7 shadow-md ${
                i === 1 ? "nh-d1" : i === 2 ? "nh-d2" : i === 3 ? "nh-d3" : ""
              }`}
            >
              <div
                className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
                style={{ background: p.color }}
              >
                {p.icon}
              </div>
              <h3 className="mt-5 text-xl font-extrabold">{p.title}</h3>
              <p className="mt-2 leading-relaxed text-gray-600">{p.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ PLATFORM FEATURES ============ */}
      <section className="nh-grad-dark relative overflow-hidden px-6 py-24">
        <div className="nh-dots absolute inset-0 opacity-40" />
        <div className="nh-blob absolute right-0 top-0 h-72 w-72 rounded-full bg-fuchsia-500/30 blur-3xl" />
        <div className="relative">
          <SectionTitle
            light
            eyebrow="Your online classroom"
            title="Everything you need, in one place"
            text="Log in and find your lessons, quizzes, progress, and live classes waiting for you."
          />
          <div className="mx-auto mt-14 grid max-w-6xl gap-6 sm:grid-cols-2">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className={`nh-reveal nh-glass nh-card flex gap-5 rounded-3xl p-7 text-white ${
                  i % 2 === 1 ? "nh-d1" : ""
                }`}
              >
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-3xl">
                  {f.icon}
                </span>
                <div>
                  <h3 className="text-xl font-bold">{f.title}</h3>
                  <p className="mt-2 leading-relaxed text-purple-100">
                    {f.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section id="how" className="nh-section bg-white px-6 py-24">
        <SectionTitle
          eyebrow="Simple to start"
          title="How it works"
          text="Four easy steps from signing up to speaking."
        />
        <div className="mx-auto mt-16 grid max-w-6xl gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <div
              key={s.n}
              className={`nh-reveal relative text-center ${
                i === 1 ? "nh-d1" : i === 2 ? "nh-d2" : i === 3 ? "nh-d3" : ""
              }`}
            >
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-fuchsia-500 text-3xl font-extrabold text-white shadow-xl shadow-purple-300">
                {s.n}
              </div>
              <h3 className="mt-5 text-xl font-extrabold">{s.title}</h3>
              <p className="mt-2 leading-relaxed text-gray-600">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section id="faq" className="nh-section bg-purple-50 px-6 py-24">
        <SectionTitle eyebrow="Questions" title="Frequently asked questions" />
        <div className="nh-faq mx-auto mt-12 max-w-3xl space-y-4">
          {FAQ.map((item) => (
            <details
              key={item.q}
              className="nh-reveal group rounded-2xl bg-white p-6 shadow-sm"
            >
              <summary className="flex items-center justify-between gap-4 text-lg font-bold">
                {item.q}
                <span className="nh-plus flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-100 text-xl text-purple-700">
                  +
                </span>
              </summary>
              <p className="mt-4 leading-relaxed text-gray-600">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="nh-grad-cta relative overflow-hidden px-6 py-24 text-center text-white">
        <div className="nh-dots absolute inset-0 opacity-50" />
        <div className="nh-blob absolute -left-10 top-0 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
        <div className="nh-reveal relative mx-auto max-w-3xl">
          <h2 className="text-4xl font-extrabold leading-tight sm:text-5xl">
            Your English journey{" "}
            <span className="font-serif italic">starts today</span>
          </h2>
          <p className="mt-5 text-lg text-white/90">
            Join live classes, learn step by step, and speak with confidence.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="rounded-full bg-white px-9 py-4 text-lg font-extrabold text-purple-700 shadow-2xl transition hover:-translate-y-1"
            >
              Join as a Student →
            </Link>
            <Link
              href="/login"
              className="rounded-full border-2 border-white/70 px-9 py-4 text-lg font-bold text-white transition hover:bg-white/10"
            >
              Student Login
            </Link>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="bg-[#12082b] px-6 py-10 text-center text-purple-200">
        <p className="text-lg font-extrabold text-white">
          English with <span className="nh-grad-text">Nafyad</span>
        </p>
        <p className="mt-2 text-sm">
          Live English classes for kids, students, adults, and professionals.
        </p>
        <div className="mt-5 flex justify-center gap-6 text-sm font-semibold">
          <a href="#about" className="hover:text-white">
            About
          </a>
          <a href="#programs" className="hover:text-white">
            Programs
          </a>
          <a href="#faq" className="hover:text-white">
            FAQ
          </a>
          <Link href="/login" className="hover:text-white">
            Student Login
          </Link>
        </div>
        <p className="mt-6 text-xs text-purple-300">
          © 2026 English with Nafyad. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
