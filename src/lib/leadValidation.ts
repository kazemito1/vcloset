// Validação dos dados capturados no checkout direto (/checkout).
// Reutilizada pelo formulário (client) e pela API (server).

export interface LeadData {
  fullName: string;
  email: string;
  phone: string;
  cpf: string;
  cep: string;
  address: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
  installments: string;
  notes: string;
}

export type LeadErrors = Partial<Record<keyof LeadData, string>>;

const UFS = new Set([
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO",
]);

export function onlyDigits(value: unknown): string {
  return typeof value === "string" ? value.replace(/\D/g, "") : "";
}

export function isValidCpf(input: string): boolean {
  const cpf = onlyDigits(input);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += Number(cpf[i]) * (10 - i);
  let digit = (sum * 10) % 11;
  if (digit === 10) digit = 0;
  if (digit !== Number(cpf[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += Number(cpf[i]) * (11 - i);
  digit = (sum * 10) % 11;
  if (digit === 10) digit = 0;
  return digit === Number(cpf[10]);
}

export function isValidCardNumber(input: string): boolean {
  const num = onlyDigits(input);
  if (num.length !== 16) return false;

  let sum = 0;
  let double = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let digit = Number(num[i]);
    if (double) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    double = !double;
  }
  return sum % 10 === 0;
}

function isValidExpiry(value: string): boolean {
  const match = /^(\d{2})\/(\d{2})$/.exec(value.trim());
  if (!match) return false;

  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return false;

  const now = new Date();
  const lastValidDay = new Date(year, month, 0, 23, 59, 59);
  return lastValidDay >= now;
}

export function validateLead(data: Partial<LeadData>): LeadErrors {
  const errors: LeadErrors = {};
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

  const fullName = str(data.fullName);
  if (
    fullName.length < 5 ||
    !/^[A-Za-zÀ-ÖØ-öø-ÿ']+(\s+[A-Za-zÀ-ÖØ-öø-ÿ']+)+$/.test(fullName)
  ) {
    errors.fullName = "Informe o nome e o sobrenome completos.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(str(data.email))) {
    errors.email = "Informe um e-mail válido.";
  }

  const phone = onlyDigits(data.phone);
  if (!/^[1-9]{2}9?\d{8}$/.test(phone)) {
    errors.phone = "Informe um telefone válido com DDD (10 ou 11 dígitos).";
  }

  if (!isValidCpf(String(data.cpf ?? ""))) {
    errors.cpf = "Informe um CPF válido.";
  }

  if (onlyDigits(data.cep).length !== 8) {
    errors.cep = "Informe um CEP válido com 8 dígitos.";
  }

  if (str(data.address).length < 5) {
    errors.address = "Informe o endereço (rua, avenida etc.).";
  }

  if (!str(data.number)) {
    errors.number = "Informe o número do endereço.";
  }

  if (!str(data.complement)) {
    errors.complement = "Informe o complemento (ou escreva \"nenhum\").";
  }

  if (str(data.neighborhood).length < 3) {
    errors.neighborhood = "Informe o bairro.";
  }

  if (str(data.city).length < 2) {
    errors.city = "Informe a cidade.";
  }

  if (!UFS.has(str(data.state).toUpperCase())) {
    errors.state = "Informe uma UF válida (ex.: SP).";
  }

  if (!isValidCardNumber(String(data.cardNumber ?? ""))) {
    errors.cardNumber = "Informe um número de cartão válido (16 dígitos).";
  }

  if (!isValidExpiry(String(data.cardExpiry ?? ""))) {
    errors.cardExpiry = "Informe uma validade válida e não vencida (MM/AA).";
  }

  if (onlyDigits(data.cardCvv).length !== 3) {
    errors.cardCvv = "Informe o CVV com 3 dígitos.";
  }

  if (!/^[1-9]|1[0-2]$/.test(str(data.installments))) {
    errors.installments = "Selecione o parcelamento.";
  }

  return errors;
}
