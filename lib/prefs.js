"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { ALL as D } from "./tr-all";

export const LANGS = { en: "English", am: "አማርኛ", om: "Afaan Oromoo" };

const Ctx = createContext(null);
export const usePrefs = () => useContext(Ctx);

export function Providers({ children }) {
  const [ready, setReady] = useState(false);
  const [lang, setLang] = useState("en");
  const [dark, setDark] = useState(true);
  const [ts, setTsState] = useState(1);
  const [hc, setHc] = useState(false);

  // Read saved choices once
  useEffect(() => {
    try {
      const l = localStorage.getItem("lang");
      if (l && D[l]) setLang(l);
      setDark(localStorage.getItem("theme") !== "light");
      const s = Number(localStorage.getItem("ts"));
      if ([1, 2, 3].includes(s)) setTsState(s);
      setHc(localStorage.getItem("hc") === "1");
    } catch {}
    setReady(true);
  }, []);

  // Apply them to the page
  useEffect(() => {
    if (!ready) return;
    const el = document.documentElement;
    el.classList.toggle("dark", dark);
    el.classList.toggle("hc", hc);
    el.lang = lang;
    if (ts > 1) el.dataset.ts = String(ts);
    else delete el.dataset.ts;
  }, [ready, dark, lang, ts, hc]);

  const save = (k, v) => {
    try {
      localStorage.setItem(k, v);
    } catch {}
  };
  const pick = (l) => {
    setLang(l);
    save("lang", l);
  };
  const flip = () => {
    setDark(!dark);
    save("theme", !dark ? "dark" : "light");
  };
  const setTs = (n) => {
    setTsState(n);
    save("ts", String(n));
  };
  const flipHc = () => {
    setHc(!hc);
    save("hc", !hc ? "1" : "0");
  };
  const t = (k) => D[lang][k] ?? D.en[k] ?? k;

  return (
    <Ctx.Provider value={{ t, lang, pick, dark, flip, ts, setTs, hc, flipHc }}>
      {children}
    </Ctx.Provider>
  );
}
