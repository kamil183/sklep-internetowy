"use client";

/**
 * Kręcący się napis „ZODARA PARFUMS" — zamiast flakonu 3D.
 *
 * - Ten sam napęd „scroll story" co flakon: postęp 0..1 z pozycji scrolla,
 *   punkty odniesienia z sekcji [data-bottle], rAF-damping (bez bibliotek).
 * - Dwa pierścienie tekstu SVG kręcą się w przeciwnych kierunkach (CSS),
 *   przy prefers-reduced-motion stają w miejscu.
 * - Bez JS-a / bez WebGL napis po prostu stoi na środku — strona działa dalej.
 */

import { useEffect, useRef } from "react";
import { recalcWaypoints, sampleBottleState, scrollStore } from "@/components/3d/scrollStore";

const OUTER_TEXT = "ZODARA PARFUMS · ZODARA PARFUMS · ZODARA PARFUMS · ";
const INNER_TEXT = "EAU DE PARFUM · 50 ML · LAVIÉRA · EAU DE PARFUM · 50 ML · LAVIÉRA · ";

export default function BrandSpinner() {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Napęd scrolla (wg wzorca z PerfumeBottle3D — tamten nie jest już używany).
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scrollStore.progress =
        max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    };
    const refresh = () => {
      recalcWaypoints();
      update();
    };

    refresh();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", refresh);
    window.addEventListener("load", refresh);
    const t1 = window.setTimeout(refresh, 600);
    const t2 = window.setTimeout(refresh, 2000);

    // rAF-damping: pozycja i pochylenie w rytmie sekcji (jak dawniej BottleRig).
    let raf = 0;
    const cur = { x: 0, y: 0, scale: 1, rot: 0 };
    let initialized = false;

    const tick = () => {
      const el = wrapRef.current;
      if (el) {
        const s = sampleBottleState(scrollStore.progress);
        const w = window.innerWidth;
        const h = window.innerHeight;
        const mobile = w < 768;
        // px na jednostkę „świata" 3D: kamera z=7, fov 32° → wysokość kadru ≈ 4.015 j.
        const units = h / 4.015;
        const xFactor = Math.min(1, Math.max(w / 1200, 0.3)); // jak dawniej: wąskie ekrany mniej
        const targetX = s.x * (mobile ? xFactor * 0.75 : xFactor) * units;
        const targetY = -(s.y + (mobile ? 0.55 : 0)) * units;
        const targetScale = s.scale * (mobile ? 0.82 : 1);
        const targetRot = s.rotZ * 40; // subtelny przechył zamiast obrotu 3D

        if (!initialized) {
          cur.x = targetX;
          cur.y = targetY;
          cur.scale = targetScale;
          cur.rot = targetRot;
          initialized = true;
        }
        const k = 0.1;
        cur.x += (targetX - cur.x) * k;
        cur.y += (targetY - cur.y) * k;
        cur.scale += (targetScale - cur.scale) * k;
        cur.rot += (targetRot - cur.rot) * k;

        el.style.transform =
          `translate(-50%, -50%) translate(${cur.x.toFixed(1)}px, ${cur.y.toFixed(1)}px)` +
          ` scale(${cur.scale.toFixed(3)}) rotate(${cur.rot.toFixed(2)}deg)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", refresh);
      window.removeEventListener("load", refresh);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div
        ref={wrapRef}
        className="brand-spinner absolute left-1/2 top-1/2 aspect-square w-[min(74vw,300px)] md:w-[min(44vh,420px)]"
        style={{ transform: "translate(-50%, -50%)" }}
      >
        <svg viewBox="0 0 200 200" className="h-full w-full">
          <defs>
            <path
              id="brand-ring-outer"
              fill="none"
              d="M 100,100 m -76,0 a 76,76 0 1,1 152,0 a 76,76 0 1,1 -152,0"
            />
            <path
              id="brand-ring-inner"
              fill="none"
              d="M 100,100 m -62,0 a 62,62 0 1,1 124,0 a 62,62 0 1,1 -124,0"
            />
          </defs>

          {/* cienkie pierścienie pomocnicze */}
          <circle cx="100" cy="100" r="87" fill="none" stroke="#c9a96a" strokeOpacity="0.28" strokeWidth="0.5" />
          <circle cx="100" cy="100" r="70" fill="none" stroke="#c9a96a" strokeOpacity="0.22" strokeWidth="0.5" />

          {/* zewnętrzny pierścień: ZODARA PARFUMS */}
          <g className="ring-spin">
            <text
              className="font-display"
              fill="#c9a96a"
              fontSize="9.5"
              letterSpacing="3"
            >
              <textPath href="#brand-ring-outer" startOffset="0">
                {OUTER_TEXT}
              </textPath>
            </text>
          </g>

          {/* wewnętrzny pierścień: szczegóły, w drugą stronę */}
          <g className="ring-spin-reverse">
            <text
              className="font-display"
              fill="#8a7f6d"
              fontSize="5.5"
              letterSpacing="1.5"
            >
              <textPath href="#brand-ring-inner" startOffset="0">
                {INNER_TEXT}
              </textPath>
            </text>
          </g>

          {/* monogram w środku */}
          <text
            x="100"
            y="118"
            textAnchor="middle"
            className="font-display"
            fill="#c9a96a"
            fontSize="58"
          >
            Z
          </text>
        </svg>
      </div>
    </div>
  );
}
