import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { AuthForm } from "@/components/store/auth-form";
import { AuthShell } from "@/components/store/auth-shell";

export const metadata: Metadata = { title: "Criar conta" };

export default async function Cadastro({ searchParams }: PageProps<"/cadastro">) {
  const { next } = (await searchParams) as { next?: string };
  if (await currentUser()) redirect(next ?? "/minha-conta");
  return (
    <AuthShell title="Novo jogador na área." text="Crie sua conta em menos de um minuto e acompanhe cada pedido até chegar na sua mão.">
      <AuthForm mode="register" next={next} />
    </AuthShell>
  );
}
