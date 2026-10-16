import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { getStoreSettings } from "@/lib/storeSettings";
import { VisitTracker } from "@/components/analytics/VisitTracker";
import { CategoryTransitionProvider } from "@/components/store/CategoryTransition";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const settings = await getStoreSettings();

  return (
    <CategoryTransitionProvider>
      <Header settings={settings} />
      <main className="min-h-screen">{children}</main>
      <Footer settings={settings} />
      <WhatsAppButton whatsappNumber={settings.whatsappNumber} />
      <VisitTracker />
    </CategoryTransitionProvider>
  );
}
