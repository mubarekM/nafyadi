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

// path -> [breadcrumb keys, subtitle key]
const PAGES = {
  "/student": { c: [], s: "subHome" },
  "/student/lessons": { c: ["navCourse", "navLessons"], s: "subLessons" },
  "/student/quizzes": { c: ["navCourse", "navQuizzes"], s: "subQuizzes" },
  "/student/progress": { c: ["navCourse", "navProgress"], s: "subProgress" },
  "/student/live-class": { c: ["navSessions"], s: "subSessions" },
  "/student/certificates": { c: ["navCerts"], s: "subCerts" },
  "/student/payments": { c: ["navPay"], s: "subPay" },
  "/student/discussion": { c: ["navChat"], s: "subChat" },
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
];

function modeFor(path) {
  if (
    path.startsWith("/student/payments") ||
    path.startsWith("/student/quizzes")
  )
    return "notify";
  if (path.startsWith("/student/discussion")) return "off";
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
      <div className="tx flex min-h-dvh items-center justify-center px-4">
        <div className="cd w-full max-w-md p-8 text-center">
          <p className="text-4xl" aria-hidden="true">
            📡
          </p>
          <h1 className="mt-3 text-2xl font-extrabold">{t("connT")}</h1>
          <p className="mu mt-3 font-semibold leading-relaxed">{t("connD")}</p>
          <div className="mt-6 flex flex-col gap-3">
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
          </div>
        </div>
      </div>
    );
  }

  if (!me) {
    return (
      <div className="tx flex min-h-dvh items-center justify-center font-bold">
        ...
      </div>
    );
  }

  const groups = [
    {
      key: "home",
      label: t("navHome"),
      icon: "🏠",
      href: "/student",
      exact: true,
    },
    {
      key: "course",
      label: t("navCourse"),
      icon: "📚",
      children: [
        { href: "/student/lessons", label: t("navLessons"), icon: "📚" },
        { href: "/student/quizzes", label: t("navQuizzes"), icon: "📝" },
        { href: "/student/progress", label: t("navProgress"), icon: "📈" },
      ],
    },
    {
      key: "sessions",
      label: t("navSessions"),
      icon: "🎥",
      href: "/student/live-class",
    },
    {
      key: "certs",
      label: t("navCerts"),
      icon: "🎓",
      href: "/student/certificates",
    },
    { key: "pay", label: t("navPay"), icon: "💳", href: "/student/payments" },
    {
      key: "chat",
      label: t("navChat"),
      icon: "💬",
      href: "/student/discussion",
    },
  ];

  const tabs = [
    { href: "/student", exact: true, icon: "🏠", label: t("navHome") },
    { href: "/student/lessons", icon: "📚", label: t("navLessons") },
    { href: "/student/quizzes", icon: "📝", label: t("navQuizzes") },
    { href: "/student/live-class", icon: "🎥", label: t("navSessions") },
  ];

  const page = PAGES[path] || PAGES["/student"];

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
        crumbs={[t("crumbHome"), ...page.c.map((k) => t(k))]}
        chip={t(page.s)}
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
