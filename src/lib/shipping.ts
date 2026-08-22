// Estimativa de frete e prazo de entrega baseada na região do CEP.
//
// ATENÇÃO: este projeto ainda não possui integração real com Correios ou
// transportadora. Os valores e prazos abaixo são uma ESTIMATIVA SIMPLES e
// FIXA, definida apenas pelo primeiro dígito do CEP (que indica a região
// postal no Brasil). O valor final de frete deve sempre ser confirmado no
// checkout, onde uma integração real pode futuramente substituir esta tabela.

export interface RegionShippingInfo {
  region: string;
  minDays: number;
  maxDays: number;
  priceCents: number;
}

// Tabela fixa por primeiro dígito do CEP (0-9), representando grandes regiões
// postais brasileiras. Loja considerada como base de despacho em São Paulo.
const REGION_TABLE: Record<string, RegionShippingInfo> = {
  "0": { region: "São Paulo (capital e região)", minDays: 1, maxDays: 2, priceCents: 1490 },
  "1": { region: "São Paulo (interior)", minDays: 2, maxDays: 3, priceCents: 1690 },
  "2": { region: "Sudeste (RJ/ES)", minDays: 3, maxDays: 5, priceCents: 1990 },
  "3": { region: "Sudeste (MG)", minDays: 3, maxDays: 5, priceCents: 1990 },
  "4": { region: "Nordeste (BA/SE)", minDays: 5, maxDays: 8, priceCents: 2990 },
  "5": { region: "Nordeste (PE/AL/PB/RN)", minDays: 5, maxDays: 8, priceCents: 2990 },
  "6": { region: "Norte / Nordeste", minDays: 6, maxDays: 10, priceCents: 3490 },
  "7": { region: "Centro-Oeste", minDays: 4, maxDays: 7, priceCents: 2790 },
  "8": { region: "Sul (PR/SC)", minDays: 3, maxDays: 5, priceCents: 2290 },
  "9": { region: "Sul (RS)", minDays: 4, maxDays: 6, priceCents: 2490 },
};

const DEFAULT_REGION = REGION_TABLE["0"];

/** Retorna true se a string tem o formato 00000-000 ou 00000000. */
export function isValidCepFormat(cep: string): boolean {
  return /^\d{5}-?\d{3}$/.test(cep.trim());
}

/** Aplica a máscara 00000-000 enquanto o usuário digita. */
export function maskCep(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

/** Retorna a estimativa fixa de frete/prazo para o CEP informado, com base no primeiro dígito. */
export function getShippingEstimateByCep(cep: string): RegionShippingInfo {
  const digits = cep.replace(/\D/g, "");
  const firstDigit = digits.charAt(0);
  return REGION_TABLE[firstDigit] ?? DEFAULT_REGION;
}
