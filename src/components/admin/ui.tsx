export function PageHeader({ title, text, children }: { title: string; text?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="display text-5xl sm:text-6xl">{title}</h1>
        {text && <p className="mt-2 max-w-[62ch] text-fog">{text}</p>}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2">{children}</div>}
    </div>
  );
}

export function Panel({ title, action, children, className = "" }: { title?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={`chamfer-sm bg-deep p-5 ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="font-semibold">{title}</h2>}
          {action}
        </div>
      )}
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
