"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import AppShell from "./AppShell";

const GROUPS = [
  {
    key: "people",
    label: "People",
    icon: "👥",
    children: [
      { href: "/admin/dashboard", label: "Students", icon: "👥" },
      { href: "/admin/enrollments", label: "Enrollments", icon: "📩" },
    ],
  },
  {
    key: "learn",
    label: "Learning",
    icon: "📚",
    children: [
      { href: "/admin/lessons", label: "Lessons", icon: "📚" },
      { href: "/admin/quizzes", label: "Quizzes", icon: "📝" },
      { href: "/admin/live-classes", label: "Live Classes", icon: "🎥" },
      { href: "/admin/attendance", label: "Attendance", icon: "✅" },
    ],
  },
  { key: "pay", label: "Payments", icon: "💳", href: "/admin/payments" },
  {
    key: "cert",
    label: "Certificates",
    icon: "🎓",
    href: "/admin/certificates",
  },
  { key: "chat", label: "Discussion", icon: "💬", href: "/admin/discussion" },
];

const TABS = [
  { href: "/admin/dashboard", icon: "👥", label: "Students" },
  { href: "/admin/payments", icon: "💳", label: "Payments" },
  { href: "/admin/lessons", icon: "📚", label: "Lessons" },
  { href: "/admin/quizzes", icon: "📝", label: "Quizzes" },
];

const CHIPS = {
  "/admin/dashboard": "Approve, notes, groups and passwords",
  "/admin/enrollments": "Requests from your home page",
  "/admin/lessons": "Weeks, videos, notes and private files",
  "/admin/quizzes": "Create quizzes and grade answers",
  "/admin/live-classes": "Schedule your live classes",
  "/admin/attendance": "Who joined your live classes",
  "/admin/payments": "Review payment screenshots",
  "/admin/certificates": "Issue certificates",
  "/admin/discussion": "Class chat room",
};

function Notice({ title, text, children }) {
  return (
    <div className="tx flex min-h-dvh items-center justify-center px-4">
      <div className="cd w-full max-w-md p-8 text-center">
        <p className="text-4xl" aria-hidden="true">
          🔐
        </p>
        <h1 className="mt-3 text-2xl font-extrabold">{title}</h1>
        <p className="mu mt-3 font-semibold leading-relaxed">{text}</p>
        <div className="mt-6 flex flex-col gap-3">{children}</div>
      </div>
    </div>
  );
}

export default function AdminShell({ children }) {
  const router = useRouter();
  const path = usePathname();
  const isLogin = path === "/admin/login";
  const [state, setState] = useState("loading"); // loading | ok | student | slow | error
  const [name, setName] = useState("");
  const [badges, setBadges] = useState({});
  const [tries, setTries] = useState(0);

  useEffect(() => {
    if (isLogin) return;
    let alive = true;

    // If loading takes too long, show a helpful screen instead of "..."
    const timer = setTimeout(() => {
      if (alive) setState((s) => (s === "loading" ? "slow" : s));
    }, 8000);

    async function start() {
      try {
        const supabase = createClient();
        const { data: u, error: userError } = await supabase.auth.getUser();
        if (!alive) return;
        if (userError || !u?.user) {
          router.replace("/admin/login");
          return;
        }

        const { data: p, error: profileError } = await supabase
          .from("profiles")
          .select("role, full_name")
          .eq("id", u.user.id)
          .single();
        if (!alive) return;
        if (profileError) {
          setState("error");
          return;
        }
        if (p?.role !== "admin") {
          setState("student");
          return;
        }

        setName(p.full_name || "Admin");
        setState("ok");

        const pay = await supabase
          .from("payments")
          .select("id", { count: "exact", head: true })
          .eq("status", "pending");
        const enr = await supabase
          .from("enrollments")
          .select("id", { count: "exact", head: true })
          .eq("status", "new");
        if (alive) {
          setBadges({
            "/admin/payments": pay.count || 0,
            "/admin/enrollments": enr.count || 0,
          });
        }
      } catch {
        if (alive) setState("error");
      }
    }
    start();

    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [path, isLogin, router, tries]);

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setState("loading");
    router.replace("/admin/login");
  }

  function retry() {
    setState("loading");
    setTries((n) => n + 1);
  }

  if (isLogin) return children;

  if (state === "student") {
    return (
      <Notice
        title="You are signed in as a student"
        text="This browser is logged in with a student account, so the teacher area stays closed. Log out, then sign in with your teacher email."
      >
        <button onClick={logout} className="btn w-full">
          Log out and open admin login
        </button>
        <a href="/student" className="btn2 w-full">
          Go to my student page
        </a>
      </Notice>
    );
  }

  if (state === "slow" || state === "error") {
    return (
      <Notice
        title="The admin area did not load"
        text="Check your internet connection and try again. If it keeps happening, sign in again."
      >
        <button onClick={retry} className="btn w-full">
          Try again
        </button>
        <button onClick={logout} className="btn2 w-full">
          Sign in again
        </button>
      </Notice>
    );
  }

  if (state !== "ok") {
    return (
      <div className="tx flex min-h-dvh items-center justify-center font-bold">
        ...
      </div>
    );
  }

  // Breadcrumbs: Admin > Group > Page
  let crumbs = ["Admin"];
  let chip = "";
  for (const g of GROUPS) {
    if (g.children) {
      const c = g.children.find((x) => path.startsWith(x.href));
      if (c) {
        crumbs = ["Admin", g.label, c.label];
        chip = CHIPS[c.href] || "";
      }
    } else if (path.startsWith(g.href)) {
      crumbs = ["Admin", g.label];
      chip = CHIPS[g.href] || "";
    }
  }

  return (
    <AppShell
      brand="English with Nafyad"
      tag="Teacher admin"
      groups={GROUPS}
      tabs={TABS}
      badges={badges}
      user={{ name, sub: "Teacher" }}
      crumbs={crumbs}
      chip={chip}
      moreLabel="More"
      logoutLabel="Log out"
      onLogout={logout}
      showLang={false}
      footer={[
        ["Website", "/", false],
        ["Telegram", "https://t.me/NAFYADWJ", true],
      ]}
    >
      {children}
    </AppShell>
  );
}
