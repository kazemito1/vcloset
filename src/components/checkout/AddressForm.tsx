"use client";

import type { ShippingAddress } from "@/types";
import { formatCpf } from "@/lib/cpf";

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

export function AddressForm({
  value,
  onChange,
  customerName,
  customerEmail,
  customerPhone,
  customerCpf,
  onCustomerChange,
}: AddressFormProps) {
  function update(field: keyof ShippingAddress, val: string) {
    onChange({ ...value, [field]: val });
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
          <input
            className={`${inputClass} sm:col-span-2`}
            placeholder="CEP"
            value={value.zipCode}
            onChange={(e) => update("zipCode", e.target.value)}
          />
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
