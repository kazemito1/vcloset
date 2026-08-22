"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatBRL } from "@/lib/format";

interface Expense {
  id: string;
  description: string;
  amountCents: number;
  category: string;
  date: string;
}

export function ExpenseTable({ expenses }: { expenses: Expense[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir esta despesa?")) return;
    setDeletingId(id);
    const res = await fetch(`/api/admin/financeiro/despesas/${id}`, { method: "DELETE" });
    setDeletingId(null);
    if (res.ok) {
      router.refresh();
    }
  }

  return (
    <div className="admin-table-wrap mt-6">
      <table className="w-full text-sm">
        <thead className="admin-table-th">
          <tr>
            <th className="px-4 py-3">Data</th>
            <th className="px-4 py-3">Descrição</th>
            <th className="px-4 py-3">Categoria</th>
            <th className="px-4 py-3 text-right">Valor</th>
            <th className="px-4 py-3 text-right">Ações</th>
          </tr>
        </thead>
        <tbody>
          {expenses.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-6 text-center text-cream/30">
                Nenhuma despesa cadastrada
              </td>
            </tr>
          ) : (
            expenses.map((exp) => (
              <tr key={exp.id} className="admin-table-row">
                <td className="px-4 py-3 text-cream/50">
                  {new Date(exp.date).toLocaleDateString("pt-BR")}
                </td>
                <td className="px-4 py-3 text-cream">{exp.description}</td>
                <td className="px-4 py-3 text-cream/50">{exp.category}</td>
                <td className="px-4 py-3 text-right text-red-400">
                  -{formatBRL(exp.amountCents)}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleDelete(exp.id)}
                    disabled={deletingId === exp.id}
                    className="text-sm text-red-400 hover:underline"
                  >
                    {deletingId === exp.id ? "Excluindo..." : "Excluir"}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
