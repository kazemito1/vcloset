"use client";

import { useCallback, useEffect, useState } from "react";

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
}

function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <div className="flex text-gold-500">
      {Array.from({ length: 5 }, (_, i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={i < value ? "currentColor" : "none"}
          stroke="currentColor"
        >
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            strokeWidth="1"
            strokeLinejoin="round"
          />
        </svg>
      ))}
    </div>
  );
}

export function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/avaliacoes?productId=${encodeURIComponent(productId)}`);
      if (res.ok) setReviews(await res.json());
    } catch {
      // silencioso: seção simplesmente não carrega
    }
    setLoading(false);
  }, [productId]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const res = await fetch("/api/avaliacoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, name, rating, comment }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Erro ao enviar avaliação");
      return;
    }

    setShowForm(false);
    setName("");
    setComment("");
    setRating(5);
    setSent(true);
  }

  return (
    <section className="mt-16 border-t border-gold-400/15 pt-10">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl text-ink">Avaliações de clientes</h2>
        <button
          onClick={() => {
            setShowForm((v) => !v);
            setSent(false);
          }}
          className="text-sm text-gold-600 hover:underline"
        >
          {showForm ? "Cancelar" : "Deixe sua avaliação"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-6 max-w-xl space-y-4">
          <div>
            <label className="mb-1 block text-xs uppercase tracking-widest2 text-ink/50">
              Sua nota
            </label>
            <div className="flex gap-1" onMouseLeave={() => setHoverRating(0)}>
              {[1, 2, 3, 4, 5].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setRating(v)}
                  onMouseEnter={() => setHoverRating(v)}
                  className={`transition-transform hover:scale-110 ${
                    v <= (hoverRating || rating) ? "text-gold-500" : "text-gold-500/25"
                  }`}
                  aria-label={`${v} estrelas`}
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill={v <= (hoverRating || rating) ? "currentColor" : "none"}
                    stroke="currentColor"
                  >
                    <path
                      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                      strokeWidth="1"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              ))}
            </div>
          </div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome (ex.: Mariana S.)"
            maxLength={40}
            className="w-full rounded-md border border-gold-400/20 bg-transparent px-3 py-2 text-sm text-ink placeholder:text-ink/30 focus:border-gold-400 focus:outline-none"
          />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Como foi sua experiência com esta peça?"
            maxLength={500}
            rows={4}
            className="w-full rounded-md border border-gold-400/20 bg-transparent px-3 py-2 text-sm text-ink placeholder:text-ink/30 focus:border-gold-400 focus:outline-none"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-gold-500 px-6 py-2 text-sm font-medium text-ink transition-colors hover:bg-gold-400 disabled:opacity-50"
          >
            {submitting ? "Enviando..." : "Enviar avaliação"}
          </button>
        </form>
      )}

      {sent && !showForm && (
        <p className="mt-6 rounded-md bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700">
          Obrigado! Sua avaliação foi enviada e aparecerá aqui após aprovação.
        </p>
      )}

      <div className="mt-8 space-y-6">
        {loading ? null : reviews.length === 0 ? (
          <p className="text-sm text-ink/40">
            Ainda não há avaliações para esta peça. Seja a primeira a avaliar.
          </p>
        ) : (
          reviews.map((r) => (
            <article key={r.id} className="border-b border-gold-400/10 pb-6 last:border-b-0">
              <div className="flex items-center gap-3">
                <Stars value={r.rating} />
                <span className="text-sm font-medium text-ink">{r.name}</span>
                <span className="text-xs text-ink/30">
                  {new Date(r.createdAt).toLocaleDateString("pt-BR")}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-ink/70">{r.comment}</p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
