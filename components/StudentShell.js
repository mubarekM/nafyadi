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
      <div className="tx flex min-h-dvh items-center justify-center font-bold">
        ...
      </div>
    );
  }

  const name = me.profile.full_name || "";

  return (
    <Ctx.Provider value={me}>
      <div className="b0 tx min-h-dvh">
        {/* Desktop sidebar */}
        <aside
          className="b0 fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r lg:flex"
          style={line}
        >
          <Link href="/student" className="px-6 py-6">
            <p className="pr text-lg font-extrabold">English with Nafyad</p>
            <p className="mu text-xs font-extrabold uppercase tracking-widest">
              Student
            </p>
          </Link>

          <div className="cd mx-4 mb-4 flex items-center gap-3 p-3">
            <div className="grad flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg font-extrabold text-white">
              {name.charAt(0).toUpperCase() || "S"}
            </div>
            <div className="min-w-0">
              <p className="truncate font-extrabold">{name}</p>
              <p className="mu truncate text-xs font-bold">
                {lvLabel(t, me.profile.english_level)}
              </p>
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-3">
            {NAV.map(([h, k, icon]) => (
              <Link
                key={h}
                href={h}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 font-extrabold ${
                  on(h) ? "grad text-white" : "mu hover:opacity-70"
                }`}
              >
                <span className="text-xl">{icon}</span>
                {t(k)}
              </Link>
            ))}
          </nav>

          <div className="space-y-3 border-t p-4" style={line}>
            <Controls />
            <button onClick={logout} className="btn-ghost w-full">
              {t("logout")}
            </button>
          </div>
        </aside>

        {/* Phone / tablet top bar */}
        <header
          className="b0 sticky top-0 z-40 flex items-center justify-between gap-2 border-b px-4 py-3 lg:hidden"
          style={line}
        >
          <Link href="/student" className="pr shrink-0 font-extrabold">
            <span className="hidden min-[420px]:inline">English with </span>
            Nafyad
          </Link>
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
        </header>

        <main className="px-4 pb-28 pt-6 sm:px-6 sm:pt-8 lg:ml-64 lg:px-10 lg:pb-12 lg:pt-10">
          <div className="mx-auto max-w-5xl">{children}</div>
        </main>

        {/* Phone / tablet bottom tabs */}
        <nav
          className="b0 fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t lg:hidden"
          style={{ ...line, paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          {NAV.map(([h, k, icon]) => (
            <Link
              key={h}
              href={h}
              className={`flex flex-col items-center gap-0.5 py-2 text-[11px] font-extrabold ${
                on(h) ? "pr" : "mu"
              }`}
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
