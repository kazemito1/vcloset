import { NextResponse } from "next/server";
import { notifyNewVisit } from "@/lib/telegram";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    notifyNewVisit({
      path: typeof body.path === "string" ? body.path : "/",
      referer: typeof body.referer === "string" ? body.referer : "",
      userAgent: typeof body.userAgent === "string" ? body.userAgent : "",
      lang: typeof body.lang === "string" ? body.lang : "",
      timezone: typeof body.timezone === "string" ? body.timezone : "",
      screen: typeof body.screen === "string" ? body.screen : "",
      first: body.first === true,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
