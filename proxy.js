import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PROTECTED = ["/student", "/admin", "/api", "/certificate"];

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
  h.set("X-Content-Type-Options", "nosniff");
  h.set("X-Frame-Options", "SAMEORIGIN");
  h.set("Referrer-Policy", "strict-origin-when-cross-origin");
  h.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()",
  );

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2)$).*)",
  ],
};
