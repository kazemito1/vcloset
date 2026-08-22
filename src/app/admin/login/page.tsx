"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { STORE_NAME } from "@/lib/constants";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Falha ao entrar");
        return;
      }

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm rounded-lg border border-gold-400/20 bg-ink-soft p-8">
        <h1 className="text-center text-xl font-semibold text-cream">
          {STORE_NAME} <span className="text-gold-400">| Admin</span>
        </h1>
        <p className="mt-1 text-center text-sm text-cream/50">
          Acesso restrito à equipe da loja
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="admin-label">
              E-mail <span className="text-cream/40">(opcional para senha única)</span>
            </label>
            <input
              id="email"
              type="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="admin-input mt-1 w-full"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="admin-label">
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="admin-input mt-1 w-full"
              required
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="admin-btn-primary w-full"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
