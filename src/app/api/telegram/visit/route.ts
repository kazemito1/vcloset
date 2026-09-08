import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyNewVisit } from "@/lib/telegram";

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

    // Deduplicação por IP: o mesmo visitante notifica "novo lead" apenas
    // uma vez, independente de quantas vezes reabrir o site.
    const ip = normalizeIp(
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || ""
    );

    if (ip) {
      try {
        await prisma.notifiedVisit.create({ data: { ip } });
      } catch {
        // IP já notificado (unique) — visita de lead conhecido, ignora.
        return NextResponse.json({ ok: true });
      }
    } else if (body.first !== true) {
      // Sem IP identificável: só notifica se for o primeiro load da sessão.
      return NextResponse.json({ ok: true });
    }

    await notifyNewVisit({
      ip: ip || "desconhecido",
      path: typeof body.path === "string" ? body.path : "/",
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
