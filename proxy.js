import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PROTECTED = ["/student", "/admin", "/api", "/certificate"];

// What the website is allowed to load. Includes Cloudflare Turnstile support.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://*.supabase.co https://i.ytimg.com",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://challenges.cloudflare.com",
  "frame-src https://www.youtube.com https://www.youtube-nocookie.com https://challenges.cloudflare.com",
  "media-src 'self' blob: https://*.supabase.co",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "upgrade-insecure-requests",
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
              Object.entries(headers).forEach(([key, value]) => {
                response.headers.set(key, value);
              });
            }
          },
        },
      },
    );

    await supabase.auth.getUser();
  }

  // Apply Content Security Policy headers
  response.headers.set("Content-Security-Policy", CSP);

  return response;
}
