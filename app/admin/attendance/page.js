"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { PageHead, Stat, Empty, Seg, Avatar } from "@/components/ui";

const OPTIONS = [
  ["present", "Present", "chip-g"],
  ["late", "Late", "chip-y"],
  ["absent", "Absent", "chip-r"],
  ["excused", "Excused", "chip-n"],
];
const ATTENDED = ["joined", "present", "late"];
const fmt = (iso) =>
  new Date(iso).toLocaleString([], {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function AdminAttendance() {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("class");
  const [classId, setClassId] = useState("");
  const [group, setGroup] = useState("");
  const [msg, setMsg] = useState("");

  async function load() {
    const supabase = createClient();
    const [c, s, a] = await Promise.all([
      supabase
        .from("live_classes")
        .select("*")
        .order("starts_at", { ascending: false }),
      supabase
        .from("profiles")
        .select("id, full_name, english_level, study_group, created_at")
        .eq("role", "student")
        .eq("status", "approved")
        .order("full_name", { ascending: true }),
      supabase.from("attendance").select("*"),
    ]);
    const classes = c.data || [];
    setData({ classes, students: s.data || [], rows: a.data || [] });
    setClassId((cur) => {
      if (cur) return cur;
      const soon = Date.now() + 3 * 60 * 60 * 1000;
      const recent = classes.find(
        (x) => new Date(x.starts_at).getTime() <= soon,
      );
      return (recent || classes[0])?.id || "";
    });
  }

  useEffect(() => {
    load();
  }, []);

  if (!data) return <p className="mu font-semibold">...</p>;

  const { classes, students, rows } = data;
  const rowOf = (cid, sid) =>
    rows.find((r) => r.class_id === cid && r.student_id === sid);
  const levelOk = (cls, s) =>
    cls.level === "All levels" || s.english_level === cls.level;
  const line = { borderColor: "var(--ln)" };

  function setRows(next) {
    setData((d) => ({ ...d, rows: next }));
  }

  async function mark(studentId, status) {
    setMsg("");
    const row = {
      class_id: classId,
      student_id: studentId,
      status,
      marked_by: "teacher",
    };
    setRows([
      ...rows.filter(
        (r) => !(r.class_id === classId && r.student_id === studentId),
      ),
      { ...row, id: "tmp-" + studentId },
    ]);
    const supabase = createClient();
    const { error } = await supabase
      .from("attendance")
      .upsert(row, { onConflict: "class_id,student_id" });
    if (error) {
      setMsg("Could not save: " + error.message);
      load();
    }
  }

  async function clearMark(studentId) {
    setMsg("");
    setRows(
      rows.filter(
        (r) => !(r.class_id === classId && r.student_id === studentId),
      ),
    );
    const supabase = createClient();
    const { error } = await supabase
      .from("attendance")
      .delete()
      .eq("class_id", classId)
      .eq("student_id", studentId);
    if (error) {
      setMsg("Could not save: " + error.message);
      load();
    }
  }

  async function markAllPresent(list) {
    setMsg("");
    const todo = list
      .filter((s) => rowOf(classId, s.id)?.marked_by !== "teacher")
      .map((s) => ({
        class_id: classId,
        student_id: s.id,
        status: "present",
        marked_by: "teacher",
      }));
    if (todo.length === 0) return;
    const supabase = createClient();
    const { error } = await supabase
      .from("attendance")
      .upsert(todo, { onConflict: "class_id,student_id" });
    if (error) setMsg("Could not save: " + error.message);
    await load();
  }

  const cls = classes.find((c) => c.id === classId);
  const list = cls
    ? students.filter(
        (s) => levelOk(cls, s) && (!group || String(s.study_group) === group),
      )
    : [];

  // Summary by student
  const now = Date.now();
  const past = classes.filter((c) => new Date(c.starts_at).getTime() < now);
  const summary = students
    .map((s) => {
      const eligible = past.filter(
        (c) =>
          levelOk(c, s) &&
          new Date(c.starts_at).getTime() >= new Date(s.created_at).getTime(),
      );
      const attended = eligible.filter((c) =>
        ATTENDED.includes(rowOf(c.id, s.id)?.status),
      ).length;
      const pct = eligible.length
        ? Math.round((attended / eligible.length) * 100)
        : null;
      return { s, total: eligible.length, attended, pct };
    })
    .filter((x) => !group || String(x.s.study_group) === group);

  const rated = summary.filter((x) => x.pct !== null);
  const avg = rated.length
    ? Math.round(rated.reduce((a, x) => a + x.pct, 0) / rated.length)
    : null;
  const here = cls
    ? list.filter((s) => ATTENDED.includes(rowOf(classId, s.id)?.status)).length
    : 0;

  return (
    <div className="up space-y-6">
      <PageHead
        title="Attendance"
        sub="Students who tap Join during class time are marked automatically. You can correct anyone."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat value={students.length} label="Approved students" />
        <Stat value={past.length} label="Classes held" />
        <Stat
          value={avg === null ? "–" : `${avg}%`}
          label="Average attendance"
          tone="ok"
        />
        <Stat
          value={cls ? `${here} / ${list.length}` : "–"}
          label="Here in selected class"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Seg
          value={tab}
          onChange={setTab}
          options={[
            ["class", "By class"],
            ["student", "By student"],
          ]}
        />
        <select
          value={group}
          onChange={(e) => setGroup(e.target.value)}
          className="field !w-auto"
        >
          <option value="">All groups</option>
          <option value="1">Group 1</option>
          <option value="2">Group 2</option>
          <option value="3">Group 3</option>
          <option value="4">Group 4</option>
        </select>
      </div>

      {msg && <p className="err">{msg}</p>}

      {tab === "class" && (
        <>
          {classes.length === 0 ? (
            <div className="cd">
              <Empty icon="calendar">
                No live classes yet. Schedule one under Live Classes.
              </Empty>
            </div>
          ) : (
            <>
              <div>
                <label className="lbl">Live class</label>
                <select
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  className="field"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} · {fmt(c.starts_at)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="mu text-sm">{list.length} students</p>
                <button
                  onClick={() => markAllPresent(list)}
                  className="btn-ghost"
                >
                  Mark everyone present
                </button>
              </div>

              <div className="space-y-3">
                {list.length === 0 && (
                  <div className="cd">
                    <Empty icon="users">No students match this class.</Empty>
                  </div>
                )}
                {list.map((s) => {
                  const r = rowOf(classId, s.id);
                  return (
                    <article key={s.id} className="cd p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex min-w-0 items-center gap-3">
                          <Avatar name={s.full_name} size={36} />
                          <div className="min-w-0">
                            <p className="truncate font-semibold">
                              {s.full_name}
                            </p>
                            <p className="mu text-xs">
                              {s.english_level}
                              {s.study_group ? ` · Group ${s.study_group}` : ""}
                            </p>
                          </div>
                        </div>
                        {r?.status === "joined" && (
                          <span className="chip chip-g">joined by link</span>
                        )}
                        {r && r.status !== "joined" && (
                          <button
                            onClick={() => clearMark(s.id)}
                            className="mu text-xs font-semibold hover:underline"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {OPTIONS.map(([key, label, chip]) => (
                          <button
                            key={key}
                            onClick={() => mark(s.id, key)}
                            aria-pressed={r?.status === key}
                            className={
                              r?.status === key
                                ? `chip ${chip} !px-4 !py-2 !text-sm ring-2 ring-[var(--pri)]`
                                : "btn-ghost"
                            }
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}

      {tab === "student" && (
        <div className="space-y-3">
          {summary.length === 0 && (
            <div className="cd">
              <Empty icon="users">No students yet.</Empty>
            </div>
          )}
          {summary.map(({ s, total, attended, pct }) => (
            <article key={s.id} className="cd p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={s.full_name} size={36} />
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{s.full_name}</p>
                    <p className="mu text-xs">
                      {s.english_level}
                      {s.study_group ? ` · Group ${s.study_group}` : ""}
                    </p>
                  </div>
                </div>
                {pct === null ? (
                  <span className="chip chip-n">no classes yet</span>
                ) : (
                  <span
                    className={`chip ${pct >= 75 ? "chip-g" : pct >= 50 ? "chip-y" : "chip-r"}`}
                  >
                    {pct}% · {attended} of {total}
                  </span>
                )}
              </div>
              {pct !== null && (
                <div
                  className="mt-3 h-1.5 w-full overflow-hidden rounded-full"
                  style={{ background: "var(--soft)" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{ width: pct + "%", background: "var(--pri)" }}
                  />
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
