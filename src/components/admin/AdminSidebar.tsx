"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { STORE_NAME } from "@/lib/constants";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", superAdminOnly: false },
  { label: "Produtos", href: "/admin/produtos", superAdminOnly: false },
  { label: "Categorias", href: "/admin/categorias", superAdminOnly: false },
  { label: "Estoque", href: "/admin/estoque", superAdminOnly: false },
  { label: "Pedidos", href: "/admin/pedidos", superAdminOnly: false },
  { label: "Cupons", href: "/admin/cupons", superAdminOnly: false },
  { label: "Indicações", href: "/admin/indicacoes", superAdminOnly: false },
  { label: "Relatórios", href: "/admin/relatorios", superAdminOnly: false },
  { label: "Financeiro", href: "/admin/financeiro", superAdminOnly: true },
  { label: "Créditos", href: "/admin/creditos", superAdminOnly: true },
  { label: "Usuários", href: "/admin/usuarios", superAdminOnly: true },
  { label: "Atividades", href: "/admin/atividades", superAdminOnly: true },
  { label: "Configurações", href: "/admin/configuracoes", superAdminOnly: true },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setRole(data.role);
          setName(data.name);
        }
      })
      .catch(() => {});
  }, []);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  const visibleItems = NAV_ITEMS.filter((item) => !item.superAdminOnly || role === "SUPER_ADMIN");

  return (
    <aside className="admin-sidebar flex h-screen w-60 flex-shrink-0 flex-col">
      <div className="border-b border-gold-400/15 px-5 py-5">
        <p className="text-sm font-semibold text-gold-400">{STORE_NAME}</p>
        <p className="text-xs text-cream/40">Painel Admin</p>
        {name && (
          <p className="mt-2 truncate text-xs text-cream/50">
            {name} <span className="text-gold-400/70">· {role === "SUPER_ADMIN" ? "Admin" : "Operador"}</span>
          </p>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {visibleItems.map((item) => {
          const active =
            item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                active ? "bg-gold-400 text-ink" : "text-cream/60 hover:bg-gold-400/10 hover:text-cream"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gold-400/15 p-3">
        <Link
          href="/"
          target="_blank"
          className="block rounded-md px-3 py-2 text-sm text-cream/50 hover:bg-gold-400/10 hover:text-cream"
        >
          Ver loja ↗
        </Link>
        <button
          onClick={handleLogout}
          className="mt-1 block w-full rounded-md px-3 py-2 text-left text-sm text-red-400 hover:bg-red-500/10"
        >
          Sair
        </button>
      </div>
    </aside>
  );
}
