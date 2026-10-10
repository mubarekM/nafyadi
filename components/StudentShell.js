"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { usePrefs } from "@/lib/prefs";
import AppShell from "./AppShell";

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

export default function StudentShell({ children }) {
  const router = useRouter();
  const path = usePathname();
  const { t } = usePrefs();
  const [me, setMe] = useState(null);

  useEffect(() => {
    async function start() {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.replace("/login");
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userData.user.id)
        .single();
      if (!data || data.status !== "approved" || data.role !== "student") {
        await supabase.auth.signOut();
        router.replace("/login");
        return;
      }

      // Can the student open lessons and quizzes right now?
      // If the check itself fails, nobody is locked out by mistake.
      const { data: acc } = await supabase.rpc("has_access");

      setMe({ id: userData.user.id, profile: data, access: acc !== false });
    }
    start();
  }, [router, path]);

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
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
        {children}
      </AppShell>
    </Ctx.Provider>
  );
}
