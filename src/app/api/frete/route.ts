import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Estimativa de frete (PAC/SEDEX) por faixa de CEP, a partir da origem da loja
// (Rio de Janeiro, CEP 22640-102). Valores aproximados para referência do
// cliente no checkout — quando a integração real dos Correios entrar, este
// endpoint passa a consultar a API oficial mantendo o mesmo formato de resposta.

interface FreightOption {
  priceCents: number;
  prazoDias: number;
}

// Faixas de CEP por região de destino (dois primeiros dígitos)
const REGIOES: { faixas: [number, number]; pac: FreightOption; sedex: FreightOption; ufHint?: string }[] = [
  // Rio de Janeiro (local)
  { faixas: [20, 28], pac: { priceCents: 1990, prazoDias: 2 }, sedex: { priceCents: 3490, prazoDias: 1 } },
  // Espírito Santo / Minas Gerais
  { faixas: [29, 39], pac: { priceCents: 2990, prazoDias: 4 }, sedex: { priceCents: 4990, prazoDias: 2 } },
  // São Paulo
  { faixas: [1, 19], pac: { priceCents: 2790, prazoDias: 4 }, sedex: { priceCents: 4590, prazoDias: 2 } },
  // Sul (PR, SC, RS)
  { faixas: [80, 99], pac: { priceCents: 3990, prazoDias: 6 }, sedex: { priceCents: 6490, prazoDias: 3 } },
  // Centro-Oeste (GO, MT, MS, DF)
  { faixas: [70, 79], pac: { priceCents: 3990, prazoDias: 6 }, sedex: { priceCents: 6490, prazoDias: 3 } },
  // Nordeste (BA a PI, MA, PA...)
  { faixas: [40, 65], pac: { priceCents: 4490, prazoDias: 8 }, sedex: { priceCents: 7490, prazoDias: 4 } },
  // Norte (AM, AC, RR, AP, TO)
  { faixas: [66, 69], pac: { priceCents: 5490, prazoDias: 10 }, sedex: { priceCents: 8990, prazoDias: 5 } },
];

function consultar(cepDigits: string): { pac: FreightOption; sedex: FreightOption } | null {
  const prefixo = Number(cepDigits.slice(0, 2));
  if (Number.isNaN(prefixo)) return null;

  for (const regiao of REGIOES) {
    const [min, max] = regiao.faixas;
    if (prefixo >= min && prefixo <= max) {
      return { pac: regiao.pac, sedex: regiao.sedex };
    }
  }
  // Faixa desconhecida: usa a estimativa mais genérica (Nordeste)
  return {
    pac: { priceCents: 4490, prazoDias: 9 },
    sedex: { priceCents: 7490, prazoDias: 4 },
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cep = (searchParams.get("cep") ?? "").replace(/\D/g, "").slice(0, 8);

  if (cep.length !== 8) {
    return NextResponse.json({ error: "CEP inválido." }, { status: 400 });
  }

  const resultado = consultar(cep);
  if (!resultado) {
    return NextResponse.json({ error: "CEP não atendido." }, { status: 404 });
  }

  return NextResponse.json({
    cep,
    pac: resultado.pac,
    sedex: resultado.sedex,
  });
}
