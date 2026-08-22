import Link from "next/link";

interface Crumb {
  label: string;
  href?: string;
}

interface Props {
  items: Crumb[];
}

export function Breadcrumbs({ items }: Props) {
  return (
    <nav className="mb-6 text-xs uppercase tracking-wide text-ink/50">
      <Link href="/" className="hover:text-gold-600">
        Início
      </Link>
      {items.map((item, idx) => (
        <span key={idx}>
          <span className="mx-2">/</span>
          {item.href ? (
            <Link href={item.href} className="hover:text-gold-600">
              {item.label}
            </Link>
          ) : (
            <span className="text-ink">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
