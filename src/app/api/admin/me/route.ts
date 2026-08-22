import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, getSessionFromToken } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const session = await getSessionFromToken(token);

  if (!session) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  return NextResponse.json({
    name: session.name,
    role: session.role,
    adminUserId: session.adminUserId,
  });
}
