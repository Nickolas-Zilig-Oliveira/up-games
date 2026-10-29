import { currentUser } from "@/lib/auth";
import { getNavCategories, getSettings } from "@/lib/db";
import { Header } from "@/components/store/header";
import { Footer } from "@/components/store/footer";
import { CartDrawer } from "@/components/store/cart-drawer";
import { WhatsIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [user, s, categories] = await Promise.all([currentUser(), getSettings(), getNavCategories()]);
  return (
    <div className="bg-field min-h-dvh">
      <Header user={user} announcement={s.announcementActive ? s.announcement : undefined} whatsapp={s.whatsapp} categories={categories} />
      <main>{children}</main>
      <Footer s={s} categories={categories} />
      <CartDrawer freeShippingOver={s.freeShippingOver} />
      <a
        href={`https://wa.me/${s.whatsapp}?text=${encodeURIComponent("Olá, Up Games! Vim pelo site.")}`}
        target="_blank"
        rel="noreferrer"
        className="chamfer-sm fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-30 grid size-12 place-items-center bg-[#25d366] text-[#06260f] shadow-[0_6px_20px_rgb(0_0_0/0.25)] transition-transform hover:scale-105 sm:bottom-6 sm:right-6 sm:size-14"
        aria-label="Falar no WhatsApp"
      >
        <WhatsIcon className="size-6 sm:size-7" />
      </a>
    </div>
  );
}
