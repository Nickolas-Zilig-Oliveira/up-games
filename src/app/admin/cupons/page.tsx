import type { Metadata } from "next";
import { read } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { CouponManager } from "@/components/admin/coupon-manager";

export const metadata: Metadata = { title: "Cupons" };

export default async function Cupons() {
  const db = await read();
  return (
    <>
      <PageHeader title="Cupons" text="Códigos de desconto que o cliente digita no checkout. Divulgue no Instagram ou no aviso do topo da loja." />
      <CouponManager coupons={db.coupons} />
    </>
  );
}
