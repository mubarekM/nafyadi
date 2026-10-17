"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefs } from "@/lib/prefs";

const KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
export const captchaOn = !!KEY;

// Cloudflare Turnstile. Shows nothing at all until a site key is set.
export default function Captcha({ onToken, resetSignal = 0 }) {
  const { t } = usePrefs();
  const box = useRef(null);
  const widget = useRef(null);
  const [failed, setFailed] = useState(false);
  const [round, setRound] = useState(0);

  useEffect(() => {
    if (!KEY) return;
    let cancelled = false;
    let script = null;
    setFailed(false);

    function draw() {
      if (
        cancelled ||
        !box.current ||
        !window.turnstile ||
        widget.current !== null
      )
        return;
      widget.current = window.turnstile.render(box.current, {
        sitekey: KEY,
        callback: (token) => {
          setFailed(false);
          onToken(token);
        },
        "expired-callback": () => onToken(""),
        "error-callback": () => {
          onToken("");
          setFailed(true);
        },
      });
    }

    if (window.turnstile) {
      draw();
    } else {
      script = document.querySelector("script[data-turnstile]");
      if (!script) {
        script = document.createElement("script");
        script.src =
          "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        script.defer = true;
        script.dataset.turnstile = "1";
        document.head.appendChild(script);
      }
      script.addEventListener("load", draw);
    }

    return () => {
      cancelled = true;
      if (script) script.removeEventListener("load", draw);
      if (widget.current !== null && window.turnstile) {
        try {
          window.turnstile.remove(widget.current);
        } catch {}
      }
      widget.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [round]);

  useEffect(() => {
    if (widget.current !== null && window.turnstile) {
      try {
        window.turnstile.reset(widget.current);
      } catch {}
    }
  }, [resetSignal]);

  if (!KEY) return null;
  return (
    <div>
      <div ref={box} className="min-h-[65px]" />
      {failed && (
        <div className="err mt-2 flex flex-wrap items-center justify-between gap-2">
          <span>{t("captchaLoad")}</span>
          <button
            type="button"
            onClick={() => setRound((n) => n + 1)}
            className="btn-ghost"
          >
            {t("captchaRetry")}
          </button>
        </div>
      )}
    </div>
  );
}
