"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const SETS = {
  home: ["/bg/home-1.jpg", "/bg/home-2.jpg", "/bg/home-3.jpg"],
  student: ["/bg/student-1.jpg", "/bg/student-2.jpg"],
  admin: ["/bg/admin-1.jpg"],
};

function pick(path) {
  if (path === "/") return SETS.home;
  if (path.startsWith("/student")) return SETS.student;
  if (path.startsWith("/admin")) return SETS.admin;
  return [];
}

export default function Backdrop() {
  const path = usePathname();
  const images = pick(path);
  const [bad, setBad] = useState({});
  const [i, setI] = useState(0);

  const list = images.filter((s) => !bad[s]);

  useEffect(() => {
    setI(0);
    if (images.length < 2) return;
    const id = setInterval(() => setI((x) => x + 1), 7000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  const current = list.length ? i % list.length : 0;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="bd-fb absolute inset-0" />
      {list.map((src, k) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={src}
          src={src}
          alt=""
          onError={() => setBad((b) => ({ ...b, [src]: true }))}
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-[1800ms]"
          style={{ opacity: k === current ? 1 : 0 }}
        />
      ))}
      <div className="bd-ov absolute inset-0" />
    </div>
  );
}
