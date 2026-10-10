export default function TimeRows({ rows }) {
  return (
    <>
      {rows.map(([zone, time, d]) => (
        <div
          key={zone}
          className="flex flex-wrap items-center gap-x-3 gap-y-1 py-1.5 text-sm font-bold"
        >
          <span className="pill w-24 shrink-0 text-center text-xs font-extrabold">
            {zone} {d === "s" ? "☀️" : "🌙"}
          </span>
          <span className="min-w-0 break-words">{time}</span>
        </div>
      ))}
    </>
  );
}
