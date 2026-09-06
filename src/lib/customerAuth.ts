// Sessão do cliente final (conta de compra), distinta da sessão admin.
// Usa o mesmo mecanismo HMAC de src/lib/adminAuth.ts, porém com cookie próprio.
// O payload guarda o id do Customer em adminUserId (campo reaproveitado do token).

import { NextRequest } from "next/server";
import { getSessionFromToken } from "@/lib/adminAuth";

export const CUSTOMER_COOKIE_NAME = "vcloset_customer_session";
const SESSION_MAX_AGE = 30 * 24 * 60 * 60; // 30 dias (em segundos)

export interface CustomerSession {
  customerId: string;
  name: string;
}

export async function getCustomerSession(
  req: NextRequest
): Promise<CustomerSession | null> {
  const token = req.cookies.get(CUSTOMER_COOKIE_NAME)?.value;
  const session = await getSessionFromToken(token);
  if (!session || !session.adminUserId) return null;
  return { customerId: session.adminUserId, name: session.name };
}

export const CUSTOMER_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE,
};
