"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Controls from "./Controls";
import Icon from "./Icon";
import { usePrefs } from "@/lib/prefs";

// The shells pass emoji as icon names; they are shown as line icons here
const ICON_OF = {
  "🏠": "home",
  "📚": "book",
  "📝": "clipboard",
  "📈": "chart",
  "🎥": "video",
  "🎓": "award",
  "💳": "card",
  "💬": "message",
  "👥": "users",
  "📩": "mail",
  "✅": "checkCircle",
};
const ico = (e) => ICON_OF[e] || "info";

const SECTIONS = {
  s: {
    home: "secOverview",
    course: "secLearning",
    sessions: "secLearning",
    certs: "secLearning",
    pay: "secAccount",
    chat: "secCommunity",
  },
  a: {
    people: "secPeople",
    learn: "secTeaching",
    pay: "secBusiness",
    cert: "secBusiness",
    chat: "secCommunity",
  },
};

export default function AppShell({
  brand,
  tag,
  groups,
  tabs,
  badges = {},
  user,
  crumbs = [],
  moreLabel,
  logoutLabel,
  onLogout,
  showLang = true,
  footer = [],
  children,
}) {
  const path = usePathname();
  const { t } = usePrefs();
  const [more, setMore] = useState(false);
  const [open, setOpen] = useState({});
  const kind = tag === "Student" ? "s" : "a";

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
  const overflow = flat.filter((it) => !tabs.some((x) => x.href === it.href));
  const moreActive = overflow.some(isOn);
  const home = groups[0].href;
  const initial = (user?.name || "?").charAt(0).toUpperCase();

  const badge = (n) =>
    n > 0 ? (
      <span className="rounded-full bg-red-700 px-1.5 py-0.5 text-[0.7rem] font-semibold leading-none text-white">
        {n}
      </span>
    ) : null;

  const row = (on) =>
    `flex min-h-[44px] items-center gap-3 rounded-md px-3 py-2 text-[0.95rem] font-semibold ${
      on ? "bg-[var(--soft)] tx" : "mu hover:bg-[var(--soft)]"
    }`;

  const logo = (
    <span
      className="display flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-lg text-white"
      style={{ background: "var(--deep)" }}
      aria-hidden="true"
    >
      N
    </span>
  );

  let lastSection = null;

  return (
    <div className="b0 tx min-h-dvh">
      {/* ===== Desktop sidebar ===== */}
      <aside
        className="b0 fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r lg:flex"
        style={{ ...line, background: "var(--card)" }}
      >
        <Link
          href={home}
          className="flex items-center gap-3 border-b px-5 py-5"
          style={line}
        >
          {logo}
          <span className="min-w-0 leading-tight">
            <span className="block truncate font-semibold">{brand}</span>
            <span className="mu block truncate text-xs">{tag}</span>
          </span>
        </Link>

        <nav
          aria-label="Main"
          className="flex-1 overflow-y-auto px-3 pb-4 pt-2"
        >
          {groups.map((g) => {
            const sec = SECTIONS[kind][g.key];
            const label = sec && sec !== lastSection ? t(sec) : null;
            if (sec) lastSection = sec;
            return (
              <div key={g.key}>
                {label && (
                  <p className="mu px-3 pb-1 pt-5 text-sm font-semibold">
                    {label}
                  </p>
                )}
                {g.children ? (
                  <>
                    <button
                      onClick={() => toggle(g)}
                      aria-expanded={isOpen(g)}
                      className={`${row(activeKey === g.key)} w-full`}
                    >
                      <Icon name={ico(g.icon)} size={19} />
                      <span className="flex-1 text-left">{g.label}</span>
                      {!isOpen(g) && badge(groupCount(g))}
                      <Icon
                        name="chevronDown"
                        size={16}
                        className={`transition-transform ${isOpen(g) ? "rotate-180" : ""}`}
                      />
                    </button>
                    {isOpen(g) && (
                      <div
                        className="ml-5 mt-1 space-y-0.5 border-l pl-2"
                        style={line}
                      >
                        {g.children.map((c) => (
                          <Link
                            key={c.href}
                            href={c.href}
                            aria-current={isOn(c) ? "page" : undefined}
                            className={row(isOn(c))}
                          >
                            <span className="flex-1">{c.label}</span>
                            {badge(badges[c.href] || 0)}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={g.href}
                    aria-current={isOn(g) ? "page" : undefined}
                    className={row(isOn(g))}
                  >
                    <Icon
                      name={ico(g.icon)}
                      size={19}
                      className={isOn(g) ? "text-[var(--pri)]" : ""}
                    />
                    <span className="flex-1">{g.label}</span>
                    {badge(badges[g.href] || 0)}
                  </Link>
                )}
              </div>
            );
          })}
        </nav>

        <div className="border-t p-3" style={line}>
          <div className="flex items-center gap-3 px-2 py-2">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-semibold"
              style={{ background: "var(--brand-soft)", color: "var(--pri)" }}
              aria-hidden="true"
            >
              {initial}
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-sm font-semibold">
                {user?.name}
              </span>
              <span className="mu block truncate text-xs">{user?.sub}</span>
            </span>
          </div>
          <button onClick={onLogout} className={`${row(false)} w-full`}>
            <Icon name="logout" size={19} />
            {logoutLabel}
          </button>
        </div>
      </aside>

      {/* ===== Content column ===== */}
      <div className="flex min-h-dvh flex-col lg:ml-64">
        <header
          className="b0 sticky top-0 z-30 flex items-center justify-between gap-3 border-b px-4 py-2.5 sm:px-6"
          style={line}
        >
          <Link href={home} className="flex items-center gap-2 lg:hidden">
            {logo}
            <span className="font-semibold">Nafyad</span>
          </Link>

          <nav
            aria-label="Breadcrumb"
            className="hidden min-w-0 items-center gap-2 text-sm sm:flex"
          >
            <Icon name="home" size={16} className="mu" />
            {crumbs.map((c, i) => (
              <span key={i} className="flex min-w-0 items-center gap-2">
                {i > 0 && (
                  <Icon
                    name="chevronRight"
                    size={14}
                    className="mu opacity-60"
                  />
                )}
                <span
                  className={`truncate ${i === crumbs.length - 1 ? "tx font-semibold" : "mu"}`}
                >
                  {c}
                </span>
              </span>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Controls showLang={showLang} />
          </div>
        </header>

        <main
          id="main"
          tabIndex={-1}
          className="flex-1 px-4 pb-8 pt-6 outline-none sm:px-6 lg:px-10"
        >
          <div className="shell-body mx-auto max-w-6xl">{children}</div>
        </main>

        <footer className="shell-footer px-4 pb-28 pt-6 text-sm lg:pb-6">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 sm:flex-row">
            <span className="font-semibold text-white">{brand}</span>
            <div className="flex flex-wrap justify-center gap-x-5 gap-y-2">
              {footer.map(([label, href, ext]) => (
                <a
                  key={label}
                  href={href}
                  target={ext ? "_blank" : undefined}
                  rel={ext ? "noopener noreferrer" : undefined}
                  className="underline-offset-4 hover:text-white hover:underline"
                >
                  {label}
                </a>
              ))}
              <Link
                href="/privacy"
                className="underline-offset-4 hover:text-white hover:underline"
              >
                {t("privacyT")}
              </Link>
              <Link
                href="/terms"
                className="underline-offset-4 hover:text-white hover:underline"
              >
                {t("termsT")}
              </Link>
            </div>
          </div>
        </footer>
      </div>

      {/* ===== Phone / tablet: "More" sheet ===== */}
      {more && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: "rgba(0,0,0,.5)" }}
          onClick={() => setMore(false)}
        />
      )}
      {more && (
        <div
          className="b0 fixed inset-x-0 z-[45] max-h-[70dvh] overflow-y-auto rounded-t-xl border-t p-4 lg:hidden"
          style={{
            ...line,
            background: "var(--card)",
            bottom: "calc(4rem + env(safe-area-inset-bottom))",
          }}
        >
          <div className="mb-3 flex items-center gap-3">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-full font-semibold"
              style={{ background: "var(--brand-soft)", color: "var(--pri)" }}
              aria-hidden="true"
            >
              {initial}
            </span>
            <div className="min-w-0">
              <p className="truncate font-semibold">{user?.name}</p>
              <p className="mu truncate text-xs">{user?.sub}</p>
            </div>
          </div>
          <div className="space-y-0.5">
            {overflow.map((it) => (
              <Link
                key={it.href}
                href={it.href}
                aria-current={isOn(it) ? "page" : undefined}
                className={row(isOn(it))}
              >
                <Icon name={ico(it.icon)} size={19} />
                <span className="flex-1">{it.label}</span>
                {badge(badges[it.href] || 0)}
              </Link>
            ))}
          </div>
          <div
            className="mt-3 flex items-center justify-between gap-2 border-t pt-3"
            style={line}
          >
            <Controls showLang={showLang} up />
            <button onClick={onLogout} className="btn-ghost">
              <Icon name="logout" size={16} />
              {logoutLabel}
            </button>
          </div>
        </div>
      )}

      {/* ===== Phone / tablet: bottom tabs ===== */}
      <nav
        aria-label="Quick menu"
        className="b0 fixed inset-x-0 bottom-0 z-50 grid border-t lg:hidden"
        style={{
          ...line,
          background: "var(--card)",
          gridTemplateColumns: `repeat(${tabs.length + 1}, minmax(0, 1fr))`,
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={isOn(tab) ? "page" : undefined}
            className={`relative flex h-16 min-w-0 flex-col items-center justify-center gap-1 text-[0.7rem] font-semibold ${
              isOn(tab) ? "pr" : "mu"
            }`}
          >
            <span className="relative">
              <Icon name={ico(tab.icon)} size={22} />
              {(badges[tab.href] || 0) > 0 && (
                <span className="absolute -right-3 -top-1 rounded-full bg-red-700 px-1.5 text-[10px] leading-4 text-white">
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
          aria-expanded={more}
          className={`flex h-16 min-w-0 flex-col items-center justify-center gap-1 text-[0.7rem] font-semibold ${
            more || moreActive ? "pr" : "mu"
          }`}
        >
          <Icon name="menu" size={22} />
          <span className="w-full truncate px-0.5 text-center">
            {moreLabel}
          </span>
        </button>
      </nav>
    </div>
  );
}
