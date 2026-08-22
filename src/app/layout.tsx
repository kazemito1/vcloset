import type { Metadata } from "next";
import "./globals.css";
import { STORE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `${STORE_NAME} | Joias de Luxo`,
  description:
    "V.CLOSET — joalheria online com peças exclusivas em ouro, prata e materiais nobres. Anéis, colares, brincos, pulseiras, relógios e alianças.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
