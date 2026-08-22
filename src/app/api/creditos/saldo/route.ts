import { NextRequest, NextResponse } from "next/server";
import { getCreditBalance } from "@/lib/credits";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "E-mail inválido" }, { status: 400 });
  }

  const balanceCents = await getCreditBalance(email);
  return NextResponse.json({ balanceCents });
}
