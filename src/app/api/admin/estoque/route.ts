import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Retorna todos os produtos com suas variantes
export async function GET() {
