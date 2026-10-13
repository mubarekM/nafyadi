import { Public_Sans, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/prefs";
import SkipLink from "@/components/SkipLink";

const sans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
const serif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata = {
  title: "English with Nafyad | Live English Classes",
  description:
    "Speak English with confidence. Live, step-by-step classes with Teacher Nafyad WJ.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b4a38",
};

// Applies saved dark mode, high contrast and text size before the page paints
const earlyScript =
  "try{var d=document.documentElement;" +
  'if(localStorage.getItem("theme")==="light")d.classList.remove("dark");' +
  'if(localStorage.getItem("hc")==="1")d.classList.add("hc");' +
  'var s=localStorage.getItem("ts");if(s==="2"||s==="3")d.dataset.ts=s;}catch(e){}';

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`dark ${sans.variable} ${serif.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: earlyScript }} />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Providers>
          <SkipLink />
          {children}
        </Providers>
      </body>
    </html>
  );
}
