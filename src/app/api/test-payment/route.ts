import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();
  const { cardNumber, cardName, expiry, cvc } = body;

  // Extrai apenas informações seguras
  const cleanNumber = cardNumber.replace(/\s/g, '');
  const last4 = cleanNumber.slice(-4);
  const brand = detectBrand(cleanNumber);

  // Simula aprovação e retorna dados não sensíveis
  return NextResponse.json({
    success: true,
    message: `✅ Pagamento aprovado! Cartão ${brand} final ${last4}`,
    transactionId: 'TXN-' + Date.now(),
    timestamp: new Date().toISOString(),
    brand,
    last4,
  });
}

function detectBrand(num: string): string {
  const first = num.charAt(0);
  const brands: Record<string, string> = {
    '1': 'Airline',
    '2': 'Financeiro',
    '3': 'Amex',
    '4': 'Visa',
    '5': 'Mastercard',
    '6': 'Discover',
    '7': 'Petroleum',
    '8': 'Saúde/Telecom',
    '9': 'Governo',
    '0': 'ISO',
  };
  return brands[first] || 'Desconhecida';
}