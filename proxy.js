import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Keeps every student and teacher logged in: refreshes expired login tokens
// and saves the new ones before the page loads.
export async function proxy(request) {
  let response = NextResponse.next({ request });

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

  return response;
}

export const config = {
  matcher: [
    "/student/:path*",
    "/admin/:path*",
    "/api/:path*",
    "/certificate/:path*",
  ],
};
