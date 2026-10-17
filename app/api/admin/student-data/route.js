import { sameOrigin } from "@/lib/guard";
import { NextResponse } from "next/server";

export async function GET(req) {
  if (!sameOrigin(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json({ ok: true });
}
