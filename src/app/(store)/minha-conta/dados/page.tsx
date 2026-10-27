import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { ProfileForm, PasswordForm, Addresses } from "@/components/store/account-forms";

export const metadata: Metadata = { title: "Meus dados" };

export default async function Dados() {
  const user = await requireUser("/minha-conta/dados");
  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div className="space-y-10">
        <section>
          <h2 className="mb-4 text-lg font-bold">Seus dados</h2>
          <ProfileForm name={user.name} phone={user.phone ?? ""} email={user.email} />
        </section>
        <section>
          <h2 className="mb-4 text-lg font-bold">Trocar senha</h2>
          <PasswordForm />
        </section>
      </div>
      <section>
        <h2 className="mb-4 text-lg font-bold">Endereços de entrega</h2>
        <Addresses initial={user.addresses} />
      </section>
    </div>
  );
}
