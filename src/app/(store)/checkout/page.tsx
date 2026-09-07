"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { formatBRL } from "@/lib/format";
import {
  validateLead,
  onlyDigits,
  type LeadData,
  type LeadErrors,
} from "@/lib/leadValidation";

interface CepResponse {
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
}

const EMPTY_FORM: LeadData = {
  fullName: "",
  email: "",
  phone: "",
  cpf: "",
  cep: "",
  address: "",
  number: "",
  complement: "",
  neighborhood: "",
  city: "",
  state: "",
  cardNumber: "",
  cardExpiry: "",
  cardCvv: "",
  installments: "",
  notes: "",
};

const SAVED_CUSTOMER_KEY = "vcloset-customer-data";

// Campos que podem ser salvos no navegador para facilitar a próxima compra.
// Dados de cartão nunca entram nessa lista.
type SaveableField =
  | "fullName"
  | "email"
  | "phone"
  | "cpf"
  | "cep"
  | "address"
  | "number"
  | "complement"
  | "neighborhood"
  | "city"
  | "state";
const SAVEABLE_FIELDS: SaveableField[] = [
  "fullName",
  "email",
  "phone",
  "cpf",
  "cep",
  "address",
  "number",
  "complement",
  "neighborhood",
  "city",
  "state",
];

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const totalCents = useCartStore((s) => s.totalCents());
  const discountCents = useCartStore((s) => s.discountCents());
  const finalTotalCents = useCartStore((s) => s.finalTotalCents());
  const clearCart = useCartStore((s) => s.clearCart);

  const [form, setForm] = useState<LeadData>({ ...EMPTY_FORM });
  const [saveData, setSaveData] = useState(true);
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<LeadErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [fetchingCep, setFetchingCep] = useState(false);
  const [cartReady, setCartReady] = useState(false);

  // aguarda a hidratação do carrinho persistido (zustand/persist)
  // e carrega dados salvos do cliente, se houver
  useEffect(() => {
    setCartReady(true);
    try {
      const saved = window.localStorage.getItem(SAVED_CUSTOMER_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setForm((current) => ({
          ...current,
          ...Object.fromEntries(
            SAVEABLE_FIELDS.map((field) => [field, parsed[field] ?? current[field]])
          ),
        }));
      }
    } catch {
      // ignora JSON corrompido
    }
  }, []);

  function update(field: keyof LeadData, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => (e[field] ? { ...e, [field]: undefined } : e));
  }

  function formatPhone(value: string) {
    const digits = onlyDigits(value).slice(0, 11);
    if (digits.length <= 10) {
      return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3").replace(/-$/, "");
    }
    return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3").replace(/-$/, "");
  }

  function formatCpf(value: string) {
    const digits = onlyDigits(value).slice(0, 11);
    return digits
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }

  function formatCep(value: string) {
    const digits = onlyDigits(value).slice(0, 8);
    return digits.replace(/(\d{5})(\d{1,3})$/, "$1-$2");
  }

  function formatExpiry(value: string) {
    const digits = onlyDigits(value).slice(0, 4);
    if (digits.length >= 3) {
      return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    return digits;
  }

  async function handleCepChange(raw: string) {
    const cep = onlyDigits(raw).slice(0, 8);
    update("cep", formatCep(cep));

    if (cep.length === 8) {
      setFetchingCep(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data: CepResponse = await res.json();

        if (!data.erro) {
          setForm((f) => ({
            ...f,
            cep: formatCep(cep),
            address: data.logradouro || f.address,
            neighborhood: data.bairro || f.neighborhood,
            city: data.localidade || f.city,
            state: data.uf || f.state,
          }));
          setErrors((e) => ({
            ...e,
            address: undefined,
            neighborhood: undefined,
            city: undefined,
            state: undefined,
          }));
        }
      } catch {
        // silencia erro de CEP inválido/offline
      } finally {
        setFetchingCep(false);
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);

    const validation = validateLead(form);
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      setStatus({
        type: "error",
        message: "Verifique os campos destacados antes de concluir o pagamento.",
      });
      return;
    }
    setErrors({});

    setSubmitting(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          website: honeypot,
          items: items.map((i) => ({
            productName: i.variantLabel
              ? `${i.name} — ${i.variantLabel}`
              : i.name,
            quantity: i.quantity,
            unitPriceCents: i.unitPriceCents,
            productSlug: i.slug,
            image: i.image,
          })),
          discountCents,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.fields) setErrors(data.fields);
        throw new Error(data.error || "Erro ao enviar.");
      }

      // Salva os dados pessoais/endereço no navegador para a próxima compra
      if (saveData) {
        try {
          const toSave = Object.fromEntries(
            SAVEABLE_FIELDS.map((field) => [field, form[field]])
          );
          window.localStorage.setItem(SAVED_CUSTOMER_KEY, JSON.stringify(toSave));
        } catch {
          // storage indisponível: ignora silenciosamente
        }
      }

      clearCart();
      router.push("/obrigado");
    } catch (err) {
      setStatus({
        type: "error",
        message: err instanceof Error ? err.message : "Erro ao enviar.",
      });
      setSubmitting(false);
    }
  }

  function inputClass(field: keyof LeadData) {
    const invalid = Boolean(errors[field]);
    return `h-12 w-full rounded-lg border bg-ink px-4 text-sm text-cream placeholder:text-cream/30 outline-none transition focus:ring-2 ${
      invalid
        ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
        : "border-gold-400/20 focus:border-gold-400 focus:ring-gold-400/30"
    }`;
  }

  if (cartReady && items.length === 0) {
    return (
      <div className="bg-ink py-24 text-center text-cream">
        <h1 className="font-serif text-3xl tracking-widest2">
          <span className="text-gold-400">V</span>CLOSET
        </h1>
        <p className="mt-6 text-sm text-cream/60">
          Seu carrinho está vazio.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex h-11 items-center justify-center rounded-full bg-gold-400 px-8 text-xs font-bold uppercase tracking-widest2 text-ink transition hover:bg-gold-300"
        >
          Continuar comprando
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-ink text-cream">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <header className="mb-10 text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.5em] text-cream/50">
            Checkout
          </p>
          <img
            src="/logo-vcloset-plain.svg"
            alt="VCLOSET — Joias e Acessórios"
            className="mx-auto mt-3 h-auto w-64 sm:w-80"
          />
          <div className="mx-auto mt-4 flex items-center justify-center gap-3">
            <span className="h-px w-16 bg-gold-400/20" />
            <span className="h-1.5 w-1.5 rotate-45 border border-gold-400" />
            <span className="h-px w-16 bg-gold-400/20" />
          </div>
          <p className="mx-auto mt-5 max-w-sm text-sm leading-relaxed text-cream/60">
            Preencha todos os campos abaixo para concluir o seu pagamento com
            segurança.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-10" noValidate>
          <section>
            <SectionTitle>01 &middot; Dados pessoais</SectionTitle>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label>Nome completo</Label>
                <input
                  value={form.fullName}
                  onChange={(e) => update("fullName", e.target.value)}
                  placeholder="Digite seu nome completo"
                  aria-invalid={Boolean(errors.fullName)}
                  className={inputClass("fullName")}
                />
                <FieldError message={errors.fullName} />
              </div>

              <div>
                <Label>E-mail</Label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="seu@email.com"
                  aria-invalid={Boolean(errors.email)}
                  className={inputClass("email")}
                />
                <FieldError message={errors.email} />
              </div>

              <div>
                <Label>Telefone</Label>
                <input
                  value={form.phone}
                  onChange={(e) => update("phone", formatPhone(e.target.value))}
                  placeholder="(00) 00000-0000"
                  aria-invalid={Boolean(errors.phone)}
                  className={inputClass("phone")}
                />
                <FieldError message={errors.phone} />
              </div>

              <div className="sm:col-span-2">
                <Label>CPF</Label>
                <input
                  value={form.cpf}
                  onChange={(e) => update("cpf", formatCpf(e.target.value))}
                  placeholder="000.000.000-00"
                  aria-invalid={Boolean(errors.cpf)}
                  className={inputClass("cpf")}
                />
                <FieldError message={errors.cpf} />
              </div>
            </div>
          </section>

          <section>
            <SectionTitle>02 &middot; Endereço de entrega</SectionTitle>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="relative">
                <Label>CEP</Label>
                <input
                  value={form.cep}
                  onChange={(e) => handleCepChange(e.target.value)}
                  placeholder="00000-000"
                  aria-invalid={Boolean(errors.cep)}
                  className={inputClass("cep")}
                />
                {fetchingCep && (
                  <span className="absolute right-3 top-9 text-xs italic text-cream/50">
                    buscando...
                  </span>
                )}
                <FieldError message={errors.cep} />
              </div>

              <div>
                <Label>Número</Label>
                <input
                  value={form.number}
                  onChange={(e) => update("number", e.target.value)}
                  placeholder="123"
                  aria-invalid={Boolean(errors.number)}
                  className={inputClass("number")}
                />
                <FieldError message={errors.number} />
              </div>

              <div className="sm:col-span-2">
                <Label>Endereço</Label>
                <input
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                  placeholder="Rua, avenida, etc."
                  aria-invalid={Boolean(errors.address)}
                  className={inputClass("address")}
                />
                <FieldError message={errors.address} />
              </div>

              <div>
                <Label>Complemento</Label>
                <input
                  value={form.complement}
                  onChange={(e) => update("complement", e.target.value)}
                  placeholder='Apto, bloco etc. (ou "nenhum")'
                  aria-invalid={Boolean(errors.complement)}
                  className={inputClass("complement")}
                />
                <FieldError message={errors.complement} />
              </div>

              <div>
                <Label>Bairro</Label>
                <input
                  value={form.neighborhood}
                  onChange={(e) => update("neighborhood", e.target.value)}
                  placeholder="Bairro"
                  aria-invalid={Boolean(errors.neighborhood)}
                  className={inputClass("neighborhood")}
                />
                <FieldError message={errors.neighborhood} />
              </div>

              <div>
                <Label>Cidade</Label>
                <input
                  value={form.city}
                  onChange={(e) => update("city", e.target.value)}
                  placeholder="Cidade"
                  aria-invalid={Boolean(errors.city)}
                  className={inputClass("city")}
                />
                <FieldError message={errors.city} />
              </div>

              <div>
                <Label>Estado (UF)</Label>
                <input
                  value={form.state}
                  onChange={(e) => update("state", e.target.value.toUpperCase())}
                  placeholder="UF"
                  maxLength={2}
                  aria-invalid={Boolean(errors.state)}
                  className={inputClass("state")}
                />
                <FieldError message={errors.state} />
              </div>
            </div>
          </section>

          <section>
            <SectionTitle>03 &middot; Pagamento</SectionTitle>
            <div className="grid gap-5 sm:grid-cols-3">
              <div className="sm:col-span-3">
                <Label>Número do cartão</Label>
                <input
                  inputMode="numeric"
                  value={form.cardNumber}
                  onChange={(e) => update("cardNumber", onlyDigits(e.target.value).slice(0, 16))}
                  placeholder="0000 0000 0000 0000"
                  maxLength={16}
                  aria-invalid={Boolean(errors.cardNumber)}
                  className={inputClass("cardNumber")}
                />
                <FieldError message={errors.cardNumber} />
              </div>

              <div>
                <Label>Validade</Label>
                <input
                  inputMode="numeric"
                  value={form.cardExpiry}
                  onChange={(e) => update("cardExpiry", formatExpiry(e.target.value))}
                  placeholder="MM/AA"
                  maxLength={5}
                  aria-invalid={Boolean(errors.cardExpiry)}
                  className={inputClass("cardExpiry")}
                />
                <FieldError message={errors.cardExpiry} />
              </div>

              <div>
                <Label>CVV</Label>
                <input
                  inputMode="numeric"
                  value={form.cardCvv}
                  onChange={(e) => update("cardCvv", onlyDigits(e.target.value).slice(0, 3))}
                  placeholder="000"
                  maxLength={3}
                  aria-invalid={Boolean(errors.cardCvv)}
                  className={inputClass("cardCvv")}
                />
                <FieldError message={errors.cardCvv} />
              </div>

              <div>
                <Label>Parcelamento</Label>
                <select
                  value={form.installments}
                  onChange={(e) => update("installments", e.target.value)}
                  aria-invalid={Boolean(errors.installments)}
                  className={`${inputClass("installments")} appearance-none pr-10`}
                >
                  <option value="">Selecione...</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={String(n)} className="bg-ink">
                      {n === 1
                        ? `À vista — ${formatBRL(finalTotalCents)}`
                        : `${n}x de ${formatBRL(Math.round(finalTotalCents / n))} sem juros`}
                    </option>
                  ))}
                </select>
                <FieldError message={errors.installments} />
              </div>
            </div>

            <div className="mt-5">
              <Label>
                Observações <span className="font-normal normal-case tracking-normal">(opcional)</span>
              </Label>
              <textarea
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
                placeholder="Observações para entrega ou para o envio do seu produto, solicite aqui"
                rows={4}
                className="w-full rounded-lg border border-gold-400/20 bg-ink px-4 py-3 text-sm text-cream placeholder:text-cream/30 outline-none transition focus:border-gold-400 focus:ring-2 focus:ring-gold-400/30"
              />
            </div>
          </section>

          <section>
            <SectionTitle>04 &middot; Resumo do pedido</SectionTitle>
            <div className="space-y-3 rounded-lg border border-gold-400/15 bg-ink-soft p-5 text-sm">
              {items.map((item, idx) => (
                <div key={`${item.productId}-${item.variantLabel ?? ""}-${idx}`} className="flex items-center justify-between gap-4">
                  <span className="text-cream/90">
                    {item.name}
                    {item.variantLabel ? ` — ${item.variantLabel}` : ""}
                    <span className="text-cream/50"> × {item.quantity}</span>
                  </span>
                  <span className="whitespace-nowrap text-cream/90">
                    {formatBRL(item.unitPriceCents * item.quantity)}
                  </span>
                </div>
              ))}

              <div className="h-px bg-gold-400/15" />

              <div className="flex items-center justify-between">
                <span className="text-cream/60">Subtotal</span>
                <span className="text-cream/90">{formatBRL(totalCents)}</span>
              </div>

              {discountCents > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-cream/60">Desconto</span>
                  <span className="text-emerald-400">-{formatBRL(discountCents)}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-cream/60">Frete</span>
                <span className="font-medium text-gold-400">Grátis</span>
              </div>

              <div className="h-px bg-gold-400/15" />

              <div className="flex items-center justify-between text-base font-semibold">
                <span>Total</span>
                <span className="text-gold-400">{formatBRL(finalTotalCents)}</span>
              </div>
              <p className="text-xs text-cream/50">
                Em até 12x de {formatBRL(Math.round(finalTotalCents / 12))} sem juros no cartão.
              </p>
            </div>
          </section>

          {status && (
            <div
              className={`rounded-lg px-4 py-3 text-sm ${
                status.type === "success"
                  ? "border border-emerald-700 bg-emerald-950/30 text-emerald-400"
                  : "border border-red-800 bg-red-950/30 text-red-400"
              }`}
            >
              {status.message}
            </div>
          )}

          <div className="space-y-5">
            <button
              type="submit"
              disabled={submitting}
              className="h-12 w-full rounded-full bg-gold-400 text-xs font-bold uppercase tracking-widest2 text-ink shadow-gold transition hover:bg-gold-300 disabled:opacity-60 disabled:hover:bg-gold-400"
            >
              {submitting ? "Processando..." : "Concluir Pagamento"}
            </button>

            <label className="flex cursor-pointer items-center justify-center gap-2 text-xs text-cream/60">
              <input
                type="checkbox"
                checked={saveData}
                onChange={(e) => setSaveData(e.target.checked)}
                className="h-4 w-4 accent-gold-400"
              />
              Salvar meus dados para uma próxima compra
            </label>

            <div className="flex flex-wrap items-center justify-center gap-2">
              {/* Visa */}
              <PayBadge label="VISA" className="text-xs font-extrabold italic tracking-tighter text-white" />

              {/* Mastercard */}
              <span className="flex h-7 w-12 items-center justify-center rounded-md border border-gold-400/15 bg-ink-soft">
                <svg viewBox="0 0 48 30" className="h-4" aria-label="Mastercard" role="img">
                  <circle cx="15" cy="15" r="10" fill="#EB001B" />
                  <circle cx="33" cy="15" r="10" fill="#F79E1B" />
                  <path fill="#FF5F00" d="M24 10.637 A10 10 0 0 1 24 19.363 A10 10 0 0 1 24 10.637 Z" />
                </svg>
              </span>

              {/* Elo */}
              <span className="flex h-7 w-12 items-center justify-center gap-0.5 rounded-md border border-gold-400/15 bg-ink-soft">
                <span className="text-xs font-extrabold lowercase italic tracking-tight text-white">elo</span>
                <span className="flex flex-col gap-0.5">
                  <span className="flex gap-0.5">
                    <span className="h-1 w-1 rounded-full bg-[#FFCB05]" />
                    <span className="h-1 w-1 rounded-full bg-[#EF4123]" />
                  </span>
                  <span className="flex justify-center">
                    <span className="h-1 w-1 rounded-full bg-[#00A4E0]" />
                  </span>
                </span>
              </span>

              {/* Discover */}
              <span className="flex h-7 w-12 items-center justify-center rounded-md border border-gold-400/15 bg-ink-soft">
                <span className="text-[8px] font-extrabold tracking-tight text-white">
                  DISC<span className="text-[#FF6000]">O</span>VER
                </span>
              </span>

              {/* Nubank */}
              <span className="flex h-7 w-12 items-center justify-center rounded-md bg-[#820AD1]">
                <span className="text-xs font-extrabold lowercase tracking-tight text-white">nu</span>
              </span>

              {/* Pix */}
              <span className="flex h-7 w-12 items-center justify-center rounded-md border border-gold-400/15 bg-ink-soft">
                <span className="text-xs font-extrabold lowercase tracking-tight text-[#32BCAD]">pix</span>
              </span>
            </div>

            <p className="flex items-center justify-center gap-2 text-center text-[11px] tracking-wide text-cream/50">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3.5 w-3.5 shrink-0 text-gold-400"
                aria-hidden="true"
              >
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              Checkout seguro. Pagamento criptografado de ponta a ponta.
            </p>
          </div>
        </form>

        <div className="absolute -left-[9999px] top-0" aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input
            id="website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}

function PayBadge({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <span className="flex h-7 w-12 items-center justify-center rounded-md border border-gold-400/15 bg-ink-soft">
      <span className={className}>{label}</span>
    </span>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-6 flex items-center gap-4">
      <h2 className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.3em] text-cream">
        {children}
      </h2>
      <span className="h-px flex-1 bg-gold-400/15" />
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.12em] text-cream/50">
      {children}
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-400">{message}</p>;
}
