import Icon from "./Icon";

export default function Notice({ icon = "info", title, text, children }) {
  return (
    <div className="tx flex min-h-dvh items-center justify-center px-4">
      <div className="cd stat stat-warn w-full max-w-md p-8 text-center">
        <span
          className="mx-auto flex h-12 w-12 items-center justify-center rounded-md"
          style={{ background: "var(--brand-soft)", color: "var(--pri)" }}
        >
          <Icon name={icon} size={24} />
        </span>
        <h1 className="mt-4 text-2xl font-semibold">{title}</h1>
        <p className="mu mt-3 leading-relaxed">{text}</p>
        <div className="mt-6 flex flex-col gap-3">{children}</div>
      </div>
    </div>
  );
}
