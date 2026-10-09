"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { usePrefs } from "@/lib/prefs";
import Controls from "./Controls";

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
    return new Date(iso).toLocaleString(lang === "am" ? "am-ET" : "en-US", {
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

const NAV = [
  ["/student", "navHome", "🏠"],
  ["/student/lessons", "navLessons", "📚"],
  ["/student/quizzes", "navQuizzes", "📝"],
  ["/student/progress", "navProgress", "📈"],
  ["/student/live-class", "navLive", "🎥"],
];

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
      setMe({ id: userData.user.id, profile: data });
    }
    start();
  }, [router]);

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
  }

  const on = (h) => (h === "/student" ? path === h : path.startsWith(h));
  const line = { borderColor: "var(--ln)" };

  if (!me) {
    return (
      <div className="b0 mu flex min-h-dvh items-center justify-center font-bold">
        ...
      </div>
    );
  }

  return (
    <Ctx.Provider value={me}>
      <div className="b0 tx min-h-dvh">
        <header className="b0 sticky top-0 z-40 border-b" style={line}>
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-3 sm:px-6">
            <Link
              href="/student"
              className="pr shrink-0 text-base font-extrabold sm:text-lg"
            >
              <span className="hidden min-[420px]:inline">English with </span>
              Nafyad
            </Link>

            <nav className="hidden gap-1 lg:flex">
              {NAV.map(([h, k]) => (
                <Link
                  key={h}
                  href={h}
                  className={`rounded-full px-4 py-2 text-sm font-extrabold ${on(h) ? "grad text-white" : "mu hover:opacity-70"}`}
                >
                  {t(k)}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <Controls />
              <button
                onClick={logout}
                aria-label={t("logout")}
                className="cd tx px-3 py-1.5 text-sm font-bold"
              >
                <span className="hidden sm:inline">{t("logout")}</span>
                <span className="sm:hidden">↩</span>
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-4 pb-28 pt-6 sm:px-6 sm:pt-8 lg:pb-12">
          {children}
        </main>

        <nav
          className="b0 fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t lg:hidden"
          style={{ ...line, paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {NAV.map(([h, k, icon]) => (
            <Link
              key={h}
              href={h}
              className={`flex flex-col items-center gap-0.5 py-2 text-[11px] font-extrabold ${on(h) ? "pr" : "mu"}`}
            >
              <span className="text-xl">{icon}</span>
              <span className="max-w-full truncate px-1">{t(k)}</span>
            </Link>
          ))}
        </nav>
      </div>
    </Ctx.Provider>
  );
}
