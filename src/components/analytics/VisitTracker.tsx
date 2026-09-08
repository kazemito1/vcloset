"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const visitedKey = "vcloset-last-path";
    const lastPath = sessionStorage.getItem(visitedKey);

    if (lastPath === pathname) return;

    const first = lastPath === null;
    const isCheckout = pathname.startsWith("/checkout");

    // Telegram: notificar SOMENTE novo acesso (lead novo) ou abertura do
    // checkout. Navegação interna comum não é enviada.
    if (!first && !isCheckout) {
      sessionStorage.setItem(visitedKey, pathname);
      return;
    }

    sessionStorage.setItem(visitedKey, pathname);

    const payload = {
      path: pathname,
      referer: document.referrer || "",
      userAgent: navigator.userAgent || "",
      lang: navigator.language || "",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
      screen: `${window.screen.width}x${window.screen.height}`,
      first,
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
