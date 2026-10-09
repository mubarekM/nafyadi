"use client";
import { createContext, useContext, useEffect, useState } from "react";

export const LANGS = { en: "English", am: "አማርኛ", om: "Afaan Oromoo" };

const D = {
  en: {
    about: "About",
    programs: "Programs",
    schedule: "Schedule",
    prices: "Prices",
    contact: "Contact",
    login: "Login",
    join: "Join now",
    badge: "Live English classes from home",
    h1a: "Speak English",
    h1b: "with confidence",
    sub: "Interactive, step-by-step live classes with Teacher Nafyad. Real-world communication, academic success and powerful presentations.",
    cta1: "Join as a Student",
    cta2: "Student Login",
    progT: "English for every age",
    kids: "Kids",
    kidsD: "Fun, friendly lessons that build a love for English.",
    teens: "Teens & Students",
    teensD: "Reach your school and exam goals with clear steps.",
    adults: "Adults & Professionals",
    adultsD: "Speak naturally at work, travel and everyday life.",
    schT: "Class Schedule",
    schD: "Times are shown in EST, PST, EAT and Ethiopian local time, so you can follow from anywhere.",
    live: "Live Classes",
    satsun: "Saturday & Sunday",
    tuethu: "Tue & Thu",
    group: "Group",
    prT: "Simple prices",
    pKids: "Kids group class",
    pAdults: "Adults group class",
    pOne: "One-on-one class",
    mo: "/ month",
    etb: "ETB",
    pNote: "Choose group or one-on-one.",
    aboutT: "Hi, I'm Nafyad WJ!",
    aboutD:
      "With 5 years of teaching experience, I help students and professionals speak English naturally and confidently through interactive, step-by-step live classes.",
    conT: "Questions? Talk to me",
    conD: "Message me on Telegram or call. I reply personally.",
    tg: "Telegram",
    call: "Call",
    foot: "All rights reserved.",
  },
  am: {
    about: "ስለ እኔ",
    programs: "ፕሮግራሞች",
    schedule: "የክፍል ሰዓት",
    prices: "ዋጋ",
    contact: "አድራሻ",
    login: "ግባ",
    join: "ተቀላቀል",
    badge: "ቀጥታ የእንግሊዝኛ ትምህርት ከቤት",
    h1a: "እንግሊዝኛን ተናገሩ",
    h1b: "በልበ ሙሉነት",
    sub: "ከመምህር ናፍያድ ጋር በቀጥታ፣ ደረጃ በደረጃ የሚሰጥ ትምህርት። በእውነተኛ ሕይወት መግባባት፣ በትምህርት ስኬት እና በጠንካራ አቀራረብ።",
    cta1: "ተማሪ ሆነው ይቀላቀሉ",
    cta2: "የተማሪ መግቢያ",
    progT: "ለእያንዳንዱ ዕድሜ እንግሊዝኛ",
    kids: "ልጆች",
    kidsD: "እንግሊዝኛን የሚያስወድዱ ተጫዋች ትምህርቶች።",
    teens: "ታዳጊዎች እና ተማሪዎች",
    teensD: "የትምህርት እና የፈተና ግቦችዎን በግልጽ ደረጃዎች ይድረሱ።",
    adults: "አዋቂዎች እና ባለሙያዎች",
    adultsD: "በሥራ፣ በጉዞ እና በዕለት ተዕለት ሕይወት በተፈጥሮ ይናገሩ።",
    schT: "የክፍል መርሐ ግብር",
    schD: "ሰዓታት በ EST፣ PST፣ EAT እና በኢትዮጵያ ሰዓት ተዘርዝረዋል፤ ከየትም ሆነው ይከታተሉ።",
    live: "ቀጥታ ክፍሎች",
    satsun: "ቅዳሜ እና እሑድ",
    tuethu: "ማክሰኞ እና ሐሙስ",
    group: "ቡድን",
    prT: "ቀላል ዋጋ",
    pKids: "የልጆች ቡድን ክፍል",
    pAdults: "የአዋቂዎች ቡድን ክፍል",
    pOne: "አንድ ለአንድ ክፍል",
    mo: "/ በወር",
    etb: "ብር",
    pNote: "በቡድን ወይም አንድ ለአንድ ይምረጡ።",
    aboutT: "ሰላም፣ እኔ ናፍያድ ነኝ!",
    aboutD:
      "የ5 ዓመት የማስተማር ልምድ አለኝ። ተማሪዎችን እና ባለሙያዎችን በቀጥታ እና ደረጃ በደረጃ በሚሰጡ ትምህርቶች እንግሊዝኛን በተፈጥሮ እና በልበ ሙሉነት እንዲናገሩ እረዳለሁ።",
    conT: "ጥያቄ አለዎት? ያነጋግሩኝ",
    conD: "በቴሌግራም ይጻፉልኝ ወይም ይደውሉ። እኔ ራሴ እመልሳለሁ።",
    tg: "ቴሌግራም",
    call: "ደውል",
    foot: "መብቱ በሕግ የተጠበቀ ነው።",
  },
  om: {
    about: "Waa'ee koo",
    programs: "Sagantaalee",
    schedule: "Sa'aatii",
    prices: "Gatii",
    contact: "Nu qunnamaa",
    login: "Seeni",
    join: "Itti makami",
    badge: "Barnoota Ingiliffaa kallattii manaa irraa",
    h1a: "Afaan Ingiliffaa dubbadhu",
    h1b: "of amanuun",
    sub: "Barsiisaa Nafyad waliin barnoota kallattii, tarkaanfii tarkaanfiidhaan. Wal-qunnamtii dhugaa, milkaa'ina barnootaa fi dhiyeessii cimaa.",
    cta1: "Barataa taatee itti makami",
    cta2: "Seensa Barattootaa",
    progT: "Afaan Ingiliffaa umrii hundaaf",
    kids: "Ijoollee",
    kidsD: "Barnoota gammachiisaa Ingiliffaa jaallachiisu.",
    teens: "Dargaggoota fi Barattoota",
    teensD: "Kaayyoo barnootaa fi qormaataa tarkaanfii ifa ta'een argadhu.",
    adults: "Ga'eessota fi Ogeeyyii",
    adultsD:
      "Hojii, imala fi jireenya guyyaa guyyaa keessatti uumamaan dubbadhu.",
    schT: "Sagantaa Sa'aatii",
    schD: "Sa'aatiin EST, PST, EAT fi sa'aatii Itoophiyaan kaa'ameera; iddoo jirtanuu irraa hordofi.",
    live: "Kutaalee Kallattii",
    satsun: "Sanbata fi Dilbata",
    tuethu: "Qibxata fi Kamisa",
    group: "Garee",
    prT: "Gatii salphaa",
    pKids: "Kutaa garee ijoollee",
    pAdults: "Kutaa garee ga'eessotaa",
    pOne: "Kutaa tokko-tokko",
    mo: "/ ji'aaf",
    etb: "Birrii",
    pNote: "Garee yookaan tokko-tokko filadhu.",
    aboutT: "Akkam, ani Nafyad WJ dha!",
    aboutD:
      "Muuxannoo barsiisuu waggaa 5 qaba. Barattootaa fi ogeeyyii barnoota kallattii tarkaanfii tarkaanfiidhaan uumamaan fi of amanuun Ingiliffaa akka dubbatan nan deeggara.",
    conT: "Gaaffii qabdaa? Na dubbisaa",
    conD: "Telegiraamiin naaf barreessaa yookaan bilbilaa. Ofiin deebisa.",
    tg: "Telegiraamii",
    call: "Bilbili",
    foot: "Mirgi seeraan eegameera.",
  },
};

const Ctx = createContext(null);
export const usePrefs = () => useContext(Ctx);

export function Providers({ children }) {
  const [lang, setLang] = useState("en");
  const [dark, setDark] = useState(false);

  useEffect(() => {
    try {
      const l = localStorage.getItem("lang");
      if (l && D[l]) setLang(l);
      const th = localStorage.getItem("theme");
      setDark(
        th ? th === "dark" : matchMedia("(prefers-color-scheme: dark)").matches,
      );
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
