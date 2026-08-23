"use client";

import { useState } from "react";

interface StripeCardFormProps {
  orderId: string;
  onSuccess: () => void;
}

function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function StripeCardForm({ onSuccess }: StripeCardFormProps) {
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleNumberChange(value: string) {
    const digits = onlyDigits(value).slice(0, 16);
    const groups = digits.match(/.{1,4}/g) || [];
    setCardNumber(groups.join(" "));
  }

  function handleExpiryChange(value: string) {
    const digits = onlyDigits(value).slice(0, 4);
    if (digits.length <= 2) {
      setCardExpiry(digits);
    } else {
      setCardExpiry(`${digits.slice(0, 2)}/${digits.slice(2)}`);
    }
  }

  function handleCvvChange(value: string) {
    setCardCvv(onlyDigits(value).slice(0, 4));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (cardName.trim().length < 3) {
      setError("Informe o nome impresso no cartão.");
      return;
    }
    if (onlyDigits(cardNumber).length !== 16) {
      setError("Informe os 16 dígitos do cartão.");
      return;
    }
    if (cardExpiry.length !== 5) {
      setError("Informe a validade no formato MM/AA.");
      return;
    }
    if (cardCvv.length < 3) {
      setError("Informe o CVV.");
      return;
    }

    onSuccess();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-3">
        <label className="block">
          <span className="mb-1 block text-sm text-ink/70">Nome impresso no cartão</span>
          <input
            type="text"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            placeholder="Como está no cartão"
            className="w-full border border-gold-400/40 bg-white px-4 py-3 text-ink outline-none focus:border-ink"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-ink/70">Número do cartão</span>
          <input
            type="text"
            inputMode="numeric"
            value={cardNumber}
            onChange={(e) => handleNumberChange(e.target.value)}
            placeholder="0000 0000 0000 0000"
            className="w-full border border-gold-400/40 bg-white px-4 py-3 text-ink outline-none focus:border-ink"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1 block text-sm text-ink/70">Validade</span>
            <input
              type="text"
              inputMode="numeric"
              value={cardExpiry}
              onChange={(e) => handleExpiryChange(e.target.value)}
              placeholder="MM/AA"
              className="w-full border border-gold-400/40 bg-white px-4 py-3 text-ink outline-none focus:border-ink"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm text-ink/70">CVV</span>
            <input
              type="text"
              inputMode="numeric"
              value={cardCvv}
              onChange={(e) => handleCvvChange(e.target.value)}
              placeholder="123"
              className="w-full border border-gold-400/40 bg-white px-4 py-3 text-ink outline-none focus:border-ink"
            />
          </label>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <p className="text-xs text-ink/50">
        Pagamento por confirmação: os dados do cartão não são processados nem armazenados.
        Seu pedido será confirmado pela loja.
      </p>

      <button type="submit" className="btn-gold w-full">
        Finalizar pedido
      </button>
    </form>
  );
}
