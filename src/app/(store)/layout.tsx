import { currentUser } from "@/lib/auth";
import { read } from "@/lib/db";
import { Header } from "@/components/store/header";
import { Footer } from "@/components/store/footer";
import { CartDrawer } from "@/components/store/cart-drawer";
import { WhatsIcon } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [user, db] = await Promise.all([currentUser(), read()]);
  const s = db.settings;
  return (
    <div className="bg-field min-h-dvh">
      <Header user={user} announcement={s.announcementActive ? s.announcement : undefined} whatsapp={s.whatsapp} />
      <main>{children}</main>
      <Footer s={s} />
      <CartDrawer freeShippingOver={s.freeShippingOver} />
      <a
        href={`https://wa.me/${s.whatsapp}?text=${encodeURIComponent("Olá, Up Games! Vim pelo site.")}`}
        target="_blank"
        rel="noreferrer"
        className="chamfer-sm fixed bottom-5 right-5 z-30 grid size-14 place-items-center bg-[#25d366] text-[#06260f] shadow-xl transition-transform hover:scale-105"
        aria-label="Falar no WhatsApp"
      >
        <WhatsIcon className="size-7" />
      </a>
    </div>
  );
}
