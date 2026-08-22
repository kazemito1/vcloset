"use client";

import { useState } from "react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
  }

  return (
    <div className="border-b border-gold-400/10 py-12">
      <div className="container-page flex flex-col items-center gap-4 text-center md:flex-row md:justify-between md:text-left">
        <div>
          <h3 className="font-serif text-xl text-cream">Receba nossas novidades</h3>
          <p className="mt-1 text-sm text-cream/60">
            Lançamentos, coleções exclusivas e ofertas especiais no seu e-mail.
          </p>
        </div>

        {submitted ? (
          <p className="text-sm text-gold-400">Obrigado! Você foi inscrito com sucesso.</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex w-full max-w-md gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Seu melhor e-mail"
              className="flex-1 border border-cream/20 bg-transparent px-4 py-2 text-sm text-cream placeholder:text-cream/40 focus:border-gold-400 focus:outline-none"
            />
            <button type="submit" className="btn-gold whitespace-nowrap">
              Inscrever
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
