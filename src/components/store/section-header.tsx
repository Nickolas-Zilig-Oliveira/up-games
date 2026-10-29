import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

/** Cabeçalho padrão das seções da loja: título, uma linha de apoio e o link "Ver tudo". */
export function SectionHeader({ id, title, text, href, linkLabel = "Ver tudo" }: { id?: string; title: React.ReactNode; text?: string; href?: string; linkLabel?: string }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div className="min-w-0">
        <h2 id={id} className="display t-section">{title}</h2>
        {text && <p className="mt-2 max-w-[56ch] text-fog">{text}</p>}
      </div>
      {href && (
        <Link href={href} className="flex shrink-0 items-center gap-1 pb-1 text-sm font-semibold text-ember transition-colors hover:text-gold">
          {linkLabel} <ArrowUpRight className="size-4" />
        </Link>
      )}
    </div>
  );
}
