import type { Metadata } from "next";
import { PagamentoRecusadoContent } from "./PagamentoRecusadoContent";

export const metadata: Metadata = {
  title: "Problema no pagamento — V.CLOSET",
};

export default function PagamentoRecusadoPage() {
  return <PagamentoRecusadoContent />;
}
