"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { usePrefs } from "@/lib/prefs";
import { useStudent, lvLabel } from "@/components/StudentShell";
import LockedCard from "@/components/LockedCard";

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
  const { id, profile, access } = useStudent();
  const { t } = usePrefs();
  const [lessons, setLessons] = useState(null);
  const [opened, setOpened] = useState(new Set());
  const [checks, setChecks] = useState({});
  const [shown, setShown] = useState({});
  const [urls, setUrls] = useState({});
  const [fileErr, setFileErr] = useState({});

  useEffect(() => {
    if (!access) return;
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
  }, [id, profile.english_level, access]);

  async function markOpened(l) {
    if (opened.has(l.id)) return;
    setOpened((prev) => new Set(prev).add(l.id));
    const supabase = createClient();
    await supabase
      .from("lesson_views")
      .upsert(
        { student_id: id, lesson_id: l.id },
        { onConflict: "student_id,lesson_id", ignoreDuplicates: true },
      );
  }

  // Private files: ask for a link that works for one hour
  async function loadFile(l) {
    if (urls[l.id]) return;
    if (l.file_path) {
      const supabase = createClient();
      const { data, error } = await supabase.storage
        .from("lesson-files")
        .createSignedUrl(l.file_path, 3600);
      if (error || !data?.signedUrl) {
        setFileErr((e) => ({ ...e, [l.id]: true }));
        return;
      }
      setFileErr((e) => ({ ...e, [l.id]: false }));
      setUrls((u) => ({ ...u, [l.id]: data.signedUrl }));
    } else if (l.file_url) {
      setUrls((u) => ({ ...u, [l.id]: l.file_url }));
    }
  }

  function onSection(e, l, sec) {
    const open = e.currentTarget.open;
    setShown((s) => ({ ...s, [`${l.id}:${sec}`]: open }));
    if (open) {
      markOpened(l);
      if (sec === "file") loadFile(l);
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

  if (!access) return <LockedCard />;
  if (!lessons) return <p className="mu font-bold">...</p>;

  // Group by week
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

  const doneCount = lessons.filter((l) => opened.has(l.id)).length;
  const pct = lessons.length
    ? Math.round((doneCount / lessons.length) * 100)
    : 0;
  const line = { borderColor: "var(--ln)" };

  function renderLesson(l) {
    const embed = getEmbedUrl(l.video_url);
    const list = l.checklist || [];
    const done = (checks[l.id] || []).filter((i) => i < list.length).length;

    const sections = [];
    if (embed) sections.push(["video", "🎬", t("secVideo")]);
    if (l.content) sections.push(["notes", "📝", t("secNotes")]);
    if (l.file_path || l.file_url) sections.push(["file", "📎", t("secFiles")]);
    if (list.length > 0)
      sections.push([
        "check",
        "✅",
        `${t("secCheck")} (${done}/${list.length})`,
      ]);

    return (
      <div key={l.id} className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-extrabold">{l.title}</p>
          <span className="chip chip-n">{lvLabel(t, l.level)}</span>
          {opened.has(l.id) && (
            <span className="chip chip-g">{t("opened")}</span>
          )}
        </div>

        {sections.map(([key, icon, label]) => (
          <details
            key={key}
            onToggle={(e) => onSection(e, l, key)}
            className="group/sec rounded-xl border"
            style={line}
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-extrabold [&::-webkit-details-marker]:hidden">
              <span className="min-w-0 break-words">
                {icon} {label}
              </span>
              <span className="pr text-xl transition-transform group-open/sec:rotate-180">
                ⌄
              </span>
            </summary>

            {shown[`${l.id}:${key}`] && (
              <div className="border-t p-4" style={line}>
                {key === "video" && (
                  <div className="aspect-video overflow-hidden rounded-2xl bg-black">
                    <iframe
                      src={embed}
                      title={l.title}
                      className="h-full w-full"
                      allowFullScreen
                    />
                  </div>
                )}

                {key === "notes" && (
                  <div className="whitespace-pre-wrap font-semibold leading-relaxed">
                    {l.content}
                  </div>
                )}

                {key === "file" && (
                  <div>
                    <p className="pr mb-2 break-words font-extrabold">
                      {l.file_name || t("lessonFile")}
                    </p>
                    {urls[l.id] ? (
                      isAudio(l.file_name) ? (
                        <audio controls src={urls[l.id]} className="w-full" />
                      ) : (
                        <a
                          href={urls[l.id]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn sm"
                        >
                          {t("openFile")}
                        </a>
                      )
                    ) : fileErr[l.id] ? (
                      <p className="err">{t("fileErr")}</p>
                    ) : (
                      <p className="mu font-bold">{t("fileLoading")}</p>
                    )}
                  </div>
                )}

                {key === "check" && (
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
                )}
              </div>
            )}
          </details>
        ))}
      </div>
    );
  }

  return (
    <div className="up space-y-5">
      <h1 className="fluid-h2 font-extrabold">{t("yourLessons")}</h1>

      <div className="cd flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
        <div className="grad flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-3xl">
          🎓
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xl font-extrabold">{t("courseName")}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="chip chip-g">{t("activeT")}</span>
            <span className="chip chip-n">
              {lvLabel(t, profile.english_level)}
            </span>
            <span className="chip chip-n">
              {weeks.length} {t("weeksCount")}
            </span>
          </div>
          <div
            className="mt-3 h-2.5 w-full overflow-hidden rounded-full"
            style={{ background: "var(--soft)" }}
          >
            <div
              className="grad h-full rounded-full"
              style={{ width: pct + "%" }}
            />
          </div>
          <p className="mu mt-1 text-xs font-bold">
            {doneCount} {t("of")} {lessons.length}
          </p>
        </div>
      </div>

      {weeks.length === 0 && (
        <p className="mu font-semibold">{t("noLessonsYet")}</p>
      )}

      <div className="space-y-4">
        {weeks.map((w, wi) => {
          const count = w.items.filter((l) => opened.has(l.id)).length;
          return (
            <details
              key={w.week}
              open={wi === 0}
              className="cd group/week overflow-hidden"
            >
              <summary className="week-h flex cursor-pointer list-none items-center justify-between gap-3 p-4 sm:p-5 [&::-webkit-details-marker]:hidden">
                <div className="min-w-0">
                  <p className="text-lg font-extrabold">
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
              <div className="space-y-5 p-4 sm:p-5">
                {w.items.map(renderLesson)}
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
