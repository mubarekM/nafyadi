"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Controls from "./Controls";

const NAV = [
  ["/admin/dashboard", "Students", "👥"],
  ["/admin/enrollments", "Enrollments", "📩"],
  ["/admin/lessons", "Lessons", "📚"],
  ["/admin/quizzes", "Quizzes", "📝"],
  ["/admin/live-classes", "Live Classes", "🎥"],
  ["/admin/certificates", "Certificates", "🎓"],
  ["/admin/discussion", "Discussion", "💬"],
];

export default function AdminShell({ children }) {
  const router = useRouter();
  const path = usePathname();
  const isLogin = path === "/admin/login";
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (isLogin) {
      setOk(false);
      return;
    }
    async function start() {
      const supabase = createClient();
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) {
        router.replace("/admin/login");
        return;
      }
      const { data: p } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", u.user.id)
        .single();
      if (p?.role !== "admin") {
        router.replace("/admin/login");
        return;
      }
      setOk(true);
    }
    start();
  }, [path, isLogin, router]);

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setOk(false);
    router.replace("/admin/login");
  }

  if (isLogin) return children;

  if (!ok) {
    return (
      <div className="tx flex min-h-dvh items-center justify-center font-bold">
        ...
      </div>
    );
  }

  const on = (h) => path.startsWith(h);
  const line = { borderColor: "var(--ln)" };

  return (
    <div className="b0 tx min-h-dvh">
      {/* Desktop sidebar */}
      <aside
        className="b0 fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r lg:flex"
        style={line}
      >
        <div className="px-6 py-6">
          <p className="pr text-lg font-extrabold">English with Nafyad</p>
          <p className="mu text-xs font-extrabold uppercase tracking-widest">
            Teacher admin
          </p>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3">
          {NAV.map(([h, label, icon]) => (
            <Link
              key={h}
              href={h}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 font-extrabold ${
                on(h) ? "grad text-white" : "mu hover:opacity-70"
              }`}
            >
              <span className="text-xl">{icon}</span>
              {label}
            </Link>
          ))}
        </nav>
        <div
          className="flex items-center justify-between gap-2 border-t p-4"
          style={line}
        >
          <Controls showLang={false} />
          <button onClick={logout} className="btn-ghost">
            Log out
          </button>
        </div>
      </aside>

      {/* Phone / tablet top bar */}
      <header
        className="b0 sticky top-0 z-40 flex items-center justify-between border-b px-4 py-3 lg:hidden"
        style={line}
      >
        <span className="pr font-extrabold">Nafyad · Admin</span>
        <div className="flex items-center gap-2">
          <Controls showLang={false} />
          <button onClick={logout} className="btn-ghost">
            Log out
          </button>
        </div>
      </header>

      <main className="px-4 pb-28 pt-6 sm:px-6 lg:ml-64 lg:px-10 lg:pb-12 lg:pt-10">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>

      {/* Phone / tablet bottom tabs (scroll sideways) */}
      <nav
        className="b0 fixed inset-x-0 bottom-0 z-40 flex overflow-x-auto border-t lg:hidden"
        style={{ ...line, paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {NAV.map(([h, label, icon]) => (
          <Link
            key={h}
            href={h}
            className={`flex min-w-[76px] flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-extrabold ${
              on(h) ? "pr" : "mu"
            }`}
          >
            <span className="text-xl">{icon}</span>
            <span className="max-w-full truncate px-1">{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
