import { WHATSAPP_MESSAGE, WHATSAPP_NUMBER } from "@/lib/constants";

export function WhatsAppButton({ whatsappNumber }: { whatsappNumber?: string }) {
  const number = whatsappNumber || WHATSAPP_NUMBER;
  const href = `https://wa.me/${number}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Fale conosco no WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105"
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.28-1.39c1.44.78 3.06 1.2 4.72 1.2h.01c5.46 0 9.9-4.45 9.9-9.9C21.91 6.45 17.5 2 12.04 2zm5.83 14.07c-.24.68-1.4 1.3-1.94 1.38-.5.08-1.13.11-1.82-.11-.42-.14-.96-.32-1.66-.62-2.92-1.26-4.83-4.2-4.98-4.4-.15-.2-1.2-1.6-1.2-3.04 0-1.45.76-2.16 1.03-2.46.27-.3.6-.37.8-.37h.57c.18 0 .42-.03.65.5.24.55.8 1.9.87 2.04.07.14.12.3.02.5-.1.2-.15.32-.3.5-.15.18-.31.4-.44.53-.15.15-.3.31-.13.6.17.3.75 1.25 1.62 2.03 1.12 1 2.06 1.31 2.36 1.46.3.15.47.13.65-.08.18-.2.75-.87.95-1.17.2-.3.4-.25.66-.15.27.1 1.7.8 1.99.95.3.15.5.22.57.35.07.13.07.75-.17 1.43z" />
      </svg>
    </a>
  );
}
