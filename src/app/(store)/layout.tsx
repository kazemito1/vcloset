import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { getStoreSettings } from "@/lib/storeSettings";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const settings = await getStoreSettings();

  return (
    <>
      <Header settings={settings} />
      <main className="min-h-screen">{children}</main>
      <Footer settings={settings} />
      <WhatsAppButton whatsappNumber={settings.whatsappNumber} />
    </>
  );
}
