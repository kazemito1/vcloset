"use client";

import { useState } from "react";

const inputClass =
  "w-full border border-gold-400/40 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink/40 focus:border-gold-400 focus:outline-none";

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <div className="container-page py-16 md:py-24">
      <h1 className="section-title text-left">Fale Conosco</h1>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div>
          <h2 className="font-serif text-xl text-ink">Informações de contato</h2>
          <ul className="mt-4 space-y-3 text-ink/70">
            <li>E-mail: contato@vcloset.com.br</li>
            <li>Telefone: (11) 4000-0000</li>
            <li>Atendimento: Segunda a sexta, 9h às 18h</li>
            <li>Endereço: Av. das Joias, 1000 - São Paulo/SP</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input className={inputClass} placeholder="Nome" required />
          <input className={inputClass} type="email" placeholder="E-mail" required />
          <textarea className={inputClass} placeholder="Mensagem" rows={5} required />
          <button type="submit" className="btn-gold w-full">
            {sent ? "Mensagem enviada ✓" : "Enviar mensagem"}
          </button>
        </form>
      </div>
    </div>
  );
}
