import Icon from "./Icon";

const TONE = { ok: "stat-ok", warn: "stat-warn", bad: "stat-bad" };

// Page title with a short description, and optional buttons on the right
export function PageHead({ title, sub, children }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h1 className="fluid-h2 font-semibold">{title}</h1>
        {sub && <p className="mu mt-1">{sub}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

// Number card with a colored line on top
export function Stat({ value, label, tone, hint, children }) {
  return (
    <div className={`cd stat ${TONE[tone] || ""} p-5`}>
      <p className="display break-words text-3xl">{value}</p>
      <p className="mu mt-1 text-sm">{label}</p>
      {hint && <p className="mu mt-1 text-xs">{hint}</p>}
      {children}
    </div>
  );
}

// A flat card with an optional title bar
export function Panel({
  title,
  icon,
  action,
  children,
  flush = false,
  className = "",
}) {
  return (
    <section className={`cd overflow-hidden ${className}`}>
      {(title || action) && (
        <div
          className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-3.5"
          style={{ borderColor: "var(--ln)" }}
        >
          <h2 className="flex items-center gap-2 font-semibold">
            {icon && (
              <Icon name={icon} size={18} className="text-[var(--pri)]" />
            )}
            {title}
          </h2>
          {action}
        </div>
      )}
      <div className={flush ? "" : "p-5"}>{children}</div>
    </section>
  );
}

// Friendly "nothing here yet" message
export function Empty({ icon = "info", children }) {
  return (
    <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
      <span
        className="flex h-11 w-11 items-center justify-center rounded-md"
        style={{ background: "var(--brand-soft)", color: "var(--pri)" }}
      >
        <Icon name={icon} size={20} />
      </span>
      <p className="mu max-w-sm">{children}</p>
    </div>
  );
}

// Tab bar: options = [[key, label], ...]
export function Seg({ value, onChange, options }) {
  return (
    <div
      className="inline-flex flex-wrap gap-1 rounded-md border p-1"
      style={{ borderColor: "var(--ln)", background: "var(--card)" }}
    >
      {options.map(([k, label]) => (
        <button
          key={k}
          onClick={() => onChange(k)}
          aria-pressed={value === k}
          className="min-h-[36px] rounded px-3 text-sm font-semibold"
          style={
            value === k
              ? { background: "var(--btn)", color: "#fff" }
              : { color: "var(--tx)" }
          }
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function Avatar({ name, size = 40 }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full font-semibold"
      style={{
        width: size,
        height: size,
        background: "var(--brand-soft)",
        color: "var(--pri)",
      }}
      aria-hidden="true"
    >
      {(name || "?").charAt(0).toUpperCase()}
    </span>
  );
}
