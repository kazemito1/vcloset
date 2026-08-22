"use client";

import { useState } from "react";
import { formatBRL } from "@/lib/format";

interface Variant {
  id: string;
  label: string;
  stock: number;
}

interface Product {
  id: string;
  name: string;
  priceCents: number;
  category: { name: string };
  variants: Variant[];
}

const LOW_STOCK_THRESHOLD = 5;

function stockBadgeClass(stock: number): string {
  if (stock <= 0) return "bg-red-500/15 text-red-400";
  if (stock <= LOW_STOCK_THRESHOLD) return "bg-amber-500/15 text-amber-400";
  return "bg-emerald-500/15 text-emerald-400";
}

function stockLabel(stock: number): string {
  if (stock <= 0) return "Esgotado";
  if (stock <= LOW_STOCK_THRESHOLD) return "Estoque baixo";
  return "Em estoque";
}

export function StockManager({ products }: { products: Product[] }) {
  const [data, setData] = useState(products);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [errorId, setErrorId] = useState<string | null>(null);

  async function handleStockChange(productId: string, variantId: string, newStock: number) {
    if (!Number.isFinite(newStock) || newStock < 0) return;

    setSavingId(variantId);
    setErrorId(null);

    try {
      const res = await fetch(`/api/admin/estoque/${variantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: newStock }),
      });

      if (!res.ok) {
        setErrorId(variantId);
        return;
      }

      setData((prev) =>
        prev.map((p) =>
          p.id !== productId
            ? p
            : {
                ...p,
                variants: p.variants.map((v) =>
                  v.id === variantId ? { ...v, stock: newStock } : v
                ),
              }
        )
      );
    } catch {
      setErrorId(variantId);
    } finally {
      setSavingId(null);
    }
  }

  const totalLowStock = data.reduce(
    (acc, p) => acc + p.variants.filter((v) => v.stock > 0 && v.stock <= LOW_STOCK_THRESHOLD).length,
    0
  );
  const totalOutOfStock = data.reduce(
    (acc, p) => acc + p.variants.filter((v) => v.stock <= 0).length,
    0
  );

  return (
    <div>
      {(totalLowStock > 0 || totalOutOfStock > 0) && (
        <div className="mb-4 flex flex-wrap gap-3">
          {totalOutOfStock > 0 && (
            <span className="rounded-md bg-red-500/15 px-3 py-1.5 text-sm text-red-400">
              {totalOutOfStock} variante(s) esgotada(s)
            </span>
          )}
          {totalLowStock > 0 && (
            <span className="rounded-md bg-amber-500/15 px-3 py-1.5 text-sm text-amber-400">
              {totalLowStock} variante(s) com estoque baixo (≤ {LOW_STOCK_THRESHOLD})
            </span>
          )}
        </div>
      )}

      <div className="admin-table-wrap">
        <table className="w-full text-sm">
          <thead className="admin-table-th">
            <tr>
              <th className="px-4 py-3">Produto</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Preço</th>
              <th className="px-4 py-3">Variante</th>
              <th className="px-4 py-3">Estoque</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.flatMap((p) =>
              p.variants.length === 0 ? (
                <tr key={p.id} className="admin-table-row">
                  <td className="px-4 py-3 text-cream">{p.name}</td>
                  <td className="px-4 py-3 text-cream/50">{p.category.name}</td>
                  <td className="px-4 py-3 text-cream">{formatBRL(p.priceCents)}</td>
                  <td colSpan={3} className="px-4 py-3 text-cream/30">
                    Sem variantes cadastradas
                  </td>
                </tr>
              ) : (
                p.variants.map((v, idx) => (
                  <tr key={v.id} className="admin-table-row">
                    {idx === 0 && (
                      <>
                        <td rowSpan={p.variants.length} className="px-4 py-3 align-top text-cream">
                          {p.name}
                        </td>
                        <td rowSpan={p.variants.length} className="px-4 py-3 align-top text-cream/50">
                          {p.category.name}
                        </td>
                        <td rowSpan={p.variants.length} className="px-4 py-3 align-top text-cream">
                          {formatBRL(p.priceCents)}
                        </td>
                      </>
                    )}
                    <td className="px-4 py-3 text-cream/70">{v.label}</td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min={0}
                        defaultValue={v.stock}
                        disabled={savingId === v.id}
                        onBlur={(e) => {
                          const newValue = parseInt(e.target.value, 10);
                          if (!Number.isNaN(newValue) && newValue !== v.stock) {
                            handleStockChange(p.id, v.id, newValue);
                          }
                        }}
                        className="admin-input w-24"
                      />
                      {errorId === v.id && (
                        <p className="mt-1 text-xs text-red-400">Erro ao salvar</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${stockBadgeClass(v.stock)}`}>
                        {stockLabel(v.stock)}
                      </span>
                    </td>
                  </tr>
                ))
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
