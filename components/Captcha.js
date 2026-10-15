"use client";

import { useEffect, useRef } from "react";

const KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
export const captchaOn = !!KEY;

// Cloudflare Turnstile. Shows nothing at all until a site key is set.
export default function Captcha({ onToken, resetSignal = 0 }) {
  const box = useRef(null);
  const widget = useRef(null);

  useEffect(() => {
    if (!KEY) return;
    let cancelled = false;

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
        callback: (token) => onToken(token),
        "expired-callback": () => onToken(""),
        "error-callback": () => onToken(""),
      });
    }

    if (window.turnstile) {
      draw();
    } else {
      let s = document.querySelector("script[data-turnstile]");
      if (!s) {
        s = document.createElement("script");
        s.src =
          "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        s.async = true;
        s.defer = true;
        s.dataset.turnstile = "1";
        document.head.appendChild(s);
      }
      s.addEventListener("load", draw);
    }

    return () => {
      cancelled = true;
      if (widget.current !== null && window.turnstile) {
        try {
          window.turnstile.remove(widget.current);
        } catch {}
        widget.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (widget.current !== null && window.turnstile) {
      try {
        window.turnstile.reset(widget.current);
      } catch {}
    }
  }, [resetSignal]);

  if (!KEY) return null;
  return <div ref={box} className="min-h-[65px]" />;
}
