import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { getStoreSettings } from "@/lib/storeSettings";
import { notifyNewVisit } from "@/lib/telegram";
import { headers } from "next/headers";
import { notifyNewVisit } from "@/lib/telegram";
import { headers } from "next/headers";
import { notifyNewVisit } from "@/lib/telegram";
import { headers } from "next/headers";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const settings = await getStoreSettings();
    const headersList = headers();
  const referer = headersList.get("referer") || "";

  if (headersList.get("sec-fetch-site") !== "same-origin") {
    notifyNewVisit({ path: "/", referer });
  }

  const headersList = headers();
  const referer = headersList.get("referer") || "";

  if (headersList.get("sec-fetch-site") !== "same-origin") {
    notifyNewVisit({ path: "/", referer });
  }

  return (
    <>
      <Header settings={settings} />
      <main className="min-h-screen">{children}</main>
      <Footer settings={settings} />
      <WhatsAppButton whatsappNumber={settings.whatsappNumber} />
    </>
  );
}
