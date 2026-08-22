import { z } from "zod";
import { isValidCpf, onlyDigits } from "@/lib/cpf";

// CEP brasileiro: exatamente 8 dígitos (aceita com ou sem hífen na entrada).
const zipCodeRegex = /^\d{5}-?\d{3}$/;
// Telefone BR: DDD (2 dígitos) + 8 ou 9 dígitos do número, com ou sem formatação.
const phoneDigitsRegex = /^\d{10,11}$/;

export const shippingAddressSchema = z.object({
  street: z.string().min(1),
  number: z.string().min(1),
  complement: z.string().optional(),
  neighborhood: z.string().min(1),
  city: z.string().min(1),
  state: z.string().length(2),
  zipCode: z.string().regex(zipCodeRegex, "CEP inválido"),
});

export const orderItemSchema = z.object({
  productId: z.string().min(1),
  productName: z.string().min(1),
  variantLabel: z.string().optional(),
  quantity: z.number().int().positive(),
  unitPriceCents: z.number().int().positive(),
});

export const createOrderSchema = z.object({
  customerName: z
    .string()
    .trim()
    .refine((v) => v.split(/\s+/).filter(Boolean).length >= 2, {
      message: "Informe o nome completo (nome e sobrenome)",
    }),
  customerEmail: z.string().email("E-mail inválido"),
  customerPhone: z
    .string()
    .optional()
    .refine((v) => !v || phoneDigitsRegex.test(onlyDigits(v)), {
      message: "Telefone inválido. Informe DDD + número (10 ou 11 dígitos)",
    }),
  customerCpf: z
    .string()
    .refine((v) => isValidCpf(v), { message: "CPF inválido" }),
  shippingAddress: shippingAddressSchema,
  paymentMethod: z.enum(["CREDIT_CARD", "PIX"]),
  items: z.array(orderItemSchema).min(1),
  // Código de cupom OU de indicação (mesmo campo no checkout, mesma validação)
  appliedCode: z.string().optional(),
  // Crédito virtual do indicador aplicado como desconto (fase de crédito de indicação)
  useCredit: z.boolean().optional(),
  creditCustomerEmail: z.string().email().optional(),
});
