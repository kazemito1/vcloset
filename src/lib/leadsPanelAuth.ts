// Autenticação do painel de leads independente (/painel).
// Usa as credenciais PANEL_EMAIL + PANEL_PASSWORD e um cookie assinado
// separado do admin principal (mesmo mecanismo HMAC de src/lib/adminAuth.ts).

import { NextRequest } from "next/server";
import { getSessionFromToken } from "@/lib/adminAuth";

export const PANEL_COOKIE_NAME = "vcloset_leads_panel";
const SESSION_MAX_AGE = 8 * 60 * 60; // 8 horas (em segundos, para o cookie)

export function panelConfigured(): boolean {
  return Boolean(
    (process.env.PANEL_EMAIL || "").trim() &&
      (process.env.PANEL_PASSWORD || "").trim()
  );
}

export function checkPanelCredentials(email: string, password: string): boolean {
  const expectedEmail = (process.env.PANEL_EMAIL || "").trim().toLowerCase();
  const expectedPassword = (process.env.PANEL_PASSWORD || "").trim();
  return email === expectedEmail && password === expectedPassword;
}

export async function getPanelSession(
  req: NextRequest
): Promise<{ exp: number; name: string } | null> {
  const token = req.cookies.get(PANEL_COOKIE_NAME)?.value;
  const session = await getSessionFromToken(token);
  if (!session) return null;
  return { exp: session.exp, name: session.name };
}

export const PANEL_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE,
};
