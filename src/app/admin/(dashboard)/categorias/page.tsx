"use client";

import { useEffect, useState } from "react";

interface Category {
  id: string;
  name: string;
  slug: string;
  order: number;
  _count?: { products: number };
}

export default function AdminCategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/categorias");
    const data = await res.json();
    setCategories(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!newName.trim()) return;

    const res = await fetch("/api/admin/categorias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, order: categories.length + 1 }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Erro ao criar categoria");
      return;
    }

    setNewName("");
    load();
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setEditingName(cat.name);
  }

  async function saveEdit(id: string) {
    setError("");
    const res = await fetch(`/api/admin/categorias/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editingName }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Erro ao atualizar categoria");
      return;
    }

    setEditingId(null);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir esta categoria?")) return;
    setError("");
    const res = await fetch(`/api/admin/categorias/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Erro ao excluir categoria");
      return;
    }
    load();
  }

  return (
    <div>
      <h1 className="admin-title">Categorias</h1>
      <p className="admin-subtitle">Gerencie as categorias de produtos</p>

      <form onSubmit={handleCreate} className="mt-6 flex max-w-md gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Nome da nova categoria"
          className="admin-input flex-1"
        />
        <button type="submit" className="admin-btn-primary">
          Adicionar
        </button>
      </form>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      <div className="admin-table-wrap mt-6">
        <table className="w-full text-sm">
          <thead className="admin-table-th">
            <tr>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Produtos</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-cream/30">
                  Carregando...
                </td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-cream/30">
                  Nenhuma categoria cadastrada
                </td>
              </tr>
            ) : (
              categories.map((cat) => (
                <tr key={cat.id} className="admin-table-row">
                  <td className="px-4 py-3 text-cream">
                    {editingId === cat.id ? (
                      <input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="admin-input px-2 py-1"
                        autoFocus
                      />
                    ) : (
                      cat.name
                    )}
                  </td>
                  <td className="px-4 py-3 text-cream/40">{cat.slug}</td>
                  <td className="px-4 py-3 text-cream/70">{cat._count?.products ?? 0}</td>
                  <td className="px-4 py-3 text-right">
                    {editingId === cat.id ? (
                      <>
                        <button
                          onClick={() => saveEdit(cat.id)}
                          className="mr-2 text-emerald-400 hover:underline"
                        >
                          Salvar
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-cream/40 hover:underline"
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(cat)}
                          className="mr-3 admin-link"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="text-red-400 hover:underline"
                        >
                          Excluir
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
