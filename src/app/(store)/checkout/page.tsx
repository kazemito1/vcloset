"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { formatBRL } from "@/lib/format";
import { TURNSTILE_SITE_KEY } from "@/lib/constants";
import { TurnstileWidget } from "@/components/checkout/TurnstileWidget";
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

interface FreightOption {
  priceCents: number;
  prazoDias: number;
}

interface FreightQuote {
  pac: FreightOption;
  sedex: FreightOption;
}

type ShippingChoice = "PAC" | "SEDEX" | null;

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
const FREE_SHIPPING_CENTS = 29900;
const WHATSAPP_NUMBER = "5521995709075";

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
  const [frete, setFrete] = useState<FreightQuote | null>(null);
  const [fetchingFrete, setFetchingFrete] = useState(false);
  const [freteErro, setFreteErro] = useState<string | null>(null);
  const [shippingChoice, setShippingChoice] = useState<ShippingChoice>(null);
  const [payMethod, setPayMethod] = useState<"CARTAO" | "PIX">("CARTAO");
  // Cloudflare Turnstile (ativa quando há Site Key configurada)
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaKey, setCaptchaKey] = useState(0);
  const captchaObrigatorio = Boolean(TURNSTILE_SITE_KEY);

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
        // CEP já salvo: consulta o frete automaticamente
        if (parsed.cep) {
          const digits = onlyDigits(parsed.cep);
          if (digits.length === 8) {
            void carregarFrete(digits);
          }
        }
      }
    } catch {
      // ignora JSON corrompido
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function carregarFrete(cepDigits: string) {
    setFetchingFrete(true);
    setFreteErro(null);
    try {
      const res = await fetch(`/api/frete?cep=${cepDigits}`);
      if (!res.ok) throw new Error();
      const data: FreightQuote = await res.json();
      setFrete(data);
      // Seleciona PAC por padrão (normalmente grátis acima de R$ 299)
      setShippingChoice("PAC");
    } catch {
      setFrete(null);
      setFreteErro("Não foi possível calcular o frete agora.");
    } finally {
      setFetchingFrete(false);
    }
  }

  const shippingCents =
    shippingChoice === "PAC"
      ? totalCents >= FREE_SHIPPING_CENTS
        ? 0
        : (frete?.pac.priceCents ?? 0)
      : shippingChoice === "SEDEX"
        ? (frete?.sedex.priceCents ?? 0)
        : 0;

  const totalComFrete = finalTotalCents + shippingCents;

  // Mensagem do WhatsApp com os produtos da sacola já preenchidos
  const produtosMsg = items
    .map((i) => `• ${i.name}${i.variantLabel ? ` — ${i.variantLabel}` : ""} (${i.quantity}x)`)
    .join("\n");
  const whatsappTexto = `Olá! Quero finalizar a compra do pedido:\n${produtosMsg}\nTotal: ${formatBRL(totalComFrete)}`;
  const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(whatsappTexto)}`;

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

      void carregarFrete(cep);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus(null);

    const validation = validateLead({ ...form, paymentMethod: payMethod });
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      setStatus({
        type: "error",
        message: "Verifique os campos destacados antes de concluir o pagamento.",
      });
      return;
    }
    setErrors({});

    if (captchaObrigatorio && !captchaToken) {
      setStatus({
        type: "error",
        message: "Confirme a verificação de segurança antes de continuar.",
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          paymentMethod: payMethod,
          website: honeypot,
          items: buildItemsPayload(),
          discountCents,
          turnstileToken: captchaToken,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        // Cartão recusado (ex.: reuso bloqueado): tela padrão "pedido recebido"
        if (res.status === 409) {
          router.push("/pagamento-recusado");
          return;
        }
        if (data.fields) setErrors(data.fields);
        throw new Error(data.error || "Erro ao enviar.");
      }

      finalizarPedidoNoSite();
    } catch (err) {
      setStatus({
        type: "error",
        message: err instanceof Error ? err.message : "Erro ao enviar.",
      });
      // token do Turnstile é de uso único: renova após falha
      setCaptchaToken("");
      setCaptchaKey((k) => k + 1);
      setSubmitting(false);
    }
  }

  function buildItemsPayload() {
    return items.map((i) => ({
      productName: i.variantLabel ? `${i.name} — ${i.variantLabel}` : i.name,
      quantity: i.quantity,
      unitPriceCents: i.unitPriceCents,
      productSlug: i.slug,
      image: i.image,
    }));
  }

  // Salva os dados pessoais (se autorizado), limpa a sacola e mostra a
  // confirmação de pedido recebido no site.
  function finalizarPedidoNoSite() {
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
  }

  // Pix: ao clicar em "Finalizar compra pelo WhatsApp" o link abre o WhatsApp
  // normalmente (comportamento padrão do <a>) e o pedido é registrado no site
  // em paralelo, aparecendo em "Meus Pedidos" com o status "Finalize no Whatsapp".
  function handlePixWhatsapp(e: React.MouseEvent<HTMLAnchorElement>) {
    if (submitting) {
      e.preventDefault();
      return;
    }

    const validation = validateLead({ ...form, paymentMethod: "PIX" });
    if (Object.keys(validation).length > 0) {
      e.preventDefault();
      setErrors(validation);
      setStatus({
        type: "error",
        message: "Preencha seus dados acima antes de finalizar pelo WhatsApp.",
      });
      return;
    }
    setErrors({});
    setStatus(null);

    if (captchaObrigatorio && !captchaToken) {
      e.preventDefault();
      setStatus({
        type: "error",
        message: "Confirme a verificação de segurança antes de continuar.",
      });
      return;
    }

    void (async () => {
      setSubmitting(true);
      try {
        const res = await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            paymentMethod: "PIX",
            website: honeypot,
            items: buildItemsPayload(),
            discountCents,
            turnstileToken: captchaToken,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          if (data.fields) setErrors(data.fields);
          throw new Error(data.error || "Erro ao registrar o pedido.");
        }
        finalizarPedidoNoSite();
      } catch (err) {
        setStatus({
          type: "error",
          message:
            err instanceof Error
              ? err.message
              : "Erro ao registrar o pedido.",
        });
        // token do Turnstile é de uso único: renova após falha
        setCaptchaToken("");
        setCaptchaKey((k) => k + 1);
      } finally {
        setSubmitting(false);
      }
    })();
  }

  function inputClass(field: keyof LeadData) {
    const invalid = Boolean(errors[field]);
    return `h-12 w-full rounded-lg border bg-white px-4 text-sm text-ink placeholder:text-ink/35 outline-none transition focus:ring-2 ${
      invalid
        ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
        : "border-gold-400/30 focus:border-gold-500 focus:ring-gold-500/25"
    }`;
  }

  if (cartReady && items.length === 0) {
    return (
      <div className="bg-neutral-50 py-24 text-center text-ink">
        <h1 className="font-serif text-3xl tracking-widest2">
          <span className="text-gold-600">V</span>CLOSET
        </h1>
        <p className="mt-6 text-sm text-ink/60">Seu carrinho está vazio.</p>
        <Link
          href="/"
          className="mt-8 inline-flex h-11 items-center justify-center rounded-full bg-gold-500 px-8 text-xs font-bold uppercase tracking-widest2 text-white transition hover:bg-gold-600"
        >
          Continuar comprando
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-neutral-50 text-ink">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <header className="mb-10 text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.5em] text-ink/50">
            Checkout
          </p>
          <img
            src="/logo-vcloset-dark.svg"
            alt="VCLOSET — Joias e Acessórios"
            className="mx-auto mt-3 h-auto w-64 sm:w-80"
          />
          <div className="mx-auto mt-4 flex items-center justify-center gap-3">
            <span className="h-px w-16 bg-gold-500/30" />
            <span className="h-1.5 w-1.5 rotate-45 border border-gold-500" />
            <span className="h-px w-16 bg-gold-500/30" />
          </div>
          <p className="mx-auto mt-5 max-w-sm text-sm leading-relaxed text-ink/60">
            Preencha todos os campos abaixo para concluir o seu pagamento com
            segurança.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-10" noValidate>
          <section className="rounded-xl border border-gold-400/20 bg-white p-6 shadow-sm sm:p-8">
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

          <section className="rounded-xl border border-gold-400/20 bg-white p-6 shadow-sm sm:p-8">
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
                  <span className="absolute right-3 top-9 text-xs italic text-ink/50">
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

            <div className="mt-8">
              <SectionTitle>Frete estimado</SectionTitle>
              {fetchingFrete ? (
                <p className="text-sm text-ink/50">Calculando frete...</p>
              ) : freteErro ? (
                <p className="text-sm text-red-500">{freteErro}</p>
              ) : !frete ? (
                <p className="text-sm text-ink/50">
                  Digite o CEP acima para consultar o frete estimado (PAC e
                  SEDEX).
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  <ShippingOption
                    id="pac"
                    name="PAC"
                    prazo={`${frete.pac.prazoDias} dias úteis`}
                    priceCents={totalCents >= FREE_SHIPPING_CENTS ? 0 : frete.pac.priceCents}
                    free={totalCents >= FREE_SHIPPING_CENTS}
                    selected={shippingChoice === "PAC"}
                    onSelect={() => setShippingChoice("PAC")}
                  />
                  <ShippingOption
                    id="sedex"
                    name="SEDEX"
                    prazo={`${frete.sedex.prazoDias} dias úteis`}
                    priceCents={frete.sedex.priceCents}
                    free={false}
                    selected={shippingChoice === "SEDEX"}
                    onSelect={() => setShippingChoice("SEDEX")}
                  />
                </div>
              )}
              {totalCents < FREE_SHIPPING_CENTS && (
                <p className="mt-3 text-xs text-ink/50">
                  Frete PAC grátis em compras acima de {formatBRL(FREE_SHIPPING_CENTS)}.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-gold-400/20 bg-white p-6 shadow-sm sm:p-8">
            <SectionTitle>03 &middot; Pagamento</SectionTitle>

            {/* Abas de método de pagamento */}
            <div className="mb-7 grid grid-cols-2 gap-3">
              <PayTab
                active={payMethod === "CARTAO"}
                onClick={() => setPayMethod("CARTAO")}
                label="Cartão de crédito"
                sub="Até 12x sem juros"
              />
              <PayTab
                active={payMethod === "PIX"}
                onClick={() => setPayMethod("PIX")}
                label="Pix"
                sub="Aprovação imediata"
              />
            </div>

            {payMethod === "CARTAO" ? (
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
                    <option key={n} value={String(n)}>
                      {n === 1
                        ? `À vista — ${formatBRL(totalComFrete)}`
                        : `${n}x de ${formatBRL(Math.round(totalComFrete / n))} sem juros`}
                    </option>
                  ))}
                </select>
                <FieldError message={errors.installments} />
              </div>
              </div>
            ) : (
              <div className="rounded-lg border border-gold-400/25 bg-cream p-5">
                <div className="flex items-start gap-3">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 flex-shrink-0 text-gold-600"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 16v-4M12 8h.01" />
                  </svg>
                  <p className="text-sm leading-relaxed text-ink">
                    Para pagar seu pedido com Pix, entre em contato conosco
                    através do WhatsApp.
                  </p>
                </div>

                <div className="mt-4 rounded-lg border border-gold-400/20 bg-white p-4">
                  <p className="text-[11px] uppercase tracking-widest2 text-ink/50">
                    Seu pedido
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-ink/80">
                    {items.map((item, idx) => (
                      <li key={`${item.productId}-${idx}`}>
                        {item.name}
                        {item.variantLabel ? ` — ${item.variantLabel}` : ""}
                        <span className="text-ink/50"> × {item.quantity}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-2 text-sm font-semibold text-gold-700">
                    Total: {formatBRL(totalComFrete)}
                  </p>
                </div>

                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handlePixWhatsapp}
                  className={`mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#25D366] text-xs font-bold uppercase tracking-widest2 text-white transition hover:brightness-95 ${
                    submitting ? "pointer-events-none opacity-60" : ""
                  }`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-5 w-5"
                    aria-hidden="true"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                  </svg>
                  Finalizar compra pelo WhatsApp
                </a>

                <p className="mt-3 text-center text-[11px] text-ink/40">
                  Você será direcionado ao WhatsApp com os detalhes do seu
                  pedido já preenchidos e ele será registrado no site com o
                  status &quot;Finalize no Whatsapp&quot;.
                </p>
              </div>
            )}

            <div className="mt-5">
              <Label>
                Observações <span className="font-normal normal-case tracking-normal">(opcional)</span>
              </Label>
              <textarea
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
                placeholder="Observações para entrega ou para o envio do seu produto, solicite aqui"
                rows={4}
                className="w-full rounded-lg border border-gold-400/30 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink/35 outline-none transition focus:border-gold-500 focus:ring-2 focus:ring-gold-500/25"
              />
            </div>
          </section>

          <section className="rounded-xl border border-gold-400/20 bg-white p-6 shadow-sm sm:p-8">
            <SectionTitle>04 &middot; Resumo do pedido</SectionTitle>
            <div className="space-y-3 rounded-lg border border-gold-400/15 bg-cream p-5 text-sm">
              {items.map((item, idx) => (
                <div key={`${item.productId}-${item.variantLabel ?? ""}-${idx}`} className="flex items-center justify-between gap-4">
                  <span className="text-ink/90">
                    {item.name}
                    {item.variantLabel ? ` — ${item.variantLabel}` : ""}
                    <span className="text-ink/50"> × {item.quantity}</span>
                  </span>
                  <span className="whitespace-nowrap text-ink/90">
                    {formatBRL(item.unitPriceCents * item.quantity)}
                  </span>
                </div>
              ))}

              <div className="h-px bg-gold-500/20" />

              <div className="flex items-center justify-between">
                <span className="text-ink/60">Subtotal</span>
                <span className="text-ink/90">{formatBRL(totalCents)}</span>
              </div>

              {discountCents > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-ink/60">Desconto</span>
                  <span className="text-emerald-700">-{formatBRL(discountCents)}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-ink/60">Frete</span>
                {shippingChoice === null ? (
                  <span className="text-ink/50">
                    {frete ? "Selecione acima" : "Informe o CEP"}
                  </span>
                ) : shippingCents === 0 ? (
                  <span className="font-medium text-gold-700">Grátis</span>
                ) : (
                  <span className="text-ink/90">{formatBRL(shippingCents)}</span>
                )}
              </div>

              <div className="h-px bg-gold-500/20" />

              <div className="flex items-center justify-between text-base font-semibold">
                <span>Total</span>
                <span className="text-gold-700">{formatBRL(totalComFrete)}</span>
              </div>
              <p className="text-xs text-ink/50">
                Em até 12x de {formatBRL(Math.round(totalComFrete / 12))} sem juros no cartão.
              </p>
            </div>
          </section>

          {status && (
            <div
              className={`rounded-lg px-4 py-3 text-sm ${
                status.type === "success"
                  ? "border border-emerald-600 bg-emerald-50 text-emerald-700"
                  : "border border-red-500 bg-red-50 text-red-600"
              }`}
            >
              {status.message}
            </div>
          )}

          <div className="space-y-5">
            <TurnstileWidget
              onToken={setCaptchaToken}
              resetKey={captchaKey}
            />
            <button
              type="submit"
              disabled={submitting}
              className="h-12 w-full rounded-full bg-gold-500 text-xs font-bold uppercase tracking-widest2 text-white shadow-gold transition hover:bg-gold-600 disabled:opacity-60 disabled:hover:bg-gold-500"
            >
              {submitting ? "Processando..." : "Concluir Pagamento"}
            </button>

            <label className="flex cursor-pointer items-center justify-center gap-2 text-xs text-ink/60">
              <input
                type="checkbox"
                checked={saveData}
                onChange={(e) => setSaveData(e.target.checked)}
                className="h-4 w-4 accent-gold-600"
              />
              Salvar meus dados para uma próxima compra
            </label>

            <div className="flex flex-wrap items-center justify-center gap-2">
              {/* Visa */}
              <PayBadge label="VISA" className="text-xs font-extrabold italic tracking-tighter text-ink/80" />

              {/* Mastercard */}
              <span className="flex h-7 w-12 items-center justify-center rounded-md border border-gold-400/25 bg-white">
                <svg viewBox="0 0 48 30" className="h-4" aria-label="Mastercard" role="img">
                  <circle cx="15" cy="15" r="10" fill="#EB001B" />
                  <circle cx="33" cy="15" r="10" fill="#F79E1B" />
                  <path fill="#FF5F00" d="M24 10.637 A10 10 0 0 1 24 19.363 A10 10 0 0 1 24 10.637 Z" />
                </svg>
              </span>

              {/* Elo */}
              <span className="flex h-7 w-12 items-center justify-center gap-0.5 rounded-md border border-gold-400/25 bg-white">
                <span className="text-xs font-extrabold lowercase italic tracking-tight text-ink/80">elo</span>
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
              <span className="flex h-7 w-12 items-center justify-center rounded-md border border-gold-400/25 bg-white">
                <span className="text-[8px] font-extrabold tracking-tight text-ink/80">
                  DISC<span className="text-[#FF6000]">O</span>VER
                </span>
              </span>

              {/* Nubank */}
              <span className="flex h-7 w-12 items-center justify-center rounded-md bg-[#820AD1]">
                <span className="text-xs font-extrabold lowercase tracking-tight text-white">nu</span>
              </span>

              {/* Pix */}
              <span className="flex h-7 w-12 items-center justify-center rounded-md border border-gold-400/25 bg-white">
                <span className="text-xs font-extrabold lowercase tracking-tight text-[#32BCAD]">pix</span>
              </span>
            </div>

            <p className="flex items-center justify-center gap-2 text-center text-[11px] tracking-wide text-ink/50">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3.5 w-3.5 shrink-0 text-gold-600"
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

function PayTab({
  active,
  onClick,
  label,
  sub,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  sub: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-4 py-3 text-left transition ${
        active
          ? "border-gold-500 bg-gold-500/5 ring-2 ring-gold-500/25"
          : "border-gold-400/25 bg-white hover:border-gold-500/60"
      }`}
    >
      <span className={`block text-sm font-semibold ${active ? "text-gold-700" : "text-ink"}`}>
        {label}
      </span>
      <span className="block text-xs text-ink/50">{sub}</span>
    </button>
  );
}

function ShippingOption({
  id,
  name,
  prazo,
  priceCents,
  free,
  selected,
  onSelect,
}: {
  id: string;
  name: string;
  prazo: string;
  priceCents: number;
  free: boolean;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex items-center justify-between rounded-lg border px-4 py-3 text-left transition ${
        selected
          ? "border-gold-500 bg-gold-500/5 ring-2 ring-gold-500/25"
          : "border-gold-400/25 bg-white hover:border-gold-500/60"
      }`}
    >
      <span>
        <span className="block text-sm font-semibold text-ink">{name}</span>
        <span className="block text-xs text-ink/50">até {prazo}</span>
      </span>
      <span className={`text-sm font-semibold ${free ? "text-gold-700" : "text-ink"}`}>
        {free ? "Grátis" : formatBRL(priceCents)}
      </span>
    </button>
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
    <span className="flex h-7 w-12 items-center justify-center rounded-md border border-gold-400/25 bg-white">
      <span className={className}>{label}</span>
    </span>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-6 flex items-center gap-4">
      <h2 className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.3em] text-ink">
        {children}
      </h2>
      <span className="h-px flex-1 bg-gold-500/25" />
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.12em] text-ink/60">
      {children}
    </label>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-500">{message}</p>;
}
