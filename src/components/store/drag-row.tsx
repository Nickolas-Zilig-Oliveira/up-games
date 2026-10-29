"use client";

import { Children, useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Fileira que desliza para o lado: arrastar com o mouse, deslizar com o dedo,
 * setas laterais e teclado. 4 cards visíveis no desktop, 3 no tablet, ~1,5 no celular.
 */
export function DragRow({ children, label }: { children: React.ReactNode; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, startX: 0, startLeft: 0, moved: 0, captured: false });
  const [state, setState] = useState({ canPrev: false, canNext: true, dragging: false });

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setState((s) => ({ ...s, canPrev: el.scrollLeft > 4, canNext: el.scrollLeft < max - 4 }));
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
    drag.current = { active: true, startX: e.clientX, startLeft: el.scrollLeft, moved: 0, captured: false };
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d.active) return;
    const dx = e.clientX - d.startX;
    d.moved = Math.max(d.moved, Math.abs(dx));
    // Só "pega" o ponteiro quando for arrasto de verdade; senão o clique não chega ao link do card.
    if (d.moved > 5 && !d.captured) {
      d.captured = true;
      ref.current!.setPointerCapture(e.pointerId);
      setState((s) => ({ ...s, dragging: true }));
    }
    if (!d.captured) return;
    ref.current!.scrollLeft = d.startLeft - dx;
  }

  function end(e: React.PointerEvent<HTMLDivElement>) {
    if (!drag.current.active) return;
    drag.current.active = false;
    if (drag.current.captured) ref.current?.releasePointerCapture(e.pointerId);
    setState((s) => ({ ...s, dragging: false }));
  }

  function page(dir: 1 | -1) {
    const el = ref.current!;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  }

  const arrow =
    "chamfer-sm absolute top-[38%] z-10 hidden size-12 -translate-y-1/2 place-items-center bg-void/85 text-chalk shadow-xl backdrop-blur transition-[opacity,background-color,color] hover:bg-ember hover:text-void sm:grid";

  return (
    <div className="relative">
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
          <div className="w-[64vw] max-w-[320px] shrink-0 snap-start sm:w-[calc((100%-2rem)/3)] sm:max-w-none lg:w-[calc((100%-3rem)/4)]">{child}</div>
        ))}
        <div className="w-px shrink-0" aria-hidden />
      </div>

      <button onClick={() => page(-1)} disabled={!state.canPrev} aria-label="Ver anteriores" className={`${arrow} -left-3 xl:-left-6 ${state.canPrev ? "opacity-100" : "pointer-events-none opacity-0"}`}>
        <ChevronLeft className="size-6" />
      </button>
      <button onClick={() => page(1)} disabled={!state.canNext} aria-label="Ver próximos" className={`${arrow} -right-3 xl:-right-6 ${state.canNext ? "opacity-100" : "pointer-events-none opacity-0"}`}>
        <ChevronRight className="size-6" />
      </button>
    </div>
  );
}
