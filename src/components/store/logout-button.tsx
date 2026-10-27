"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function LogoutButton({ className = "" }: { className?: string }) {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/");
        router.refresh();
      }}
      className={`flex items-center gap-2 py-2 text-sm text-fog hover:text-bad ${className}`}
    >
      <LogOut className="size-4" /> Sair
    </button>
  );
}
