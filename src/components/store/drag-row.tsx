"use client";

import { Children, useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Fileira que se arrasta para o lado: mouse (arrastar), toque (nativo), setas e
 * teclado. Mostra uma barra de progresso e esmaece as bordas quando há mais itens.
 */
export function DragRow({ children, label }: { children: React.ReactNode; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, startX: 0, startLeft: 0, moved: 0 });
  const [state, setState] = useState({ progress: 0, canPrev: false, canNext: true, dragging: false });

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setState((s) => ({
      ...s,
      progress: max > 0 ? el.scrollLeft / max : 0,
      canPrev: el.scrollLeft > 4,
      canNext: el.scrollLeft < max - 4,
    }));
  }, []);

  useEffect(() => {
    measure();
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measure]);

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    const el = ref.current!;
    drag.current = { active: true, startX: e.clientX, startLeft: el.scrollLeft, moved: 0 };
    el.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d.active) return;
    const dx = e.clientX - d.startX;
    d.moved = Math.max(d.moved, Math.abs(dx));
    if (d.moved > 5 && !state.dragging) setState((s) => ({ ...s, dragging: true }));
    ref.current!.scrollLeft = d.startLeft - dx;
  }

  function end(e: React.PointerEvent<HTMLDivElement>) {
    if (!drag.current.active) return;
    drag.current.active = false;
    ref.current?.releasePointerCapture(e.pointerId);
    setState((s) => ({ ...s, dragging: false }));
  }

  function page(dir: 1 | -1) {
    const el = ref.current!;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  }

  return (
    <div className="group/row relative">
      <div
        ref={ref}
        role="group"
        aria-label={label}
        tabIndex={0}
        onScroll={measure}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={end}
        onPointerCancel={end}
        // Depois de arrastar, o clique que "sobra" não deve abrir o produto.
        onClickCapture={(e) => {
          if (drag.current.moved > 5) {
            e.preventDefault();
            e.stopPropagation();
            drag.current.moved = 0;
          }
        }}
        onDragStart={(e) => e.preventDefault()}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") page(1);
          if (e.key === "ArrowLeft") page(-1);
        }}
        className={`scrollbar-none -mx-4 flex scroll-pl-4 gap-3 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:scroll-pl-6 sm:gap-4 sm:px-6 ${
          state.dragging ? "cursor-grabbing select-none" : "cursor-grab snap-x snap-mandatory"
        }`}
      >
        {Children.map(children, (child) => (
          <div className="w-[64vw] max-w-[300px] shrink-0 snap-start sm:w-[280px] lg:w-[300px]">{child}</div>
        ))}
        <div className="w-1 shrink-0" aria-hidden />
      </div>

      <div className="mt-4 flex items-center gap-4">
        <div className="h-[3px] flex-1 bg-plate" aria-hidden>
          <div className="h-full bg-ember transition-[width] duration-150" style={{ width: `${Math.max(8, state.progress * 100)}%` }} />
        </div>
        <div className="flex gap-1.5">
          <button onClick={() => page(-1)} disabled={!state.canPrev} aria-label="Ver anteriores" className="chamfer-sm grid size-9 place-items-center bg-plate text-chalk transition-colors hover:bg-ember hover:text-void disabled:opacity-30 disabled:hover:bg-plate disabled:hover:text-chalk">
            <ChevronLeft className="size-4" />
          </button>
          <button onClick={() => page(1)} disabled={!state.canNext} aria-label="Ver próximos" className="chamfer-sm grid size-9 place-items-center bg-plate text-chalk transition-colors hover:bg-ember hover:text-void disabled:opacity-30 disabled:hover:bg-plate disabled:hover:text-chalk">
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
