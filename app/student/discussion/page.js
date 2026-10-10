"use client";

import ChatRoom from "@/components/ChatRoom";
import { usePrefs } from "@/lib/prefs";

export default function StudentDiscussion() {
  const { t } = usePrefs();
  return (
    <div className="up">
      <h1 className="fluid-h2 font-extrabold">💬 {t("chatT")}</h1>
      <p className="mu mt-1 font-semibold">{t("chatSub")}</p>
      <div className="mt-5">
        <ChatRoom />
      </div>
    </div>
  );
}
