import { NextRequest, NextResponse } from "next/server";
import { resolveAppliedCode } from "@/lib/coupons";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const code = typeof body.code === "string" ? body.code : "";
  const subtotalCents = typeof body.subtotalCents === "number" ? body.subtotalCents : 0;

  if (!code.trim()) {
    return NextResponse.json({ valid: false, error: "Informe um código" }, { status: 400 });
  }

  const result = await resolveAppliedCode(code, subtotalCents);

  if (!result.valid) {
    return NextResponse.json({ valid: false, error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    valid: true,
    code: result.code,
    kind: result.kind,
    discountCents: result.discountCents,
  });
}
