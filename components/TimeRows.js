import Icon from "./Icon";

export default function TimeRows({ rows }) {
  return (
    <>
      {rows.map(([zone, time, d]) => (
        <div
          key={zone}
          className="flex flex-wrap items-center gap-x-3 gap-y-1 py-1.5 text-sm"
        >
          <span className="pill flex w-24 shrink-0 items-center justify-center gap-1.5 text-xs font-semibold">
            <Icon name={d === "s" ? "sun" : "moon"} size={13} />
            {zone}
          </span>
          <span className="min-w-0 break-words font-medium">{time}</span>
        </div>
      ))}
    </>
  );
}
