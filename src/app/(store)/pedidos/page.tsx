"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface OrderItem {
  productName: string;
  quantity: number;
  unitPriceCents: number;
}

interface Order {
  id: string;
  fullName: string;
  createdAt: string;
  itemsJson: string;
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  installments: string;
  status: "AGUARDANDO_PAGAMENTO";
}

function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default function PedidosPage() {
  const [email, setEmail] = useState("");
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customer, setCustomer] = useState<{ name: string; email: string } | null>(null);

  // Se o cliente já estiver logado, mostra os pedidos direto, sem pedir e-mail
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/conta/eu", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        setCustomer(data.customer);
        setOrders(Array.isArray(data.orders) ? data.orders : []);
      } catch {
        // sem sessão — segue com o formulário de e-mail
      }
    })();
  }, []);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(
        `/api/pedidos?email=${encodeURIComponent(email.trim())}`
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro ao consultar os pedidos.");
        setOrders(null);
        return;
      }
      setOrders(Array.isArray(data.orders) ? data.orders : []);
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-ink py-16 text-cream">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <header className="text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.5em] text-cream/50">
            Acompanhamento
          </p>
          <h1 className="mt-2 font-serif text-4xl font-medium tracking-widest2">
            <span className="text-gold-400">M</span>EUS PEDIDOS
          </h1>
          {customer ? (
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-cream/60">
              Olá, {customer.name.split(" ")[0]}! Estes são os pedidos da sua
              conta ({customer.email}).{" "}
              <Link href="/conta" className="text-gold-400 underline-offset-4 hover:underline">
                Gerenciar conta
              </Link>
            </p>
          ) : (
            <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-cream/60">
              Informe o e-mail utilizado na compra para consultar o status do seu
              pedido.
            </p>
          )}
        </header>

        {!customer && (
          <form
            onSubmit={handleSearch}
            className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
          >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            className="flex-1 rounded border border-gold-400/20 bg-ink-soft px-4 py-3 text-sm text-cream outline-none transition focus:border-gold-400/60"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded bg-gold-400 px-6 py-3 text-xs font-bold uppercase tracking-widest2 text-ink transition hover:bg-gold-300 disabled:opacity-50"
          >
            {loading ? "Consultando…" : "Consultar"}
          </button>
          </form>
        )}

        {error && (
          <p className="mx-auto mt-6 max-w-md rounded border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-xs text-red-300">
            {error}
          </p>
        )}

        {orders !== null && !error && (
          <div className="mt-10">
            {orders.length === 0 ? (
              <p className="text-center text-sm text-cream/50">
                {customer
                  ? "Você ainda não fez nenhum pedido."
                  : "Nenhum pedido encontrado para este e-mail."}
              </p>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => {
                  let items: OrderItem[] = [];
                  try {
                    items = JSON.parse(order.itemsJson) as OrderItem[];
                  } catch {
                    items = [];
                  }

                  return (
                    <div
                      key={order.id}
                      className="rounded-lg border border-gold-400/15 bg-ink-soft p-5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-cream">
                            Pedido #{order.id.slice(-6).toUpperCase()}
                          </p>
                          <p className="text-xs text-cream/50">
                            {new Date(order.createdAt).toLocaleString("pt-BR")}
                          </p>
                        </div>
                        <span className="inline-block rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-[9px] font-bold uppercase tracking-widest2 text-amber-300">
                          Aguardando confirmação de pagamento
                        </span>
                      </div>

                      <ul className="mt-4 space-y-0.5 border-t border-gold-400/10 pt-4 text-sm text-cream/80">
                        {items.map((item, idx) => (
                          <li key={idx}>
                            {item.productName} × {item.quantity} —{" "}
                            {formatBRL(item.unitPriceCents * item.quantity)}
                          </li>
                        ))}
                      </ul>

                      <div className="mt-3 flex items-center justify-between border-t border-gold-400/10 pt-3 text-sm">
                        <span className="text-xs text-cream/50">
                          {order.installments}
                          {order.installments === "1"
                            ? "x (à vista)"
                            : "x sem juros"}
                        </span>
                        {order.discountCents > 0 && (
                          <span className="text-xs text-emerald-400">
                            Desconto: -{formatBRL(order.discountCents)}
                          </span>
                        )}
                        <span className="font-bold text-gold-400">
                          Total: {formatBRL(order.totalCents)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
