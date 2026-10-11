"use client";

import { createClient } from "@/lib/supabase";
import { usePrefs } from "@/lib/prefs";
import { useStudent } from "./StudentShell";

export default function JoinButton({ cls, className = "btn sm" }) {
  const { id } = useStudent();
  const { t } = usePrefs();

  function record() {
    // Count it only from 30 minutes before the start until 3 hours after
    const start = new Date(cls.starts_at).getTime();
    const now = Date.now();
    if (now < start - 30 * 60 * 1000 || now > start + 3 * 60 * 60 * 1000)
      return;

    const supabase = createClient();
    supabase
      .from("attendance")
      .upsert(
        {
          class_id: cls.id,
          student_id: id,
          status: "joined",
          marked_by: "student",
        },
        { onConflict: "class_id,student_id", ignoreDuplicates: true },
      )
      .then(() => {});
  }

  return (
    <a
      href={cls.meeting_url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={record}
      className={className}
    >
      {t("joinClass")}
    </a>
  );
}
