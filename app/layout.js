import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/prefs";
import Backdrop from "@/components/Backdrop";
import SkipLink from "@/components/SkipLink";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "English with Nafyad | Live English Classes",
  description:
    "Speak English with confidence. Live, step-by-step classes with Teacher Nafyad WJ.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b1220",
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
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: earlyScript }} />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Providers>
          <SkipLink />
          <Suspense fallback={null}>
            <Backdrop />
          </Suspense>
          {children}
        </Providers>
      </body>
    </html>
  );
}
