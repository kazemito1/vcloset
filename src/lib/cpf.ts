// Validação de CPF (Cadastro de Pessoas Físicas) brasileiro.
// Implementa o algoritmo padrão de cálculo dos 2 dígitos verificadores,
// não apenas checagem de formato/máscara.

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function isValidCpf(rawValue: string): boolean {
  const cpf = onlyDigits(rawValue);

  if (cpf.length !== 11) return false;
  // Rejeita sequências com todos os dígitos iguais (ex: 00000000000, 11111111111)
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  const digits = cpf.split("").map(Number);

  function calcCheckDigit(base: number[], factorStart: number): number {
    const sum = base.reduce((acc, digit, idx) => acc + digit * (factorStart - idx), 0);
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  }

  const firstCheck = calcCheckDigit(digits.slice(0, 9), 10);
  if (firstCheck !== digits[9]) return false;

  const secondCheck = calcCheckDigit(digits.slice(0, 10), 11);
  if (secondCheck !== digits[10]) return false;

  return true;
}

export function formatCpf(rawValue: string): string {
  const cpf = onlyDigits(rawValue).slice(0, 11);
  return cpf
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}
