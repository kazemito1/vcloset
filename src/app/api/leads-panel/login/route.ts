import { NextRequest, NextResponse } from "next/server";
import { createSessionToken } from "@/lib/adminAuth";
import {
  PANEL_COOKIE_NAME,
  PANEL_COOKIE_OPTIONS,
  checkPanelCredentials,
  panelConfigured,
} from "@/lib/leadsPanelAuth";

export const dynamic = "force-dynamic";

const MAX_ATTEMPTS = 10;
const WINDOW_MS = 10 * 60 * 1000;
const attempts = new Map<string, number[]>();

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const now = Date.now();
  const recent = (attempts.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_ATTEMPTS) {
    attempts.set(ip, recent);
    return NextResponse.json(
      { error: "Muitas tentativas. Aguarde alguns minutos e tente novamente." },
      { status: 429 }
    );
  }
  recent.push(now);
  attempts.set(ip, recent);

  if (!panelConfigured()) {
    return NextResponse.json(
      { error: "PANEL_EMAIL/PANEL_PASSWORD não configurados no servidor." },
      { status: 500 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password || !checkPanelCredentials(email, password)) {
    return NextResponse.json(
      { error: "E-mail ou senha inválidos." },
      { status: 401 }
    );
  }

  const token = await createSessionToken({
    adminUserId: null,
    name: "V-CLOSET Admin",
    role: "SUPER_ADMIN",
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(PANEL_COOKIE_NAME, token, PANEL_COOKIE_OPTIONS);
  return res;
}
