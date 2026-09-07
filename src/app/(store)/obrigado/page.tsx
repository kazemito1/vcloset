import type { Metadata } from "next";
import { ObrigadoContent } from "./ObrigadoContent";

export const metadata: Metadata = {
  title: "Pedido recebido — V.CLOSET",
};

export default function ObrigadoPage() {
  return <ObrigadoContent />;
}
