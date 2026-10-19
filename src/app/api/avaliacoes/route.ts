import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyNewReview } from "@/lib/telegram";
import { clientIpFromHeaders, rateLimit, tooManyRequests } from "@/lib/rateLimit";

// Avaliações públicas da loja. GET lista as aprovadas de um produto;
// POST cria uma nova avaliação que fica pendente até aprovação do lojista.
export async function GET(req: NextRequest) {
  const productId = req.nextUrl.searchParams.get("productId");
  if (!productId) {
    return NextResponse.json({ error: "productId é obrigatório" }, { status: 400 });
  }

  const reviews = await prisma.review.findMany({
    where: { productId, approved: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      rating: true,
      comment: true,
      createdAt: true,
    },
  });

  return NextResponse.json(reviews);
}

export async function POST(req: NextRequest) {
  // Máx. 3 avaliações por IP a cada 10 minutos (anti-spam).
  const rl = rateLimit(`avaliacoes:${clientIpFromHeaders(req.headers)}`, 3, 10 * 60 * 1000);
  if (!rl.ok) return tooManyRequests(rl.retryAfterSec);

  const body = await req.json().catch(() => ({}));

  const productId = typeof body.productId === "string" ? body.productId : "";
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const comment = typeof body.comment === "string" ? body.comment.trim() : "";
  const rating = typeof body.rating === "number" ? Math.trunc(body.rating) : NaN;

  if (!productId || !name || !comment || !(rating >= 1 && rating <= 5)) {
    return NextResponse.json(
      { error: "Nome, nota (1-5) e comentário são obrigatórios" },
      { status: 400 }
    );
  }

  if (name.length > 40 || comment.length > 500) {
    return NextResponse.json(
      { error: "Nome (máx. 40) ou comentário (máx. 500) muito longos" },
      { status: 400 }
    );
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
  }

  const review = await prisma.review.create({
    data: { productId, name, rating, comment },
  });

  // Aviso no Telegram sem bloquear/quebrar a resposta do POST.
  notifyNewReview({
    productName: product.name,
    name,
    rating,
    comment,
  }).catch(() => {});

  return NextResponse.json({ ok: true, id: review.id }, { status: 201 });
}
