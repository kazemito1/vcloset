"use client";

import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useMemo, useState } from "react";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

const cardElementOptions = {
  style: {
    base: {
      fontSize: "16px",
      color: "#0A0A0A",
      fontFamily: "'Inter', sans-serif",
      "::placeholder": { color: "#0A0A0A66" },
    },
    invalid: { color: "#B00020" },
  },
};

interface StripeCardFormProps {
  orderId: string;
  onSuccess: () => void;
}

function CardForm({ orderId, onSuccess }: StripeCardFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/payments/stripe/create-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao iniciar pagamento");
      }

      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error("Elemento do cartão não encontrado");

      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: { card: cardElement },
      });

      if (result.error) {
        setError(result.error.message || "Pagamento não autorizado");
      } else if (result.paymentIntent?.status === "succeeded") {
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border border-gold-400/40 bg-white px-4 py-4">
        <CardElement options={cardElementOptions} />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <p className="text-xs text-ink/50">
        Modo teste: use o cartão 4242 4242 4242 4242, validade futura qualquer e CVC qualquer.
      </p>

      <button type="submit" disabled={!stripe || loading} className="btn-gold w-full disabled:opacity-50">
        {loading ? "Processando..." : "Pagar com cartão"}
      </button>
    </form>
  );
}

export function StripeCardForm(props: StripeCardFormProps) {
  const options = useMemo(() => ({ locale: "pt-BR" as const }), []);
  return (
    <Elements stripe={stripePromise} options={options}>
      <CardForm {...props} />
    </Elements>
  );
}
