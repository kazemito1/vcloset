"use client";

import { useEffect, useState } from "react";

interface PixPaymentProps {
  orderId: string;
  onPaid: () => void;
}

export function PixPayment({ orderId, onPaid }: PixPaymentProps) {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrCodeBase64, setQrCodeBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function createPix() {
      try {
        const res = await fetch("/api/payments/mercadopago/create-pix", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId }),
        });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Erro ao gerar PIX");

        setQrCode(data.qrCode);
        setQrCodeBase64(data.qrCodeBase64);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro inesperado");
      } finally {
        setLoading(false);
      }
    }

    createPix();
  }, [orderId]);

  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch(`/api/orders/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.status === "PAID") {
          clearInterval(interval);
          onPaid();
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [orderId, onPaid]);

  function copyCode() {
    if (!qrCode) return;
    navigator.clipboard.writeText(qrCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return <p className="text-ink/60">Gerando código PIX...</p>;
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  return (
    <div className="space-y-4 text-center">
      <p className="text-ink/70">
        Escaneie o QR Code abaixo com o app do seu banco ou use o código copia-e-cola.
      </p>

      {qrCodeBase64 && (
        <img
          src={`data:image/png;base64,${qrCodeBase64}`}
          alt="QR Code PIX"
          className="mx-auto h-56 w-56 border border-gold-400/30"
        />
      )}

      {qrCode && (
        <div>
          <textarea
            readOnly
            value={qrCode}
            className="w-full resize-none border border-gold-400/40 bg-white p-3 text-xs text-ink/70"
            rows={3}
          />
          <button onClick={copyCode} className="btn-gold-outline mt-2 w-full">
            {copied ? "Código copiado ✓" : "Copiar código PIX"}
          </button>
        </div>
      )}

      <p className="text-xs text-ink/50">
        Aguardando confirmação do pagamento... esta página atualiza automaticamente.
      </p>
    </div>
  );
}
