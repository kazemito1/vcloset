# V.CLOSET — Loja de Joias Online

E-commerce de joalheria premium construído do zero com Next.js 14 (App
Router), TypeScript, Tailwind CSS e Prisma. Inclui checkout próprio com
Stripe (cartão de crédito) e Mercado Pago (PIX), em modo sandbox/teste.

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** — tema dourado/preto/branco com tipografia serifada
- **Prisma** + **SQLite** (dev) — pronto para migrar para PostgreSQL
- **Zustand** — carrinho de compras persistido em `localStorage`
- **Stripe** (`@stripe/react-stripe-js`, `@stripe/stripe-js`, `stripe`) —
  Payment Intents + Stripe Elements (UI própria)
- **Mercado Pago** (`mercadopago`) — geração de PIX (QR Code / copia-e-cola)
- **Zod** — validação de payloads de API

## Como rodar

Pré-requisito: Node.js 18+ e npm instalados.

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
copy .env.example .env
# edite .env com suas chaves de TESTE do Stripe e sandbox do Mercado Pago

# 3. Criar banco de dados e popular com produtos de exemplo
npx prisma migrate dev --name init
npx prisma db seed

# 4. Rodar em desenvolvimento
npm run dev
```

Acesse http://localhost:3000

## Testando pagamentos (modo sandbox)

### Cartão de crédito (Stripe)
Use o cartão de teste `4242 4242 4242 4242`, qualquer data de validade
futura e qualquer CVC. Para receber os webhooks localmente, use o
[Stripe CLI](https://stripe.com/docs/stripe-cli):

```bash
stripe listen --forward-to localhost:3000/api/payments/stripe/webhook
```

### PIX (Mercado Pago)
Use credenciais `TEST-...` do painel sandbox do Mercado Pago. Em ambiente
de desenvolvimento local, o webhook do Mercado Pago exige uma URL pública
(use [ngrok](https://ngrok.com/) ou similar) apontando para
`/api/payments/mercadopago/webhook`.

## Estrutura de pastas

```
src/
├─ app/                  # rotas (App Router) e API routes
│  ├─ categorias/[slug]/
│  ├─ produto/[slug]/
│  ├─ carrinho/
│  ├─ checkout/
│  ├─ pedido/[id]/confirmacao/
│  ├─ sobre/
│  ├─ contato/
│  └─ api/
│     ├─ orders/
│     └─ payments/{stripe,mercadopago}/
├─ components/           # layout, product, checkout, ui
├─ lib/                  # prisma, stripe, mercadopago, validation, format
├─ store/                # cartStore (Zustand)
└─ types/                # tipos compartilhados
prisma/
├─ schema.prisma
└─ seed.ts               # categorias e produtos de exemplo
```

## Observações importantes

- Nenhuma credencial real de pagamento está incluída — apenas placeholders
  de teste em `.env.example`.
- O schema Prisma usa SQLite para simplicidade local; strings são usadas
  no lugar de `enum` nativo porque SQLite não suporta enums no Prisma
  (validação de valores é feita via Zod). Para produção com PostgreSQL, é
  possível voltar a usar `enum` nativo do Prisma.
- Este ambiente de desenvolvimento não possui Node.js/npm instalados, então
  o build/typecheck não pôde ser executado automaticamente aqui — rode
  `npm install && npm run build` no seu ambiente local para validar.
