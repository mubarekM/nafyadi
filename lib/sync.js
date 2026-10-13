"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

// Returns a number that goes up whenever something changes in these tables.
export function useSyncTick(tables, enabled = true) {
  const [tick, setTick] = useState(0);
  const key = tables.join(",");

  useEffect(() => {
    if (!enabled) return;
    const supabase = createClient();
    let timer = null;
    let hiddenAt = 0;
    let connected = false;

    const bump = () => {
      clearTimeout(timer);
      timer = setTimeout(() => setTick((n) => n + 1), 700);
    };

    const channel = supabase.channel(
      "sync-" + Math.random().toString(36).slice(2),
    );
    key.split(",").forEach((table) => {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        bump,
      );
    });
    channel.subscribe((status) => {
      connected = status === "SUBSCRIBED";
    });

    const onVisible = () => {
      if (document.visibilityState === "hidden") {
        hiddenAt = Date.now();
        return;
      }
      if (hiddenAt && Date.now() - hiddenAt > 30000) bump();
      hiddenAt = 0;
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("online", bump);

    // Safety net: if live updates are not connected, check every 45 seconds
    const beat = setInterval(() => {
      if (!connected && document.visibilityState === "visible") bump();
    }, 45000);

    return () => {
      clearTimeout(timer);
      clearInterval(beat);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("online", bump);
      supabase.removeChannel(channel);
    };
  }, [enabled, key]);

  return tick;
}
