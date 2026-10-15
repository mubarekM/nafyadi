"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { usePrefs } from "@/lib/prefs";
import { currentUser } from "@/lib/session";
import { useSyncTick } from "@/lib/sync";
import AppShell from "./AppShell";
import SyncView from "./SyncView";
import Notice from "./Notice";

const Ctx = createContext(null);
export const useStudent = () => useContext(Ctx);

const LEVEL_KEYS = {
  "All levels": "lvAll",
  Beginner: "lvBeginner",
  Elementary: "lvElementary",
  Intermediate: "lvIntermediate",
  "Upper-intermediate": "lvUpper",
  Advanced: "lvAdvanced",
};

export function lvLabel(t, level) {
  return LEVEL_KEYS[level] ? t(LEVEL_KEYS[level]) : level;
}

export function fmtDate(lang, iso) {
  try {
    const loc = lang === "am" ? "am-ET" : lang === "om" ? "om-ET" : "en-US";
    return new Date(iso).toLocaleString(loc, {
      weekday: "long",
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

// path -> [breadcrumb keys]
const PAGES = {
  "/student": [],
  "/student/lessons": ["navCourse", "navLessons"],
  "/student/quizzes": ["navCourse", "navQuizzes"],
  "/student/progress": ["navCourse", "navProgress"],
  "/student/live-class": ["navSessions"],
  "/student/certificates": ["navCerts"],
  "/student/payments": ["navPay"],
  "/student/discussion": ["navChat"],
  "/student/account": ["navAccount"],
};

const TABLES = [
  "payments",
  "profiles",
  "lessons",
  "quizzes",
  "quiz_submissions",
  "live_classes",
  "certificates",
  "attendance",
  "announcements",
];

function modeFor(path) {
  if (
    path.startsWith("/student/payments") ||
    path.startsWith("/student/quizzes")
  )
    return "notify";
  if (
    path.startsWith("/student/discussion") ||
    path.startsWith("/student/account")
  )
    return "off";
  return "auto";
}

export default function StudentShell({ children }) {
  const router = useRouter();
  const path = usePathname();
  const { t } = usePrefs();
  const [me, setMe] = useState(null);
  const [problem, setProblem] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const started = useRef(false);
  const tick = useSyncTick(TABLES, !!me);

  const load = useCallback(
    async (silent) => {
      const supabase = createClient();
      try {
        const user = await currentUser(supabase);
        if (!user) {
          // Offline? Then this is a connection problem, not a logout
          if (typeof navigator !== "undefined" && navigator.onLine === false) {
            if (!silent) setProblem(true);
            return;
          }
          router.replace("/login");
          return;
        }

        // Load the profile. Retry on connection errors instead of logging out.
        let profile = null;
        let failed = true;
        for (let i = 0; i < 3 && failed; i++) {
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
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
          if (!silent) setProblem(true);
          return;
        }

        // The teacher belongs in the admin area. Do not log them out.
        if (profile.role === "admin") {
          router.replace("/admin/dashboard");
          return;
        }

        // Only a clear "not allowed" answer signs the person out
        if (profile.status !== "approved" || profile.role !== "student") {
          await supabase.auth.signOut({ scope: "local" });
          router.replace("/login");
          return;
        }

        const { data: acc } = await supabase.rpc("has_access");
        setProblem(false);
        setMe({ id: user.id, profile, access: acc !== false });
      } catch {
        if (!silent) setProblem(true);
      }
    },
    [router],
  );

  // First load (and "Try again")
  useEffect(() => {
    started.current = true;
    load(false);
  }, [load, attempt]);

  // Quiet refresh when changing page, and when something changes
  useEffect(() => {
    if (started.current && me) load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);
  useEffect(() => {
    if (tick > 0) load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  // If the login ends in another tab, follow it
  useEffect(() => {
    const supabase = createClient();
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") router.replace("/login");
    });
    return () => data.subscription.unsubscribe();
  }, [router]);

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut({ scope: "local" }); // only this device
    router.replace("/login");
  }

  if (problem && !me) {
    return (
      <Notice icon="alert" title={t("connT")} text={t("connD")}>
        <button
          onClick={() => {
            setProblem(false);
            setAttempt((n) => n + 1);
          }}
          className="btn w-full"
        >
          {t("connRetry")}
        </button>
        <button onClick={logout} className="btn2 w-full">
          {t("logout")}
        </button>
      </Notice>
    );
  }

  if (!me) {
    return (
      <div className="tx flex min-h-dvh items-center justify-center font-semibold">
        ...
      </div>
    );
  }

  const groups = [
    {
      key: "home",
      label: t("navHome"),
      icon: "home",
      href: "/student",
      exact: true,
    },
    {
      key: "course",
      label: t("navCourse"),
      icon: "book",
      children: [
        { href: "/student/lessons", label: t("navLessons"), icon: "book" },
        { href: "/student/quizzes", label: t("navQuizzes"), icon: "clipboard" },
        { href: "/student/progress", label: t("navProgress"), icon: "chart" },
      ],
    },
    {
      key: "sessions",
      label: t("navSessions"),
      icon: "video",
      href: "/student/live-class",
    },
    {
      key: "certs",
      label: t("navCerts"),
      icon: "award",
      href: "/student/certificates",
    },
    {
      key: "chat",
      label: t("navChat"),
      icon: "message",
      href: "/student/discussion",
    },
    { key: "pay", label: t("navPay"), icon: "card", href: "/student/payments" },
    {
      key: "acc",
      label: t("navAccount"),
      icon: "user",
      href: "/student/account",
    },
  ];

  const tabs = [
    { href: "/student", exact: true, icon: "home", label: t("navHome") },
    { href: "/student/lessons", icon: "book", label: t("navLessons") },
    { href: "/student/quizzes", icon: "clipboard", label: t("navQuizzes") },
    { href: "/student/live-class", icon: "video", label: t("navSessions") },
  ];

  const crumbKeys = PAGES[path] || [];

  return (
    <Ctx.Provider value={me}>
      <AppShell
        brand="English with Nafyad"
        tag="Student"
        groups={groups}
        tabs={tabs}
        user={{
          name: me.profile.full_name || "",
          sub: lvLabel(t, me.profile.english_level),
        }}
        crumbs={[t("crumbHome"), ...crumbKeys.map((k) => t(k))]}
        moreLabel={t("navMore")}
        logoutLabel={t("logout")}
        onLogout={logout}
        footer={[
          [t("footWeb"), "/", false],
          [t("footTg"), "https://t.me/NAFYADWJ", true],
        ]}
      >
        <SyncView
          tick={tick}
          resetKey={path}
          mode={modeFor(path)}
          labels={{ msg: t("syncNew"), btn: t("syncBtn") }}
        >
          {children}
        </SyncView>
      </AppShell>
    </Ctx.Provider>
  );
}
