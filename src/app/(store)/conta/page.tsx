"use client";

import { useCallback, useEffect, useState } from "react";
import { ORDER_STATUS_LABEL, type OrderStatus } from "@/lib/orderStatus";

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
  status: OrderStatus;
}

function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function OrderCard({ order }: { order: Order }) {
  let items: OrderItem[] = [];
  try {
    items = JSON.parse(order.itemsJson) as OrderItem[];
  } catch {
    items = [];
  }

  return (
    <div className="rounded-lg border border-gold-400/15 bg-ink-soft p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-cream">
            Pedido #{order.id.slice(-6).toUpperCase()}
          </p>
          <p className="text-xs text-cream/50">
            {new Date(order.createdAt).toLocaleString("pt-BR")}
          </p>
        </div>
        <span
          className={`inline-block rounded-full border px-3 py-1 text-[9px] font-bold uppercase tracking-widest2 ${
            order.status === "ENVIADO"
              ? "border-sky-400/40 bg-sky-400/10 text-sky-300"
              : order.status === "PAGO"
                ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                : "border-amber-400/40 bg-amber-400/10 text-amber-300"
          }`}
        >
          {ORDER_STATUS_LABEL[order.status]}
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
          {order.installments === "1" ? "x (à vista)" : "x sem juros"}
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
}

export default function ContaPage() {
  const [checking, setChecking] = useState(true);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [customer, setCustomer] = useState<{ name: string; email: string } | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadAccount = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch("/api/conta/eu", { cache: "no-store" });
      if (!res.ok) {
        setCustomer(null);
        return false;
      }
      const data = await res.json();
      setCustomer(data.customer);
      setOrders(Array.isArray(data.orders) ? data.orders : []);
      return true;
    } catch {
      setCustomer(null);
      return false;
    }
  }, []);

  useEffect(() => {
    loadAccount().finally(() => setChecking(false));
    document.title = "Minha Conta — V.CLOSET";
  }, [loadAccount]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      const url = mode === "login" ? "/api/conta/login" : "/api/conta/registrar";
      const payload =
        mode === "login" ? { email, password } : { name, email, password };
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormError(data.error || "Não foi possível continuar.");
        return;
      }
      setName("");
      setEmail("");
      setPassword("");
      await loadAccount();
    } catch {
      setFormError("Erro de conexão. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/conta/logout", { method: "POST" });
    setCustomer(null);
    setOrders([]);
  }

  if (checking) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-ink text-cream">
        <p className="text-sm tracking-widest2 text-cream/50">CARREGANDO…</p>
      </div>
    );
  }

  if (customer) {
    return (
      <div className="bg-ink py-16 text-cream">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <header className="text-center">
            <p className="text-[10px] font-medium uppercase tracking-[0.5em] text-cream/50">
              Minha Conta
            </p>
            <h1 className="mt-2 font-serif text-4xl font-medium tracking-widest2">
              <span className="text-gold-400">O</span>LÁ,{" "}
              {customer.name.split(" ")[0].toUpperCase()}
            </h1>
            <p className="mt-3 text-sm text-cream/60">{customer.email}</p>
            <button
              onClick={handleLogout}
              className="mt-4 rounded border border-cream/20 px-4 py-2 text-[10px] font-bold uppercase tracking-widest2 text-cream/60 transition hover:border-cream/40"
            >
              Sair
            </button>
          </header>

          <h2 className="mt-10 text-xs font-bold uppercase tracking-widest2 text-cream/50">
            Meus pedidos ({orders.length})
          </h2>
          <div className="mt-4 space-y-4">
            {orders.length === 0 ? (
              <p className="text-center text-sm text-cream/50">
                Você ainda não fez nenhum pedido.
              </p>
            ) : (
              orders.map((order) => <OrderCard key={order.id} order={order} />)
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-ink py-16 text-cream">
      <div className="mx-auto max-w-md px-4 sm:px-6">
        <header className="text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.5em] text-cream/50">
            Minha Conta
          </p>
          <h1 className="mt-2 font-serif text-4xl font-medium tracking-widest2">
            <span className="text-gold-400">V</span>CLOSET
          </h1>
          <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-cream/60">
            Entre na sua conta ou crie uma gratuitamente para acompanhar seus
            pedidos.
          </p>
        </header>

        <div className="mt-8 flex gap-6 border-b border-gold-400/15">
          <button
            onClick={() => {
              setMode("login");
              setFormError(null);
            }}
            className={`-mb-px border-b-2 pb-3 text-[11px] font-bold uppercase tracking-widest2 transition ${
              mode === "login"
                ? "border-gold-400 text-gold-400"
                : "border-transparent text-cream/50 hover:text-cream/80"
            }`}
          >
            Entrar
          </button>
          <button
            onClick={() => {
              setMode("register");
              setFormError(null);
            }}
            className={`-mb-px border-b-2 pb-3 text-[11px] font-bold uppercase tracking-widest2 transition ${
              mode === "register"
                ? "border-gold-400 text-gold-400"
                : "border-transparent text-cream/50 hover:text-cream/80"
            }`}
          >
            Criar conta
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === "register" && (
            <div>
              <label
                htmlFor="conta-name"
                className="block text-[10px] font-bold uppercase tracking-widest2 text-cream/60"
              >
                Nome completo
              </label>
              <input
                id="conta-name"
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1.5 w-full rounded border border-gold-400/20 bg-ink-soft px-3 py-2.5 text-sm text-cream outline-none transition focus:border-gold-400/60"
                placeholder="Seu nome e sobrenome"
              />
            </div>
          )}
          <div>
            <label
              htmlFor="conta-email"
              className="block text-[10px] font-bold uppercase tracking-widest2 text-cream/60"
            >
              E-mail
            </label>
            <input
              id="conta-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded border border-gold-400/20 bg-ink-soft px-3 py-2.5 text-sm text-cream outline-none transition focus:border-gold-400/60"
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label
              htmlFor="conta-password"
              className="block text-[10px] font-bold uppercase tracking-widest2 text-cream/60"
            >
              Senha
            </label>
            <input
              id="conta-password"
              type="password"
              required
              minLength={6}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded border border-gold-400/20 bg-ink-soft px-3 py-2.5 text-sm text-cream outline-none transition focus:border-gold-400/60"
              placeholder="Mínimo de 6 caracteres"
            />
          </div>

          {formError && (
            <p className="rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {formError}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded bg-gold-400 py-3 text-xs font-bold uppercase tracking-widest2 text-ink transition hover:bg-gold-300 disabled:opacity-50"
          >
            {submitting
              ? "Aguarde…"
              : mode === "login"
                ? "Entrar"
                : "Criar minha conta"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs leading-relaxed text-cream/40">
          Dica: use o mesmo e-mail do checkout — assim seus pedidos aparecem
          automaticamente aqui.
        </p>
      </div>
    </div>
  );
}
