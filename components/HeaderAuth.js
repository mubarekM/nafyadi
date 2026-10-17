"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { usePrefs } from "@/lib/prefs";

// Not logged in: Log in + Join as a student.  Logged in: one button to YOUR dashboard.
export default function HeaderAuth({ layout = "bar" }) {
  const { t } = usePrefs();
  const [dest, setDest] = useState(null); // { href, key }

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const sb = createClient();
        const { data } = await sb.auth.getSession();
        const user = data?.session?.user;
        if (!user) return;
        const { data: p } = await sb
          .from("profiles")
          .select("role, status")
          .eq("id", user.id)
          .maybeSingle();
        if (!alive || !p) return;
        if (p.role === "admin")
          setDest({ href: "/admin/dashboard", key: "goTeacher" });
        else if (p.role === "student" && p.status === "approved")
          setDest({ href: "/student", key: "goStudent" });
      } catch {}
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (layout === "menu") {
    return dest ? (
      <Link href={dest.href} className="btn mt-3 flex w-full">
        {t(dest.key)}
      </Link>
    ) : (
      <div className="mt-3 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Link href="/login" className="btn2">
            {t("login")}
          </Link>
          <Link href="/signup" className="btn">
            {t("joinStudent")}
          </Link>
        </div>
        <Link
          href="/login?as=teacher"
          className="pr block text-center text-sm font-semibold underline underline-offset-4"
        >
          {t("teacherLink")}
        </Link>
      </div>
    );
  }

  return dest ? (
    <Link
      href={dest.href}
      className="btn !min-h-[40px] !px-4 hidden text-sm sm:inline-flex"
    >
      {t(dest.key)}
    </Link>
  ) : (
    <>
      <Link
        href="/login"
        className="btn2 !min-h-[40px] !px-4 hidden text-sm sm:inline-flex"
      >
        {t("login")}
      </Link>
      <Link
        href="/signup"
        className="btn !min-h-[40px] !px-4 hidden text-sm sm:inline-flex"
      >
        {t("joinStudent")}
      </Link>
    </>
  );
}
