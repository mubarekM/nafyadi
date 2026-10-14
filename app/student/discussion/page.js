"use client";

import ChatRoom from "@/components/ChatRoom";
import { usePrefs } from "@/lib/prefs";
import { PageHead } from "@/components/ui";

export default function StudentDiscussion() {
  const { t } = usePrefs();
  return (
    <div className="up space-y-5">
      <PageHead title={t("chatT")} sub={t("chatSub")} />
      <ChatRoom />
    </div>
  );
}
