"use client";

import ChatRoom from "@/components/ChatRoom";

export default function AdminDiscussion() {
  return (
    <div className="up">
      <h1 className="fluid-h2 font-extrabold">Class discussion</h1>
      <p className="mu mt-1 font-semibold">
        Every approved student sees this room. You can delete any message with
        ✕.
      </p>
      <div className="mt-5">
        <ChatRoom forceEn />
      </div>
    </div>
  );
}
