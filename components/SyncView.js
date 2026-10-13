"use client";

import { useEffect, useRef, useState } from "react";

// mode "auto"   = refresh by itself when it is safe
// mode "notify" = show a small "Refresh" bar instead
// mode "off"    = never
export default function SyncView({
  tick,
  resetKey,
  mode = "auto",
  labels,
  children,
}) {
  const wrap = useRef(null);
  const dirty = useRef(false); // the user typed or chose something
  const lastAct = useRef(0);
  const seen = useRef(tick);
  const timer = useRef(null);
  const [gen, setGen] = useState(0);
  const [stale, setStale] = useState(false);

  // Watch what the person is doing on the page
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const act = () => {
      lastAct.current = Date.now();
    };
    const mark = (e) => {
      act();
      const t = e.target;
      if (t && t.matches && t.matches("input, textarea, select"))
        dirty.current = true;
    };
    const clear = () => {
      act();
      dirty.current = false;
    };
    el.addEventListener("input", mark, true);
    el.addEventListener("change", mark, true);
    el.addEventListener("submit", clear, true);
    el.addEventListener("click", act, true);
    el.addEventListener("keydown", act, true);
    return () => {
      el.removeEventListener("input", mark, true);
      el.removeEventListener("change", mark, true);
      el.removeEventListener("submit", clear, true);
      el.removeEventListener("click", act, true);
      el.removeEventListener("keydown", act, true);
    };
  }, []);

  // A new page starts fresh
  useEffect(() => {
    dirty.current = false;
    seen.current = tick;
    setStale(false);
    clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetKey]);

  function refreshNow() {
    clearTimeout(timer.current);
    const el = wrap.current;
    // Keep the page height while it reloads, so the screen does not jump
    if (el) el.style.minHeight = el.offsetHeight + "px";
    dirty.current = false;
    setStale(false);
    setGen((g) => g + 1);
    setTimeout(() => {
      if (el) el.style.minHeight = "";
    }, 2000);
  }

  function attempt() {
    if (dirty.current) {
      setStale(true); // never erase what someone is typing
      return;
    }
    if (Date.now() - lastAct.current < 6000) {
      timer.current = setTimeout(attempt, 2000); // wait until they pause
      return;
    }
    refreshNow();
  }

  useEffect(() => {
    if (tick === seen.current) return;
    seen.current = tick;
    if (mode === "off") return;
    if (mode === "notify") {
      // Ignore changes caused by the person's own recent action
      if (Date.now() - lastAct.current > 20000) setStale(true);
      return;
    }
    clearTimeout(timer.current);
    attempt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick]);

  return (
    <>
      {stale && (
        <div
          role="status"
          className="cd fixed bottom-24 left-1/2 z-[60] flex w-[92%] max-w-md -translate-x-1/2 items-center justify-between gap-3 p-3 shadow-2xl lg:bottom-6"
        >
          <span className="text-sm font-extrabold">🔄 {labels.msg}</span>
          <button onClick={refreshNow} className="btn sm shrink-0">
            {labels.btn}
          </button>
        </div>
      )}
      <div ref={wrap}>
        <div key={gen}>{children}</div>
      </div>
    </>
  );
}
