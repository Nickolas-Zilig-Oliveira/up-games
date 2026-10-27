"use client";

import { useRouter } from "next/navigation";
import type { Role } from "@/lib/types";
import { api } from "@/lib/client";
import { useToast } from "../providers";

export function RoleToggle({ id, role }: { id: string; role: Role }) {
  const router = useRouter();
  const toast = useToast();
  return (
    <select
      className="field h-9 w-[130px] text-sm"
      value={role}
      onChange={async (e) => {
        const r = await api(`/api/admin/users/${id}`, "PATCH", { role: e.target.value });
        if (!r.ok) return toast(r.error, "bad");
        toast(e.target.value === "admin" ? "Agora essa pessoa tem acesso ao painel." : "Acesso ao painel removido.");
        router.refresh();
      }}
      aria-label="Tipo de acesso"
    >
      <option value="customer">Cliente</option>
      <option value="admin">Admin</option>
    </select>
  );
}
