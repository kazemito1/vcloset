import { MercadoPagoConfig, Payment } from "mercadopago";

const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || "TEST-placeholder";

export const mpClient = new MercadoPagoConfig({
  accessToken,
});

export const mpPayment = new Payment(mpClient);
