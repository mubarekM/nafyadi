import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PROTECTED = ["/student", "/admin", "/api", "/certificate"];
const isDev = process.env.NODE_ENV !== "production";

// false = test mode: only reports problems in the browser console, blocks nothing
// true  = enforce: blocks everything that is not on the list below
const ENFORCE_CSP = true;

const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://challenges.cloudflare.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.supabase.co https://i.ytimg.com",
  "font-src 'self' data:",
  `connect-src 'self' https://*.supabase.co wss://*.supabase.co https://challenges.cloudflare.com${
    isDev ? " ws://localhost:* http://localhost:*" : ""
  }`,
  "frame-src https://www.youtube.com https://www.youtube-nocookie.com https://challenges.cloudflare.com",
  "media-src 'self' blob: https://*.supabase.co",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  // This rule is ignored (and only causes warnings) in test mode
  ...(ENFORCE_CSP && !isDev ? ["upgrade-insecure-requests"] : []),
].join("; ");

export async function proxy(request) {
  const path = request.nextUrl.pathname;
  let response = NextResponse.next({ request });

  // Keep students and the teacher logged in (only where a login is needed)
  if (PROTECTED.some((p) => path === p || path.startsWith(p + "/"))) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet, headers) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value),
            );
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            );
            if (headers) {
              Object.entries(headers).forEach(([key, value]) =>
                response.headers.set(key, value),
              );
            }
          },
        },
      },
    );
    try {
      if (typeof supabase.auth.getClaims === "function") {
        await supabase.auth.getClaims();
      } else {
        await supabase.auth.getUser();
      }
    } catch {
      // If Supabase is slow, let the page load anyway
    }
  }

  // Security headers for every page
  const h = response.headers;
  h.set(
    ENFORCE_CSP
      ? "Content-Security-Policy"
      : "Content-Security-Policy-Report-Only",
    CSP,
  );
  h.set("X-Content-Type-Options", "nosniff");
  h.set("X-Frame-Options", "SAMEORIGIN");
  h.set("Referrer-Policy", "strict-origin-when-cross-origin");
  h.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()",
  );
  if (!isDev) h.set("Strict-Transport-Security", "max-age=31536000");

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2)$).*)",
  ],
};
