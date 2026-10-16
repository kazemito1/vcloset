"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const notifiedKey = "vcloset-lead-notified";

    // Telegram: avisa o lojista sobre um novo lead UMA ÚNICA vez por
    // navegador (persistente, sobrevive a abas/sessões). O servidor também
    // deduplica por IP — navegar entre categorias/páginas nunca notifica.
    try {
      if (localStorage.getItem(notifiedKey)) return;
      localStorage.setItem(notifiedKey, "1");
    } catch {
      // localStorage indisponível: segue com o ping (servidor deduplica por IP)
    }

    const payload = {
      path: pathname,
      referer: document.referrer || "",
      userAgent: navigator.userAgent || "",
      lang: navigator.language || "",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
      screen: `${window.screen.width}x${window.screen.height}`,
      first: true,
    };

    fetch("/api/telegram/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  }, [pathname]);

  return null;
}
