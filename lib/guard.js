// Refuses requests that come from a different website (extra protection for our API routes)
export function sameOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return true; // normal same-site requests and tools without an origin
  try {
    const host =
      request.headers.get("x-forwarded-host") || request.headers.get("host");
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function clientIp(request) {
  const fwd = request.headers.get("x-forwarded-for") || "";
  return (
    fwd.split(",")[0].trim() || request.headers.get("x-real-ip") || "0.0.0.0"
  );
}
