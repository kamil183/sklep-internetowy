"use client";

/**
 * Ładowarka sceny 3D — flakon LAVIÉRA reagujący na scroll.
 * - dynamic import (ssr: false) → model/Three nie blokują pierwszego renderu
 * - detekcja WebGL → bez wsparcia strona działa dalej (bez 3D)
 * - low power (mobile / mało rdzeni / reduced motion) → niższa jakość renderu
 * - sterownik scrolla: zamiast gsap/ScrollTrigger zwykły listener + rAF-damping
 *   w scenie, więc flakon obraca się płynnie w rytm sekcji [data-bottle]
 * - podmiana modelu: NEXT_PUBLIC_BOTTLE_MODEL_URL=/models/bottle.glb
 */

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { recalcWaypoints, scrollStore } from "./scrollStore";

const BottleScene = dynamic(() => import("./BottleScene"), {
  ssr: false,
  loading: () => null,
});

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl2") || canvas.getContext("webgl"))
    );
  } catch {
    return false;
  }
}

export default function PerfumeBottle3D({ modelUrl }: { modelUrl?: string }) {
  const [supported, setSupported] = useState(false);
  const [lowPower, setLowPower] = useState(false);

  useEffect(() => {
    setSupported(hasWebGL());

    const compute = () => {
      const narrow = window.matchMedia("(max-width: 767px)").matches;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const weakCpu = (navigator.hardwareConcurrency ?? 8) <= 4;
      setLowPower(narrow || reduced || weakCpu);
    };
    compute();

    const mq = window.matchMedia("(max-width: 767px)");
    mq.addEventListener("change", compute);
    return () => mq.removeEventListener("change", compute);
  }, []);

  // Napęd „scroll story": postęp 0..1 z pozycji scrolla + punkty odniesienia
  // z aktualnych pozycji sekcji [data-bottle]. Bez ciężkich bibliotek.
  useEffect(() => {
    if (!supported) return;

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
    // Układ zmienia się też po doładowaniu fontów/zdjęć — przelicz dwa razy.
    const t1 = window.setTimeout(refresh, 600);
    const t2 = window.setTimeout(refresh, 2000);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", refresh);
      window.removeEventListener("load", refresh);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [supported]);

  if (!supported) return null;

  const url = modelUrl ?? process.env.NEXT_PUBLIC_BOTTLE_MODEL_URL ?? null;

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <BottleScene lowPower={lowPower} modelUrl={url || null} />
    </div>
  );
}
