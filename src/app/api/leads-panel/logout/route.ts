import { NextResponse } from "next/server";
import { PANEL_COOKIE_NAME } from "@/lib/leadsPanelAuth";

export const dynamic = "force-dynamic";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(PANEL_COOKIE_NAME, "", { path: "/", maxAge: 0 });
  return res;
}
