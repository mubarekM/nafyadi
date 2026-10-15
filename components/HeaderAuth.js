"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { usePrefs } from "@/lib/prefs";

// Not logged in: Log in + Join.  Logged in: one button to the right dashboard.
export default function HeaderAuth({ layout = "bar" }) {
  const { t } = usePrefs();
  const [dest, setDest] = useState(null);

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
        if (p.role === "admin") setDest("/admin/dashboard");
        else if (p.role === "student" && p.status === "approved")
          setDest("/student");
      } catch {}
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (layout === "menu") {
    return dest ? (
      <Link href={dest} className="btn mt-3 flex w-full">
        {t("goDash")}
      </Link>
    ) : (
      <div className="mt-3 grid grid-cols-2 gap-3">
        <Link href="/login" className="btn2">
          {t("login")}
        </Link>
        <Link href="/signup" className="btn">
          {t("join")}
        </Link>
      </div>
    );
  }

  return dest ? (
    <Link
      href={dest}
      className="btn !min-h-[40px] !px-4 hidden text-sm sm:inline-flex"
    >
      {t("goDash")}
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
        {t("join")}
      </Link>
    </>
  );
}
