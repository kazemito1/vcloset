import { NextResponse } from "next/server";
import { notifyCheckoutEntry } from "@/lib/telegram";

export const dynamic = "force-dynamic";

// Normaliza o IP do header: remove porta/zone-id quando presentes.
function normalizeIp(raw: string): string {
  let ip = raw.trim();
  const percent = ip.indexOf("%");
  if (percent !== -1) ip = ip.slice(0, percent);
  if ((ip.match(/:/g) ?? []).length === 1) {
    // IPv4 com porta (não confundir com IPv6, que tem múltiplos ":")
    ip = ip.split(":")[0];
  }
  return ip;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const ip = normalizeIp(
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || ""
    );

    await notifyCheckoutEntry({
      ip: ip || "desconhecido",
      path: typeof body.path === "string" ? body.path : "/checkout",
      referer: typeof body.referer === "string" ? body.referer : "",
      userAgent: typeof body.userAgent === "string" ? body.userAgent : "",
      lang: typeof body.lang === "string" ? body.lang : "",
      timezone: typeof body.timezone === "string" ? body.timezone : "",
      screen: typeof body.screen === "string" ? body.screen : "",
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
