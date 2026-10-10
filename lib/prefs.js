"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { ALL as D } from "./tr-all";

export const LANGS = { en: "English", am: "አማርኛ", om: "Afaan Oromoo" };

const Ctx = createContext(null);
export const usePrefs = () => useContext(Ctx);

export function Providers({ children }) {
  const [lang, setLang] = useState("en");
  const [dark, setDark] = useState(true);

  useEffect(() => {
    try {
      const l = localStorage.getItem("lang");
      if (l && D[l]) setLang(l);
      const th = localStorage.getItem("theme");
      setDark(th !== "light");
    } catch {}
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.lang = lang;
  }, [dark, lang]);

  const pick = (l) => {
    setLang(l);
    try {
      localStorage.setItem("lang", l);
    } catch {}
  };
  const flip = () => {
    setDark(!dark);
    try {
      localStorage.setItem("theme", !dark ? "dark" : "light");
    } catch {}
  };
  const t = (k) => D[lang][k] ?? D.en[k] ?? k;

  return (
    <Ctx.Provider value={{ t, lang, pick, dark, flip }}>
      {children}
    </Ctx.Provider>
  );
}
