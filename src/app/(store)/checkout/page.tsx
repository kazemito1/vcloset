"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { formatBRL } from "@/lib/format";
import { AddressForm } from "@/components/checkout/AddressForm";
import { StripeCardForm } from "@/components/checkout/StripeCardForm";
import { PixPayment } from "@/components/checkout/PixPayment";
import { CouponBox } from "@/components/checkout/CouponBox";
import { isValidCpf, onlyDigits } from "@/lib/cpf";
import type { PaymentMethodType, ShippingAddress } from "@/types";

const emptyAddress: ShippingAddress = {
  street: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
  zipCode: "",
};

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const totalCents = useCartStore((s) => s.totalCents());
  const discountCents = useCartStore((s) => s.discountCents());
  const finalTotalCents = useCartStore((s) => s.finalTotalCents());
  const appliedCode = useCartStore((s) => s.appliedCode);
  const clearCart = useCartStore((s) => s.clearCart);

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerCpf, setCustomerCpf] = useState("");
  const [address, setAddress] = useState<ShippingAddress>(emptyAddress);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>("CREDIT_CARD");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creditBalanceCents, setCreditBalanceCents] = useState<number | null>(null);
  const [useCredit, setUseCredit] = useState(false);
  const [checkingCredit, setCheckingCredit] = useState(false);

  function handleCustomerChange(
    field: "customerName" | "customerEmail" | "customerPhone" | "customerCpf",
    value: string
  ) {
    if (field === "customerName") setCustomerName(value);
    if (field === "customerEmail") setCustomerEmail(value);
    if (field === "customerPhone") setCustomerPhone(value);
    if (field === "customerCpf") setCustomerCpf(value);
  }

  function isAddressValid() {
    return (
      customerName.trim().split(/\s+/).filter(Boolean).length >= 2 &&
      customerEmail.trim() &&
      isValidCpf(customerCpf) &&
      onlyDigits(customerPhone).length >= 10 &&
      address.street.trim() &&
      address.number.trim() &&
      address.neighborhood.trim() &&
      address.city.trim() &&
      address.state.trim().length === 2 &&
      onlyDigits(address.zipCode).length === 8
    );
  }

  async function handleCreateOrder() {
    if (!isAddressValid() || items.length === 0) return;

    setCreating(true);
    setError(null);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerEmail,
          customerPhone: customerPhone || undefined,
          customerCpf,
          shippingAddress: address,
          paymentMethod,
          items: items.map((item) => ({
            productId: item.productId,
            productName: item.name,
            variantLabel: item.variantLabel,
            quantity: item.quantity,
            unitPriceCents: item.unitPriceCents,
          })),
          appliedCode: appliedCode?.code,
          useCredit: useCredit && !!creditBalanceCents,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Erro ao criar pedido");

      setOrderId(data.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setCreating(false);
    }
  }

  function handlePaymentSuccess() {
    clearCart();
    router.push(`/pedido/${orderId}/confirmacao`);
  }

  useEffect(() => {
    if (items.length === 0 && !orderId) {
      router.push("/carrinho");
    }
  }, [items.length, orderId, router]);

  // Consulta o saldo de crédito virtual do cliente assim que o e-mail for válido,
  // para exibir a opção de usar o crédito como desconto no checkout.
  useEffect(() => {
    if (!customerEmail.includes("@")) {
      setCreditBalanceCents(null);
      setUseCredit(false);
      return;
    }
    const timeout = setTimeout(() => {
      setCheckingCredit(true);
      fetch(`/api/creditos/saldo?email=${encodeURIComponent(customerEmail)}`)
        .then((res) => res.json())
        .then((data) => setCreditBalanceCents(data.balanceCents ?? 0))
        .catch(() => setCreditBalanceCents(null))
        .finally(() => setCheckingCredit(false));
    }, 500);
    return () => clearTimeout(timeout);
  }, [customerEmail]);

  if (items.length === 0 && !orderId) {
    return null;
  }

  return (
    <div className="container-page py-12 md:py-16">
      <h1 className="section-title text-left">Finalizar Compra</h1>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          {!orderId ? (
            <>
              <AddressForm
                value={address}
                onChange={setAddress}
                customerName={customerName}
                customerEmail={customerEmail}
                customerPhone={customerPhone}
                customerCpf={customerCpf}
                onCustomerChange={handleCustomerChange}
              />

              <div>
                <h2 className="font-serif text-xl text-ink">Forma de pagamento</h2>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <button
                    onClick={() => setPaymentMethod("CREDIT_CARD")}
                    className={`border px-4 py-4 text-left transition-colors ${
                      paymentMethod === "CREDIT_CARD"
                        ? "border-ink bg-ink text-gold-400"
                        : "border-gold-400/40 text-ink"
                    }`}
                  >
                    <span className="block font-serif text-lg">Cartão de Crédito</span>
                    <span className="block text-xs opacity-70">Em até 10x sem juros</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod("PIX")}
                    className={`border px-4 py-4 text-left transition-colors ${
                      paymentMethod === "PIX"
                        ? "border-ink bg-ink text-gold-400"
                        : "border-gold-400/40 text-ink"
                    }`}
                  >
                    <span className="block font-serif text-lg">PIX</span>
                    <span className="block text-xs opacity-70">5% de desconto à vista</span>
                  </button>
                </div>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                onClick={handleCreateOrder}
                disabled={!isAddressValid() || creating}
                className="btn-gold w-full disabled:opacity-50"
              >
                {creating ? "Criando pedido..." : "Continuar para pagamento"}
              </button>
            </>
          ) : paymentMethod === "CREDIT_CARD" ? (
            <div>
              <h2 className="font-serif text-xl text-ink mb-4">Pagamento com Cartão</h2>
              <StripeCardForm orderId={orderId} onSuccess={handlePaymentSuccess} />
            </div>
          ) : (
            <div>
              <h2 className="font-serif text-xl text-ink mb-4">Pagamento via PIX</h2>
              <PixPayment orderId={orderId} onPaid={handlePaymentSuccess} />
            </div>
          )}
        </div>

        <div className="border border-gold-400/30 p-6 h-fit">
          <h2 className="font-serif text-xl text-ink">Resumo do pedido</h2>
          <div className="mt-4 space-y-3">
            {items.map((item) => (
              <div key={`${item.productId}-${item.variantLabel}`} className="flex justify-between text-sm text-ink/70">
                <span>
                  {item.name} x{item.quantity}
                </span>
                <span>{formatBRL(item.unitPriceCents * item.quantity)}</span>
              </div>
            ))}
          </div>

          {!orderId && (
            <div className="mt-4">
              <CouponBox />
            </div>
          )}

          {!orderId && creditBalanceCents !== null && creditBalanceCents > 0 && (
            <div className="mt-4 rounded border border-gold-400/30 bg-gold-400/5 p-3">
              <label className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={useCredit}
                  onChange={(e) => setUseCredit(e.target.checked)}
                />
                Usar meu crédito de indicação ({formatBRL(creditBalanceCents)} disponível)
              </label>
            </div>
          )}
          {!orderId && checkingCredit && (
            <p className="mt-2 text-xs text-ink/40">Verificando crédito disponível...</p>
          )}

          <div className="mt-4 flex justify-between text-sm text-ink/70">
            <span>Subtotal</span>
            <span>{formatBRL(totalCents)}</span>
          </div>
          {discountCents > 0 && (
            <div className="mt-2 flex justify-between text-sm text-emerald-700">
              <span>Desconto</span>
              <span>-{formatBRL(discountCents)}</span>
            </div>
          )}
          {useCredit && creditBalanceCents !== null && creditBalanceCents > 0 && (
            <div className="mt-2 flex justify-between text-sm text-emerald-700">
              <span>Crédito de indicação</span>
              <span>-{formatBRL(Math.min(creditBalanceCents, finalTotalCents))}</span>
            </div>
          )}
          <div className="mt-4 flex justify-between border-t border-gold-400/20 pt-4 font-serif text-lg text-ink">
            <span>Total</span>
            <span>
              {formatBRL(
                useCredit && creditBalanceCents
                  ? Math.max(0, finalTotalCents - Math.min(creditBalanceCents, finalTotalCents))
                  : finalTotalCents
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
