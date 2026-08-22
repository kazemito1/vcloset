import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, getSessionFromToken } from "@/lib/adminAuth";

// Rotas (página + API) restritas a SUPER_ADMIN. Usuários OPERADOR recebem
// 403 ao tentar acessá-las (via API) ou são redirecionados (via página).
const SUPER_ADMIN_ONLY_PREFIXES = [
  "/admin/usuarios",
  "/admin/financeiro",
  "/admin/configuracoes",
  "/admin/creditos",
  "/api/admin/usuarios",
  "/api/admin/financeiro",
  "/api/admin/configuracoes",
  "/api/admin/creditos",
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isLoginPage = pathname === "/admin/login";
  const isLoginApi = pathname === "/api/admin/login";
  const isProtectedPage = pathname.startsWith("/admin") && !isLoginPage;
  const isProtectedApi = pathname.startsWith("/api/admin") && !isLoginApi;

  if (!isProtectedPage && !isProtectedApi) {
    return NextResponse.next();
  }

  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const session = await getSessionFromToken(token);

  if (!session) {
    if (isProtectedApi) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
    const loginUrl = new URL("/admin/login", req.url);
    return NextResponse.redirect(loginUrl);
  }

  const isSuperAdminOnly = SUPER_ADMIN_ONLY_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  if (isSuperAdminOnly && session.role !== "SUPER_ADMIN") {
    if (isProtectedApi) {
      return NextResponse.json({ error: "Acesso restrito a administradores" }, { status: 403 });
    }
    const homeUrl = new URL("/admin", req.url);
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
