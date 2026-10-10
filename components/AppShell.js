"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Controls from "./Controls";

export default function AppShell({
  brand,
  tag,
  groups,
  tabs,
  badges = {},
  user,
  crumbs = [],
  chip,
  moreLabel,
  logoutLabel,
  onLogout,
  showLang = true,
  footer = [],
  children,
}) {
  const path = usePathname();
  const [more, setMore] = useState(false);
  const [open, setOpen] = useState({});

  useEffect(() => {
    setMore(false);
  }, [path]);

  const line = { borderColor: "var(--ln)" };
  const isOn = (it) =>
    it.exact
      ? path === it.href
      : path === it.href || path.startsWith(it.href + "/");

  const flat = groups.flatMap((g) =>
    g.children
      ? g.children.map((c) => ({ ...c, icon: c.icon || g.icon }))
      : [g],
  );
  const activeKey = groups.find(
    (g) => g.children && g.children.some(isOn),
  )?.key;
  const isOpen = (g) =>
    open[g.key] !== undefined ? open[g.key] : g.key === activeKey;
  const toggle = (g) => setOpen((o) => ({ ...o, [g.key]: !isOpen(g) }));
  const groupCount = (g) =>
    (g.children || []).reduce((n, c) => n + (badges[c.href] || 0), 0);
  const overflow = flat.filter((it) => !tabs.some((t) => t.href === it.href));
  const moreActive = overflow.some(isOn);
  const home = groups?.[0]?.href || "/";
  const initial = (user?.name || "?").charAt(0).toUpperCase();

  const badge = (n) =>
    n > 0 ? (
      <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-extrabold text-white">
        {n}
      </span>
    ) : null;

  return (
    <div className="b0 tx min-h-dvh">
      {/* ===== Desktop sidebar ===== */}
      <aside
        className="b0 fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r lg:flex"
        style={line}
      >
        <Link href={home} className="px-6 py-6">
          <p className="pr text-lg font-extrabold">{brand}</p>
          <p className="mu text-xs font-extrabold uppercase tracking-widest">
            {tag}
          </p>
        </Link>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
          {groups.map((g) =>
            g.children ? (
              <div key={g.key}>
                <button
                  onClick={() => toggle(g)}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 font-extrabold ${
                    activeKey === g.key ? "pr" : "mu hover:opacity-70"
                  }`}
                >
                  <span className="text-xl">{g.icon}</span>
                  <span className="flex-1 text-left">{g.label}</span>
                  {!isOpen(g) && badge(groupCount(g))}
                  <span
                    className={`transition-transform ${isOpen(g) ? "rotate-180" : ""}`}
                  >
                    ⌄
                  </span>
                </button>
                {isOpen(g) && (
                  <div
                    className="ml-6 mt-1 space-y-1 border-l pl-3"
                    style={line}
                  >
                    {g.children.map((c) => (
                      <Link
                        key={c.href}
                        href={c.href}
                        className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-extrabold ${
                          isOn(c) ? "grad text-white" : "mu hover:opacity-70"
                        }`}
                      >
                        {c.label}
                        {badge(badges[c.href] || 0)}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={g.key}
                href={g.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 font-extrabold ${
                  isOn(g) ? "grad text-white" : "mu hover:opacity-70"
                }`}
              >
                <span className="text-xl">{g.icon}</span>
                <span className="flex-1">{g.label}</span>
                {badge(badges[g.href] || 0)}
              </Link>
            ),
          )}
        </nav>
      </aside>

      {/* ===== Content column ===== */}
      <div className="flex min-h-dvh flex-col lg:ml-64">
        <header
          className="b0 sticky top-0 z-30 flex items-center justify-between gap-3 border-b px-4 py-3 sm:px-6"
          style={line}
        >
          <Link href={home} className="pr font-extrabold lg:hidden">
            Nafyad
          </Link>
          <span className="hidden lg:block" />
          <div className="flex items-center gap-2 sm:gap-3">
            <Controls showLang={showLang} />
            <div className="hidden items-center gap-2 sm:flex">
              <div className="grad flex h-9 w-9 items-center justify-center rounded-full font-extrabold text-white">
                {initial}
              </div>
              <div className="min-w-0 leading-tight">
                <p className="max-w-[10rem] truncate text-sm font-extrabold">
                  {user?.name}
                </p>
                <p className="mu max-w-[10rem] truncate text-xs font-bold">
                  {user?.sub}
                </p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="btn-ghost hidden lg:inline-block"
            >
              {logoutLabel}
            </button>
          </div>
        </header>

        <main className="flex-1 px-4 pb-6 pt-5 sm:px-6 lg:px-10">
          <div className="shell-body mx-auto max-w-5xl">
            <div className="cd mb-5 flex flex-wrap items-center justify-between gap-2 px-4 py-3">
              <nav className="flex flex-wrap items-center gap-x-2 text-sm font-bold">
                {crumbs.map((c, i) => (
                  <span
                    key={i}
                    className={
                      i === crumbs.length - 1 ? "tx font-extrabold" : "mu"
                    }
                  >
                    {i > 0 && <span className="mr-2 opacity-60">›</span>}
                    {c}
                  </span>
                ))}
              </nav>
              {chip && <span className="chip chip-n">{chip}</span>}
            </div>
            {children}
          </div>
        </main>

        <footer className="shell-footer px-4 pb-24 pt-6 text-sm font-bold lg:pb-6">
          <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 sm:flex-row">
            <span className="font-extrabold text-white">{brand}</span>
            <div className="flex flex-wrap justify-center gap-5">
              {footer.map(([label, href, ext]) => (
                <a
                  key={label}
                  href={href}
                  target={ext ? "_blank" : undefined}
                  rel={ext ? "noopener noreferrer" : undefined}
                  className="hover:text-white"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        </footer>
      </div>

      {/* ===== Phone / tablet: "More" sheet ===== */}
      {more && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: "rgba(0,0,0,.45)" }}
          onClick={() => setMore(false)}
        />
      )}
      {more && (
        <div
          className="b0 fixed inset-x-0 z-[45] max-h-[70dvh] overflow-y-auto rounded-t-3xl border-t p-4 lg:hidden"
          style={{
            ...line,
            bottom: "calc(3.5rem + env(safe-area-inset-bottom))",
          }}
        >
          <div className="mb-3 flex items-center gap-3">
            <div className="grad flex h-10 w-10 items-center justify-center rounded-full font-extrabold text-white">
              {initial}
            </div>
            <div className="min-w-0">
              <p className="truncate font-extrabold">{user?.name}</p>
              <p className="mu truncate text-xs font-bold">{user?.sub}</p>
            </div>
          </div>
          <div className="space-y-1">
            {overflow.map((it) => (
              <Link
                key={it.href}
                href={it.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 font-extrabold ${
                  isOn(it) ? "grad text-white" : "mu"
                }`}
              >
                <span className="text-xl">{it.icon}</span>
                <span className="flex-1">{it.label}</span>
                {badge(badges[it.href] || 0)}
              </Link>
            ))}
          </div>
          <div
            className="mt-3 flex items-center justify-between gap-2 border-t pt-3"
            style={line}
          >
            <Controls showLang={showLang} />
            <button onClick={onLogout} className="btn-ghost">
              {logoutLabel}
            </button>
          </div>
        </div>
      )}

      {/* ===== Phone / tablet: bottom tabs ===== */}
      <nav
        className="b0 fixed inset-x-0 bottom-0 z-50 grid border-t lg:hidden"
        style={{
          ...line,
          gridTemplateColumns: `repeat(${tabs.length + 1}, minmax(0, 1fr))`,
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`relative flex h-14 min-w-0 flex-col items-center justify-center gap-0.5 text-[10px] font-extrabold ${
              isOn(tab) ? "pr" : "mu"
            }`}
          >
            <span className="relative text-xl">
              {tab.icon}
              {(badges[tab.href] || 0) > 0 && (
                <span className="absolute -right-3 -top-1 rounded-full bg-red-600 px-1.5 text-[10px] leading-4 text-white">
                  {badges[tab.href]}
                </span>
              )}
            </span>
            <span className="w-full truncate px-0.5 text-center">
              {tab.label}
            </span>
          </Link>
        ))}
        <button
          onClick={() => setMore((m) => !m)}
          className={`flex h-14 min-w-0 flex-col items-center justify-center gap-0.5 text-[10px] font-extrabold ${
            more || moreActive ? "pr" : "mu"
          }`}
        >
          <span className="text-xl">☰</span>
          <span className="w-full truncate px-0.5 text-center">
            {moreLabel}
          </span>
        </button>
      </nav>
    </div>
  );
}
