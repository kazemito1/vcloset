// Rate limit simples em memória por chave (IP + rota). Em serverless cada
// instância tem seu próprio contador, mas já blinda contra abuso casual e
// scripts ingênuos sem precisar de Redis.

const buckets = new Map<string, { count: number; resetAt: number }>();

// Limpa buckets expirados de tempos em tempos para não crescer sem limite.
let lastSweep = Date.now();
const SWEEP_INTERVAL_MS = 10 * 60 * 1000;

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): { ok: boolean; retryAfterSec: number } {
  const now = Date.now();

  if (now - lastSweep > SWEEP_INTERVAL_MS) {
    for (const [k, b] of buckets) {
      if (b.resetAt <= now) buckets.delete(k);
    }
    lastSweep = now;
  }

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSec: 0 };
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return { ok: false, retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  return { ok: true, retryAfterSec: 0 };
}

// Extrai o IP do cliente dos headers padrão de proxy (Vercel/Cloudflare).
export function clientIpFromHeaders(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("cf-connecting-ip")?.trim() ||
    headers.get("x-real-ip")?.trim() ||
    "desconhecido"
  );
}

// Resposta padrão 429 com Retry-After.
export function tooManyRequests(retryAfterSec: number): Response {
  return Response.json(
    { error: "Muitas solicitações. Tente novamente em instantes." },
    { status: 429, headers: { "Retry-After": String(retryAfterSec) } }
  );
}
