import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { AuthForm } from "@/components/store/auth-form";
import { AuthShell } from "@/components/store/auth-shell";

export const metadata: Metadata = { title: "Entrar" };

export default async function Entrar({ searchParams }: PageProps<"/entrar">) {
  const { next } = (await searchParams) as { next?: string };
  const user = await currentUser();
  if (user) redirect(next ?? (user.role === "admin" ? "/admin" : "/minha-conta"));
  return (
    <AuthShell title="Continue de onde parou." text="Entre para acompanhar pedidos, salvar favoritos e finalizar compras mais rápido.">
      <AuthForm mode="login" next={next} />
    </AuthShell>
  );
}
