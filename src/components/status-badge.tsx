import type { OrderStatus } from "@/lib/types";
import { statusLabel } from "@/lib/format";

const tone: Record<OrderStatus, string> = {
  pendente: "bg-gold/15 text-gold",
  pago: "bg-r-raro/15 text-r-raro",
  separando: "bg-violet/20 text-r-epico",
  enviado: "bg-ember/15 text-ember-2",
  entregue: "bg-ok/15 text-ok",
  cancelado: "bg-bad/15 text-bad",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap px-2 py-1 text-xs font-semibold ${tone[status]}`}>
      <span className="size-1.5 rotate-45 bg-current" />
      {statusLabel[status]}
    </span>
  );
}
