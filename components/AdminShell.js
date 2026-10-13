"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { currentUser } from "@/lib/session";
import { useSyncTick } from "@/lib/sync";
import AppShell from "./AppShell";
import SyncView from "./SyncView";

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

const TABLES = [
  "payments",
  "profiles",
  "enrollments",
  "quiz_submissions",
  "attendance",
  "live_classes",
  "lessons",
  "quizzes",
  "certificates",
];

function modeFor(path) {
  if (path.startsWith("/admin/attendance")) return "notify";
  if (
    path.startsWith("/admin/lessons") ||
    path.startsWith("/admin/live-classes") ||
    path.startsWith("/admin/certificates") ||
    path.startsWith("/admin/discussion")
  ) {
    return "off";
  }
  return "auto";
}

function Notice({ icon, title, text, children }) {
  return (
    <div className="tx flex min-h-dvh items-center justify-center px-4">
      <div className="cd w-full max-w-md p-8 text-center">
        <p className="text-4xl" aria-hidden="true">
          {icon}
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
  const [state, setState] = useState("loading"); // loading | ok | student | problem
  const [name, setName] = useState("");
  const [badges, setBadges] = useState({});
  const [attempt, setAttempt] = useState(0);
  const started = useRef(false);
  const tick = useSyncTick(TABLES, state === "ok" && !isLogin);

  const load = useCallback(
    async (silent) => {
      const supabase = createClient();
      try {
        const user = await currentUser(supabase);
        if (!user) {
          if (typeof navigator !== "undefined" && navigator.onLine === false) {
            if (!silent) setState("problem");
            return;
          }
          router.replace("/admin/login");
          return;
        }

        let profile = null;
        let failed = true;
        for (let i = 0; i < 3 && failed; i++) {
          const { data, error } = await supabase
            .from("profiles")
            .select("role, full_name")
            .eq("id", user.id)
            .maybeSingle();
          if (!error) {
            profile = data;
            failed = false;
          } else {
            await new Promise((r) => setTimeout(r, 600 * (i + 1)));
          }
        }
        if (failed || !profile) {
          if (!silent) setState("problem");
          return;
        }
        if (profile.role !== "admin") {
          setState("student");
          return;
        }

        setName(profile.full_name || "Admin");
        setState("ok");

        const count = (q) => q.then((r) => r.count || 0);
        const [pay, enr, newStudents, toGrade] = await Promise.all([
          count(
            supabase
              .from("payments")
              .select("id", { count: "exact", head: true })
              .eq("status", "pending"),
          ),
          count(
            supabase
              .from("enrollments")
              .select("id", { count: "exact", head: true })
              .eq("status", "new"),
          ),
          count(
            supabase
              .from("profiles")
              .select("id", { count: "exact", head: true })
              .eq("role", "student")
              .eq("status", "pending"),
          ),
          count(
            supabase
              .from("quiz_submissions")
              .select("id", { count: "exact", head: true })
              .eq("status", "submitted"),
          ),
        ]);
        setBadges({
          "/admin/payments": pay,
          "/admin/enrollments": enr,
          "/admin/dashboard": newStudents,
          "/admin/quizzes": toGrade,
        });
      } catch {
        if (!silent) setState("problem");
      }
    },
    [router],
  );

  useEffect(() => {
    if (isLogin) return;
    started.current = true;
    load(false);
  }, [load, attempt, isLogin]);

  useEffect(() => {
    if (!isLogin && started.current && state === "ok") load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);
  useEffect(() => {
    if (tick > 0 && !isLogin) load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  // If loading takes too long, show a helpful screen instead of "..."
  useEffect(() => {
    if (isLogin || state !== "loading") return;
    const timer = setTimeout(
      () => setState((s) => (s === "loading" ? "problem" : s)),
      10000,
    );
    return () => clearTimeout(timer);
  }, [state, isLogin, attempt]);

  useEffect(() => {
    const supabase = createClient();
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT" && !isLogin) router.replace("/admin/login");
    });
    return () => data.subscription.unsubscribe();
  }, [router, isLogin]);

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut({ scope: "local" }); // only this device
    router.replace("/admin/login");
  }

  if (isLogin) return children;

  if (state === "student") {
    return (
      <Notice
        icon="🔐"
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

  if (state === "problem") {
    return (
      <Notice
        icon="📡"
        title="Connection problem"
        text="We could not reach the server. Your login is safe. Check your internet and try again."
      >
        <button
          onClick={() => {
            setState("loading");
            setAttempt((n) => n + 1);
          }}
          className="btn w-full"
        >
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
      <SyncView
        tick={tick}
        resetKey={path}
        mode={modeFor(path)}
        labels={{ msg: "New updates are ready", btn: "Refresh" }}
      >
        {children}
      </SyncView>
    </AppShell>
  );
}
