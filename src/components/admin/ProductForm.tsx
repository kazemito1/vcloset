"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Category {
  id: string;
  name: string;
}

interface Variant {
  label: string;
  stock: number;
}

interface ProductFormValues {
  id?: string;
  name: string;
  description: string;
  material: string;
  priceCents: number;
  salePriceCents?: number | null;
  targetGender?: string;
  categoryId: string;
  featured: boolean;
  images: string[];
  variants: Variant[];
}

interface Props {
  initial?: ProductFormValues;
}

export function ProductForm({ initial }: Props) {
  const router = useRouter();
  const isEditing = !!initial?.id;

  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState(initial?.name || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [material, setMaterial] = useState(initial?.material || "");
  const [priceReais, setPriceReais] = useState(
    initial ? (initial.priceCents / 100).toFixed(2) : ""
  );
  const [salePriceReais, setSalePriceReais] = useState(
    initial?.salePriceCents ? (initial.salePriceCents / 100).toFixed(2) : ""
  );
  const [targetGender, setTargetGender] = useState(initial?.targetGender || "unissex");
  const [categoryId, setCategoryId] = useState(initial?.categoryId || "");
  const [featured, setFeatured] = useState(initial?.featured || false);
  const [imagesText, setImagesText] = useState((initial?.images || []).join("\n"));
  const [variants, setVariants] = useState<Variant[]>(
    initial?.variants && initial.variants.length > 0
      ? initial.variants
      : [{ label: "", stock: 10 }]
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/categorias")
      .then((r) => r.json())
      .then((data) => {
        setCategories(data);
        if (!categoryId && data.length > 0) setCategoryId(data[0].id);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateVariant(idx: number, field: keyof Variant, value: string) {
    setVariants((prev) =>
      prev.map((v, i) =>
        i === idx
          ? { ...v, [field]: field === "stock" ? Number(value) || 0 : value }
          : v
      )
    );
  }

  function addVariant() {
    setVariants((prev) => [...prev, { label: "", stock: 10 }]);
  }

  function removeVariant(idx: number) {
    setVariants((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const priceCents = Math.round(parseFloat(priceReais.replace(",", ".")) * 100);
    if (!name || !description || !material || !categoryId || isNaN(priceCents)) {
      setError("Preencha todos os campos obrigatórios corretamente");
      return;
    }

    const salePriceCents = salePriceReais.trim()
      ? Math.round(parseFloat(salePriceReais.replace(",", ".")) * 100)
      : null;
    if (salePriceCents !== null && (isNaN(salePriceCents) || salePriceCents >= priceCents)) {
      setError("Preço promocional deve ser um número menor que o preço normal");
      return;
    }

    const images = imagesText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      name,
      description,
      material,
      priceCents,
      salePriceCents,
      targetGender,
      categoryId,
      featured,
      images,
      variants: variants.filter((v) => v.label.trim()),
    };

    setSaving(true);
    const url = isEditing ? `/api/admin/produtos/${initial!.id}` : "/api/admin/produtos";
    const method = isEditing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Erro ao salvar produto");
      return;
    }

    router.push("/admin/produtos");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 max-w-2xl space-y-5">
      <div>
        <label className="admin-label">Nome</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="admin-input mt-1 w-full"
          required
        />
      </div>

      <div>
        <label className="admin-label">Descrição</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="admin-input mt-1 w-full"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="admin-label">Material</label>
          <input
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
            placeholder="Ex: Ouro 18k"
            className="admin-input mt-1 w-full"
            required
          />
        </div>
        <div>
          <label className="admin-label">Preço (R$)</label>
          <input
            value={priceReais}
            onChange={(e) => setPriceReais(e.target.value)}
            placeholder="Ex: 1299.00"
            className="admin-input mt-1 w-full"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="admin-label">Preço promocional (R$) — opcional</label>
          <input
            value={salePriceReais}
            onChange={(e) => setSalePriceReais(e.target.value)}
            placeholder="Ex: 999.00"
            className="admin-input mt-1 w-full"
          />
          <p className="mt-1 text-xs text-cream/30">
            Preenchido = produto aparece na página Sale com desconto.
          </p>
        </div>
        <div>
          <label className="admin-label">Público-alvo</label>
          <select
            value={targetGender}
            onChange={(e) => setTargetGender(e.target.value)}
            className="admin-input mt-1 w-full"
          >
            <option value="unissex">Unissex</option>
            <option value="feminino">Feminino</option>
            <option value="masculino">Masculino</option>
          </select>
          <p className="mt-1 text-xs text-cream/30">
            Usado na curadoria da página Masculino.
          </p>
        </div>
      </div>

      <div>
        <label className="admin-label">Categoria</label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="admin-input mt-1 w-full"
          required
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="admin-label">
          Imagens (uma URL/caminho por linha)
        </label>
        <textarea
          value={imagesText}
          onChange={(e) => setImagesText(e.target.value)}
          rows={3}
          placeholder="/products/placeholder-aneis.svg"
          className="admin-input mt-1 w-full font-mono"
        />
        <p className="mt-1 text-xs text-cream/30">
          Deixe em branco para usar uma imagem placeholder padrão.
        </p>
      </div>

      <div>
        <label className="admin-label">
          Variantes (tamanho/opção + estoque)
        </label>
        <div className="mt-2 space-y-2">
          {variants.map((v, idx) => (
            <div key={idx} className="flex gap-2">
              <input
                value={v.label}
                onChange={(e) => updateVariant(idx, "label", e.target.value)}
                placeholder="Ex: Aro 16"
                className="admin-input flex-1"
              />
              <input
                type="number"
                value={v.stock}
                onChange={(e) => updateVariant(idx, "stock", e.target.value)}
                placeholder="Estoque"
                className="admin-input w-28"
              />
              <button
                type="button"
                onClick={() => removeVariant(idx)}
                className="rounded-md border border-red-500/30 px-3 text-sm text-red-400"
              >
                Remover
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addVariant}
          className="mt-2 text-sm text-gold-400 hover:underline"
        >
          + Adicionar variante
        </button>
      </div>

      <label className="flex items-center gap-2 text-sm text-cream/70">
        <input
          type="checkbox"
          checked={featured}
          onChange={(e) => setFeatured(e.target.checked)}
        />
        Produto em destaque na Home
      </label>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="admin-btn-primary"
        >
          {saving ? "Salvando..." : isEditing ? "Salvar alterações" : "Criar produto"}
        </button>
      </div>
    </form>
  );
}
