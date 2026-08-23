"use client";

import { useState } from "react";
import type { ShippingAddress } from "@/types";
import { formatCpf, onlyDigits } from "@/lib/cpf";

interface AddressFormProps {
  value: ShippingAddress;
  onChange: (value: ShippingAddress) => void;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCpf: string;
  onCustomerChange: (
    field: "customerName" | "customerEmail" | "customerPhone" | "customerCpf",
    value: string
  ) => void;
}

const inputClass =
  "w-full border border-gold-400/40 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink/40 focus:border-gold-400 focus:outline-none";

function formatCep(digits: string): string {
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function AddressForm({
  value,
  onChange,
  customerName,
  customerEmail,
  customerPhone,
  customerCpf,
  onCustomerChange,
}: AddressFormProps) {
  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState<string | null>(null);

  function update(field: keyof ShippingAddress, val: string) {
    onChange({ ...value, [field]: val });
  }

  async function handleCepChange(rawValue: string) {
    const digits = onlyDigits(rawValue).slice(0, 8);
    const formatted = formatCep(digits);
    update("zipCode", formatted);
    setCepError(null);

    if (digits.length !== 8) return;

    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();

      if (data.erro) {
        setCepError("CEP não encontrado.");
        return;
      }

      onChange({
        ...value,
        zipCode: formatted,
        street: data.logradouro || value.street,
        neighborhood: data.bairro || value.neighborhood,
        city: data.localidade || value.city,
        state: data.uf || value.state,
      });
    } catch {
      setCepError("Não foi possível buscar o CEP. Preencha o endereço manualmente.");
    } finally {
      setCepLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-xl text-ink">Dados pessoais</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <input
            className={inputClass}
            placeholder="Nome completo"
            value={customerName}
            onChange={(e) => onCustomerChange("customerName", e.target.value)}
          />
          <input
            className={inputClass}
            placeholder="E-mail"
            type="email"
            value={customerEmail}
            onChange={(e) => onCustomerChange("customerEmail", e.target.value)}
          />
          <input
            className={inputClass}
            placeholder="CPF"
            value={customerCpf}
            maxLength={14}
            onChange={(e) => onCustomerChange("customerCpf", formatCpf(e.target.value))}
          />
          <input
            className={inputClass}
            placeholder="Telefone (com DDD)"
            value={customerPhone}
            onChange={(e) => onCustomerChange("customerPhone", e.target.value)}
          />
        </div>
      </div>

      <div>
        <h2 className="font-serif text-xl text-ink">Endereço de entrega</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-6">
          <div className="sm:col-span-2">
            <input
              className={inputClass}
              placeholder="CEP"
              inputMode="numeric"
              value={value.zipCode}
              maxLength={9}
              onChange={(e) => handleCepChange(e.target.value)}
            />
            {cepLoading && (
              <p className="mt-1 text-xs text-ink/50">Buscando CEP...</p>
            )}
            {cepError && (
              <p className="mt-1 text-xs text-red-600">{cepError}</p>
            )}
          </div>
          <input
            className={`${inputClass} sm:col-span-4`}
            placeholder="Rua"
            value={value.street}
            onChange={(e) => update("street", e.target.value)}
          />
          <input
            className={`${inputClass} sm:col-span-2`}
            placeholder="Número"
            value={value.number}
            onChange={(e) => update("number", e.target.value)}
          />
          <input
            className={`${inputClass} sm:col-span-4`}
            placeholder="Complemento (opcional)"
            value={value.complement || ""}
            onChange={(e) => update("complement", e.target.value)}
          />
          <input
            className={`${inputClass} sm:col-span-3`}
            placeholder="Bairro"
            value={value.neighborhood}
            onChange={(e) => update("neighborhood", e.target.value)}
          />
          <input
            className={`${inputClass} sm:col-span-2`}
            placeholder="Cidade"
            value={value.city}
            onChange={(e) => update("city", e.target.value)}
          />
          <input
            className={`${inputClass} sm:col-span-1`}
            placeholder="UF"
            maxLength={2}
            value={value.state}
            onChange={(e) => update("state", e.target.value.toUpperCase())}
          />
        </div>
      </div>
    </div>
  );
}
