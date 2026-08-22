import Link from "next/link";
import { CATEGORIES, STORE_NAME } from "@/lib/constants";
import { Newsletter } from "@/components/layout/Newsletter";

interface FooterProps {
  settings?: {
    storeName: string;
    storeSlogan: string | null;
    instagramUrl: string | null;
    facebookUrl: string | null;
    tiktokUrl: string | null;
  };
}

export function Footer({ settings }: FooterProps) {
  const storeName = settings?.storeName || STORE_NAME;
  const socialLinks = [
    { label: "Instagram", url: settings?.instagramUrl },
    { label: "Facebook", url: settings?.facebookUrl },
    { label: "TikTok", url: settings?.tiktokUrl },
  ].filter((s) => !!s.url);

  return (
    <footer className="border-t border-gold-400/30 bg-ink text-cream">
      <Newsletter />
      <div className="container-page grid grid-cols-1 gap-10 py-14 md:grid-cols-4">
        <div>
          <h3 className="font-serif text-2xl tracking-widest2 text-gold-400">{storeName}</h3>
          <p className="mt-4 text-sm text-cream/70">
            {settings?.storeSlogan ||
              "Joias atemporais para momentos únicos. Peças exclusivas em ouro, prata e materiais nobres."}
          </p>
        </div>

        <div>
          <h4 className="mb-4 text-sm uppercase tracking-widest2 text-gold-400">Categorias</h4>
          <ul className="space-y-2 text-sm text-cream/70">
            {CATEGORIES.map((cat) => (
              <li key={cat.slug}>
                <Link href={`/categorias/${cat.slug}`} className="hover:text-gold-400">
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-sm uppercase tracking-widest2 text-gold-400">Institucional</h4>
          <ul className="space-y-2 text-sm text-cream/70">
            <li>
              <Link href="/sobre" className="hover:text-gold-400">Sobre nós</Link>
            </li>
            <li>
              <Link href="/contato" className="hover:text-gold-400">Contato</Link>
            </li>
            <li>
              <Link href="/carrinho" className="hover:text-gold-400">Carrinho</Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-sm uppercase tracking-widest2 text-gold-400">Atendimento</h4>
          <ul className="space-y-2 text-sm text-cream/70">
            <li>contato@vcloset.com.br</li>
            <li>(11) 4000-0000</li>
            <li>Seg a Sex, 9h às 18h</li>
          </ul>
          {socialLinks.length > 0 && (
            <ul className="mt-4 flex gap-3 text-sm text-cream/70">
              {socialLinks.map((s) => (
                <li key={s.label}>
                  <a href={s.url!} target="_blank" rel="noopener noreferrer" className="hover:text-gold-400">
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="border-t border-gold-400/10 py-6 text-center text-xs text-cream/50">
        © {new Date().getFullYear()} {storeName}. Todos os direitos reservados.
      </div>
    </footer>
  );
}
