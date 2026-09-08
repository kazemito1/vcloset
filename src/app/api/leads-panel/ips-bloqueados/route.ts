import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPanelSession } from "@/lib/leadsPanelAuth";

export const dynamic = "force-dynamic";

// Blocklist manual de IPs: o lojista bloqueia IPs suspeitos no painel e
// qualquer nova tentativa de pedido vinda deles é recusada no checkout.

// Normaliza o IP: trim e remove porta/zone-id quando presentes
// (ex.: "179.x.x.x:52314" ou "fe80::1%eth0").
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

function isValidIp(ip: string): boolean {
  return (
    /^(\d{1,3}\.){3}\d{1,3}$/.test(ip) || // IPv4
    /^[0-9a-fA-F:]+$/.test(ip) && ip.includes(":") // IPv6
  );
}

export async function GET(req: NextRequest) {
  const session = await getPanelSession(req);
  if (!session) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const ips = await prisma.blockedIp.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ ips });
}

export async function POST(req: NextRequest) {
  const session = await getPanelSession(req);
  if (!session) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const ip = normalizeIp(String(body?.ip ?? ""));
  if (!isValidIp(ip)) {
    return NextResponse.json(
      { error: "IP inválido." },
      { status: 400 }
    );
  }

  const blocked = await prisma.blockedIp.upsert({
    where: { ip },
    create: { ip },
    update: {},
  });
  return NextResponse.json({ ok: true, ip: blocked });
}

export async function DELETE(req: NextRequest) {
  const session = await getPanelSession(req);
  if (!session) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const ip = normalizeIp(searchParams.get("ip") ?? "");
  if (!ip) {
    return NextResponse.json({ error: "Parâmetro inválido." }, { status: 400 });
  }

  try {
    await prisma.blockedIp.delete({ where: { ip } });
  } catch {
    // já removido — tratamos como sucesso
  }
  return NextResponse.json({ ok: true });
}
