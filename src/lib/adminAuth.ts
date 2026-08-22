// Autenticação simples do painel admin: cookie assinado (HMAC-SHA256) via Web Crypto API.
// Funciona tanto em rotas Node quanto no middleware (Edge Runtime).
//
// A sessão carrega também identidade (adminUserId/name) e nível de acesso (role),
// para suportar múltiplos usuários admin com privilégios diferentes (RBAC).
// Compatibilidade: login via ADMIN_PASSWORD (senha única) sempre gera role SUPER_ADMIN,
// preservando o acesso total que já existia antes da tabela AdminUser.

export const ADMIN_COOKIE_NAME = "vcloset_admin_session";
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000; // 8 horas

export type AdminRole = "SUPER_ADMIN" | "OPERADOR";

export interface SessionPayload {
  exp: number;
  adminUserId: string | null;
  name: string;
  role: AdminRole;
}

function getSecret(): string {
  return process.env.ADMIN_SECRET || "vcloset-dev-secret-change-me";
}

const encoder = new TextEncoder();

function bytesToBase64url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  const base64 = btoa(binary);
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlToBytes(str: string): Uint8Array {
  const normalized = str.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function getKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function createSessionToken(
  identity: { adminUserId: string | null; name: string; role: AdminRole }
): Promise<string> {
  const payload: SessionPayload = {
    exp: Date.now() + SESSION_DURATION_MS,
    adminUserId: identity.adminUserId,
    name: identity.name,
    role: identity.role,
  };
  const payloadB64 = bytesToBase64url(encoder.encode(JSON.stringify(payload)));
  const key = await getKey();
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payloadB64));
  const sigB64 = bytesToBase64url(new Uint8Array(signature));
  return `${payloadB64}.${sigB64}`;
}

// Decodifica e valida o token, retornando o payload completo (identidade + role)
// ou null se inválido/expirado. Usado tanto pelo middleware (Edge) quanto pelas
// API routes/páginas que precisam checar o nível de acesso (RBAC).
export async function getSessionFromToken(
  token: string | undefined | null
): Promise<SessionPayload | null> {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payloadB64, sigB64] = parts;

  try {
    const key = await getKey();
    const signatureBytes = base64urlToBytes(sigB64);
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes as BufferSource,
      encoder.encode(payloadB64)
    );
    if (!valid) return null;

    const payload = JSON.parse(
      new TextDecoder().decode(base64urlToBytes(payloadB64))
    ) as Partial<SessionPayload>;

    if (typeof payload.exp !== "number" || payload.exp < Date.now()) return null;
    if (typeof payload.name !== "string") return null;

    // Compatibilidade: tokens antigos (antes do RBAC) não têm role/name/adminUserId.
    // Trata como SUPER_ADMIN para não derrubar sessões já ativas na migração.
    const role: AdminRole = payload.role === "OPERADOR" ? "OPERADOR" : "SUPER_ADMIN";

    return {
      exp: payload.exp,
      adminUserId: payload.adminUserId ?? null,
      name: payload.name,
      role,
    };
  } catch {
    return null;
  }
}

export async function verifySessionToken(token: string | undefined | null): Promise<boolean> {
  const session = await getSessionFromToken(token);
  return session !== null;
}

// Helper para uso em Server Components / API routes (Node runtime): lê o cookie
// da sessão atual a partir do header Cookie de uma requisição, ou de um valor já extraído.
export async function getSessionAdmin(
  cookieValue: string | undefined | null
): Promise<SessionPayload | null> {
  return getSessionFromToken(cookieValue);
}
