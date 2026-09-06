import { NextResponse } from "next/server";
import { CUSTOMER_COOKIE_NAME } from "@/lib/customerAuth";

export const dynamic = "force-dynamic";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(CUSTOMER_COOKIE_NAME, "", { path: "/", maxAge: 0 });
  return res;
}
