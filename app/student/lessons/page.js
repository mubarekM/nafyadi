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
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("lessons")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });
      setLessons(
        (data || []).filter(
          (l) => l.level === "All levels" || l.level === profile.english_level,
        ),
      );
    }
    load();
  }, [profile.english_level]);

  async function openLesson(l) {
    setSelected(l);
    window.scrollTo({ top: 0 });
    const supabase = createClient();
    await supabase
      .from("lesson_views")
      .upsert(
        { student_id: id, lesson_id: l.id },
        { onConflict: "student_id,lesson_id", ignoreDuplicates: true },
      );
  }

  if (!lessons) return <p className="mu font-bold">...</p>;

  if (!selected) {
    return (
      <div className="up">
        <h1 className="fluid-h2 font-extrabold">{t("yourLessons")}</h1>
        <div className="mt-6 space-y-3">
          {lessons.length === 0 && (
            <p className="mu font-semibold">{t("noLessonsYet")}</p>
          )}
          {lessons.map((l) => (
            <button
              key={l.id}
              onClick={() => openLesson(l)}
              className="cd lift block w-full p-5 text-left"
            >
              <p className="pr text-lg font-extrabold">{l.title}</p>
              <p className="mu mt-1 text-sm font-bold">{lvLabel(t, l.level)}</p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const embed = getEmbedUrl(selected.video_url);

  return (
    <div className="up">
      <button
        onClick={() => setSelected(null)}
        className="pr text-sm font-extrabold hover:underline"
      >
        ← {t("allLessons")}
      </button>
      <h1 className="fluid-h2 mt-4 font-extrabold">{selected.title}</h1>
      <p className="mu mt-1 text-sm font-bold">{lvLabel(t, selected.level)}</p>

      {embed && (
        <div className="mt-6 aspect-video overflow-hidden rounded-2xl bg-black">
          <iframe
            src={embed}
            title={selected.title}
            className="h-full w-full"
            allowFullScreen
          />
        </div>
      )}

      {selected.content && (
        <div className="cd mt-6 whitespace-pre-wrap p-5 font-semibold leading-relaxed sm:p-6">
          {selected.content}
        </div>
      )}

      {selected.file_url && (
        <div className="cd mt-6 p-5 sm:p-6">
          <p className="pr mb-3 break-words font-extrabold">
            {selected.file_name || t("lessonFile")}
          </p>
          {isAudio(selected.file_name) ? (
            <audio controls src={selected.file_url} className="w-full" />
          ) : (
            <a
              href={selected.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn"
            >
              {t("openFile")}
            </a>
          )}
        </div>
      )}
    </div>
  );
}
