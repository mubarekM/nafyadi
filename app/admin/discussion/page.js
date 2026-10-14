"use client";

import ChatRoom from "@/components/ChatRoom";
import { PageHead } from "@/components/ui";

export default function AdminDiscussion() {
  return (
    <div className="up space-y-5">
      <PageHead
        title="Class discussion"
        sub="Every approved student sees this room. You can delete any message with the x button."
      />
      <ChatRoom forceEn />
    </div>
  );
}
