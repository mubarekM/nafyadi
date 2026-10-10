"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase";
import { usePrefs } from "@/lib/prefs";

const ENG = {
  chatPh: "Write a message...",
  send: "Send",
  chatEmpty: "No messages yet. Say hello! 👋",
  teacherT: "Teacher",
  delAsk: "Delete this message?",
};

export default function ChatRoom({ forceEn = false }) {
  const { t } = usePrefs();
  const tr = (k) => (forceEn ? ENG[k] : t(k));

  const [me, setMe] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [msgs, setMsgs] = useState(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState("");
  const box = useRef(null);
  const stick = useRef(true);

  async function fetchAll(supabase) {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    setMsgs((data || []).reverse());
  }

  useEffect(() => {
    const supabase = createClient();
    let channel;
    let timer;
    let stopped = false;

    async function start() {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user || stopped) return;
      setMe(u.user.id);
      const { data: p } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", u.user.id)
        .single();
      setIsAdmin(p?.role === "admin");
      await fetchAll(supabase);

      channel = supabase
        .channel("class-room-" + Math.random().toString(36).slice(2))
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "messages" },
          (p2) =>
            setMsgs((prev) =>
              prev && !prev.some((m) => m.id === p2.new.id)
                ? [...prev, p2.new]
                : prev,
            ),
        )
        .on(
          "postgres_changes",
          { event: "DELETE", schema: "public", table: "messages" },
          (p2) =>
            setMsgs((prev) =>
              prev ? prev.filter((m) => m.id !== p2.old.id) : prev,
            ),
        )
        .subscribe();

      // Safety net: refresh every 20 seconds in case live updates drop
      timer = setInterval(() => fetchAll(supabase), 20000);
    }
    start();

    return () => {
      stopped = true;
      if (channel) supabase.removeChannel(channel);
      if (timer) clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    const el = box.current;
    if (el && stick.current) el.scrollTop = el.scrollHeight;
  }, [msgs]);

  function onScroll() {
    const el = box.current;
    if (el)
      stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  }

  async function send(e) {
    if (e) e.preventDefault();
    const body = text.trim();
    if (!body || sending || !me) return;
    setSending(true);
    setErr("");
    const supabase = createClient();
    const { data, error } = await supabase
      .from("messages")
      .insert({ user_id: me, body })
      .select()
      .single();
    if (error) {
      setErr(error.message);
    } else {
      setText("");
      stick.current = true;
      setMsgs((prev) =>
        prev && !prev.some((m) => m.id === data.id) ? [...prev, data] : prev,
      );
    }
    setSending(false);
  }

  async function remove(id) {
    if (!confirm(tr("delAsk"))) return;
    const supabase = createClient();
    await supabase.from("messages").delete().eq("id", id);
    setMsgs((prev) => (prev ? prev.filter((m) => m.id !== id) : prev));
  }

  const time = (iso) =>
    new Date(iso).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div
      className="cd flex flex-col overflow-hidden"
      style={{ height: "calc(100dvh - 15rem)", minHeight: 380 }}
    >
      <div
        ref={box}
        onScroll={onScroll}
        className="flex-1 space-y-3 overflow-y-auto p-4"
      >
        {!msgs && <p className="mu font-bold">...</p>}
        {msgs && msgs.length === 0 && (
          <p className="mu py-10 text-center font-bold">{tr("chatEmpty")}</p>
        )}
        {msgs &&
          msgs.map((m) => {
            const mine = m.user_id === me;
            const teacher = m.sender_role === "admin";
            return (
              <div
                key={m.id}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[88%] px-4 py-2.5 sm:max-w-[75%] ${
                    mine
                      ? "bubble-me rounded-2xl rounded-br-md"
                      : "cd rounded-2xl rounded-bl-md"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2 text-xs font-extrabold">
                    {!mine && (
                      <span className="pr">{m.sender_name || "Student"}</span>
                    )}
                    {teacher && (
                      <span className="chip chip-y">{tr("teacherT")}</span>
                    )}
                    <span className="opacity-70">{time(m.created_at)}</span>
                    {(mine || isAdmin) && (
                      <button
                        onClick={() => remove(m.id)}
                        aria-label="Delete"
                        className="opacity-70 hover:opacity-100"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <p className="mt-1 whitespace-pre-wrap font-semibold">
                    {m.body}
                  </p>
                </div>
              </div>
            );
          })}
      </div>

      <form
        onSubmit={send}
        className="border-t p-3"
        style={{ borderColor: "var(--ln)" }}
      >
        {err && <p className="err mb-2">{err}</p>}
        <div className="flex items-end gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={2}
            maxLength={1000}
            placeholder={tr("chatPh")}
            className="field"
            style={{ resize: "none" }}
          />
          <button
            type="submit"
            disabled={sending || !text.trim()}
            className="btn shrink-0"
          >
            {tr("send")}
          </button>
        </div>
      </form>
    </div>
  );
}
