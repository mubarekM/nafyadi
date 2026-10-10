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
  "/admin/lessons": "Weeks, videos, notes and files",
  "/admin/quizzes": "Create quizzes and grade answers",
  "/admin/live-classes": "Schedule your live classes",
  "/admin/payments": "Review payment screenshots",
  "/admin/certificates": "Issue certificates",
  "/admin/discussion": "Class chat room",
};

export default function AdminShell({ children }) {
  const router = useRouter();
  const path = usePathname();
  const isLogin = path === "/admin/login";
  const [ok, setOk] = useState(false);
  const [name, setName] = useState("");
  const [badges, setBadges] = useState({});

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
        .select("role, full_name")
        .eq("id", u.user.id)
        .single();
      if (p?.role !== "admin") {
        router.replace("/admin/login");
        return;
      }
      setName(p.full_name || "Admin");
      setOk(true);

      const pay = await supabase
        .from("payments")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending");
      const enr = await supabase
        .from("enrollments")
        .select("id", { count: "exact", head: true })
        .eq("status", "new");
      setBadges({
        "/admin/payments": pay.count || 0,
        "/admin/enrollments": enr.count || 0,
      });
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
