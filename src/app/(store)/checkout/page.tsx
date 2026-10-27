import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { getSettings } from "@/lib/db";
import { CheckoutForm } from "@/components/store/checkout-form";

export const metadata: Metadata = { title: "Finalizar compra" };

export default async function Checkout() {
  const user = await requireUser("/checkout");
  const settings = await getSettings();
  return (
    <div className="mx-auto max-w-[1180px] px-4 pb-10 pt-8 sm:px-6">
      <h1 className="display mb-8 text-[clamp(3rem,7vw,5.5rem)]">Finalizar compra</h1>
      <CheckoutForm
        user={{ name: user.name, phone: user.phone ?? "", addresses: user.addresses }}
        deliveryFee={settings.deliveryFee}
        freeShippingOver={settings.freeShippingOver}
        storeAddress={settings.address}
      />
    </div>
  );
}
