"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { usePrefs } from "@/lib/prefs";
import { useStudent, lvLabel } from "@/components/StudentShell";

function getEmbedUrl(url) {
  if (!url) return null;
  try {
    const u = new URL(url);
    let vid = null;
    if (u.hostname.includes("youtu.be")) vid = u.pathname.slice(1);
    else if (u.searchParams.get("v")) vid = u.searchParams.get("v");
    else if (u.pathname.startsWith("/embed/")) vid = u.pathname.split("/")[2];
    else if (u.pathname.startsWith("/shorts/")) vid = u.pathname.split("/")[2];
    return vid ? `https://www.youtube.com/embed/${vid}` : null;
  } catch {
    return null;
  }
}

const isAudio = (name) => /\.(mp3|wav|m4a|ogg|aac)$/i.test(name || "");

export default function StudentLessons() {
  const { id, profile } = useStudent();
  const { t } = usePrefs();
  const [lessons, setLessons] = useState(null);
  const [opened, setOpened] = useState(new Set());
  const [checks, setChecks] = useState({});
  const [shown, setShown] = useState({});

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("lessons")
        .select("*")
        .eq("published", true)
        .order("week", { ascending: true })
        .order("created_at", { ascending: true });
      setLessons(
        (data || []).filter(
          (l) => l.level === "All levels" || l.level === profile.english_level,
        ),
      );

      const { data: views } = await supabase
        .from("lesson_views")
        .select("lesson_id")
        .eq("student_id", id);
      setOpened(new Set((views || []).map((v) => v.lesson_id)));

      const { data: cks } = await supabase
        .from("lesson_checks")
        .select("lesson_id, checked")
        .eq("student_id", id);
      const map = {};
      (cks || []).forEach((c) => {
        map[c.lesson_id] = c.checked || [];
      });
      setChecks(map);
    }
    load();
  }, [id, profile.english_level]);

  async function onToggle(e, l) {
    const open = e.currentTarget.open;
    setShown((s) => ({ ...s, [l.id]: open }));
    if (open && !opened.has(l.id)) {
      setOpened((prev) => new Set(prev).add(l.id));
      const supabase = createClient();
      await supabase
        .from("lesson_views")
        .upsert(
          { student_id: id, lesson_id: l.id },
          { onConflict: "student_id,lesson_id", ignoreDuplicates: true },
        );
    }
  }

  async function toggleCheck(l, idx) {
    const current = checks[l.id] || [];
    const next = current.includes(idx)
      ? current.filter((x) => x !== idx)
      : [...current, idx];
    setChecks((c) => ({ ...c, [l.id]: next }));
    const supabase = createClient();
    await supabase.from("lesson_checks").upsert(
      {
        student_id: id,
        lesson_id: l.id,
        checked: next,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "student_id,lesson_id" },
    );
  }

  if (!lessons) return <p className="mu font-bold">...</p>;

  // Group lessons by week
  const weeks = [];
  const byWeek = {};
  lessons.forEach((l) => {
    const w = l.week || 1;
    if (!byWeek[w]) {
      byWeek[w] = { week: w, title: null, items: [] };
      weeks.push(byWeek[w]);
    }
    if (!byWeek[w].title && l.week_title) byWeek[w].title = l.week_title;
    byWeek[w].items.push(l);
  });
  weeks.sort((a, b) => a.week - b.week);

  const line = { borderColor: "var(--ln)" };

  function renderLesson(l) {
    const embed = getEmbedUrl(l.video_url);
    const list = l.checklist || [];
    const done = (checks[l.id] || []).filter((i) => i < list.length).length;

    return (
      <details
        key={l.id}
        onToggle={(e) => onToggle(e, l)}
        className="group/lesson rounded-xl border"
        style={line}
      >
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
          <div className="min-w-0">
            <p className="truncate font-extrabold">{l.title}</p>
            <div className="mt-1 flex flex-wrap gap-2">
              <span className="chip chip-n">{lvLabel(t, l.level)}</span>
              {opened.has(l.id) && (
                <span className="chip chip-g">{t("opened")}</span>
              )}
              {list.length > 0 && (
                <span className="chip chip-n">
                  {done}/{list.length} ✓
                </span>
              )}
            </div>
          </div>
          <span className="pr text-xl transition-transform group-open/lesson:rotate-180">
            ⌄
          </span>
        </summary>

        {shown[l.id] && (
          <div className="space-y-4 border-t p-4" style={line}>
            {embed && (
              <div className="aspect-video overflow-hidden rounded-2xl bg-black">
                <iframe
                  src={embed}
                  title={l.title}
                  className="h-full w-full"
                  allowFullScreen
                />
              </div>
            )}

            {l.content && (
              <div>
                <p className="pr mb-2 font-extrabold">📝 {t("notesT")}</p>
                <div className="whitespace-pre-wrap font-semibold leading-relaxed">
                  {l.content}
                </div>
              </div>
            )}

            {l.file_url && (
              <div>
                <p className="pr mb-2 break-words font-extrabold">
                  📎 {l.file_name || t("lessonFile")}
                </p>
                {isAudio(l.file_name) ? (
                  <audio controls src={l.file_url} className="w-full" />
                ) : (
                  <a
                    href={l.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn sm"
                  >
                    {t("openFile")}
                  </a>
                )}
              </div>
            )}

            {list.length > 0 && (
              <div>
                <p className="pr mb-2 font-extrabold">✅ {t("chkT")}</p>
                <div className="space-y-2">
                  {list.map((item, idx) => {
                    const on = (checks[l.id] || []).includes(idx);
                    return (
                      <label
                        key={idx}
                        className="flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 font-bold"
                        style={{
                          borderColor: on ? "var(--pri)" : "var(--ln)",
                          background: on ? "var(--soft)" : "transparent",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={on}
                          onChange={() => toggleCheck(l, idx)}
                        />
                        <span
                          className={`min-w-0 break-words ${on ? "line-through opacity-70" : ""}`}
                        >
                          {item}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </details>
    );
  }

  return (
    <div className="up">
      <h1 className="fluid-h2 font-extrabold">{t("yourLessons")}</h1>

      <div className="mt-6 space-y-4">
        {weeks.length === 0 && (
          <p className="mu font-semibold">{t("noLessonsYet")}</p>
        )}

        {weeks.map((w, wi) => {
          const count = w.items.filter((l) => opened.has(l.id)).length;
          return (
            <details key={w.week} open={wi === 0} className="cd group/week">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 sm:p-5 [&::-webkit-details-marker]:hidden">
                <div className="min-w-0">
                  <p className="pr text-lg font-extrabold">
                    {t("week")} {w.week}
                    {w.title ? `: ${w.title}` : ""}
                  </p>
                  <p className="mu text-sm font-bold">
                    {count} {t("of")} {w.items.length}
                  </p>
                </div>
                <span className="pr text-2xl transition-transform group-open/week:rotate-180">
                  ⌄
                </span>
              </summary>
              <div className="space-y-3 border-t p-3 sm:p-4" style={line}>
                {w.items.map((l) => renderLesson(l))}
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
