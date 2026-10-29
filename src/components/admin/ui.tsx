export function PageHeader({ title, text, children }: { title: string; text?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div>
        <h1 className="display t-tool">{title}</h1>
        {text && <p className="mt-1.5 max-w-[68ch] text-sm text-fog sm:text-[0.95rem]">{text}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

export function Panel({
  title,
  action,
  children,
  className = "",
  hint,
  collapsible,
  defaultOpen = false,
}: {
  title?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  /** Uma linha explicando para que serve este bloco. */
  hint?: string;
  /** Vira um bloco que abre e fecha (fechado por padrão). */
  collapsible?: boolean;
  defaultOpen?: boolean;
}) {
  if (collapsible) {
    return (
      <details open={defaultOpen} className={`group chamfer-sm bg-deep ${className}`}>
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 [&::-webkit-details-marker]:hidden">
          <span>
            <span className="block font-semibold">{title}</span>
            {hint && <span className="mt-0.5 block text-sm text-fog">{hint}</span>}
          </span>
          <span className="text-xs font-semibold text-ember group-open:hidden">Abrir</span>
          <span className="hidden text-xs font-semibold text-dim group-open:inline">Fechar</span>
        </summary>
        <div className="px-5 pb-5">{children}</div>
      </details>
    );
  }
  return (
    <section className={`chamfer-sm bg-deep p-5 ${className}`}>
      {(title || action) && (
        <div className={`${hint ? "mb-1" : "mb-4"} flex items-center justify-between gap-3`}>
          {title && <h2 className="font-semibold">{title}</h2>}
          {action}
        </div>
      )}
      {hint && <p className="mb-4 text-sm text-fog">{hint}</p>}
      {children}
    </section>
  );
}

export function Empty({ title, text, children }: { title: string; text: string; children?: React.ReactNode }) {
  return (
    <div className="chamfer-sm flex flex-col items-center gap-3 bg-deep px-6 py-14 text-center">
      <p className="display text-3xl">{title}</p>
      <p className="max-w-[48ch] text-sm text-fog">{text}</p>
      {children}
    </div>
  );
}

/** Tabela com rolagem horizontal no celular. */
export function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="chamfer-sm overflow-x-auto bg-deep">
      <table className="w-full min-w-[720px] text-sm [&_td]:px-4 [&_td]:py-3 [&_th]:px-4 [&_th]:py-3 [&_th]:text-left [&_th]:text-xs [&_th]:font-semibold [&_th]:text-dim [&_thead]:border-b [&_thead]:border-line [&_tbody_tr]:border-b [&_tbody_tr]:border-line/60 [&_tbody_tr:last-child]:border-0 [&_tbody_tr:hover]:bg-plate/40">
        {children}
      </table>
    </div>
  );
}
