"use client";

/**
 * Ładowarka sceny 3D.
 * - dynamic import (ssr: false) → model/Three nie blokują pierwszego renderu
 * - detekcja WebGL → bez wsparcia strona działa dalej (bez 3D)
 * - low power (mobile / mało rdzeni / reduced motion) → niższa jakość renderu
 * - podmiana modelu: NEXT_PUBLIC_BOTTLE_MODEL_URL=/models/bottle.glb
 */

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

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
    const compute = () => {
      setSupported(hasWebGL());
      const narrow = window.matchMedia("(max-width: 767px)").matches;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const weakCpu = (navigator.hardwareConcurrency ?? 8) <= 4;
      setLowPower(narrow || reduced || weakCpu);
    };

    // Detekcja po pierwszym malowaniu (rAF) — bez kaskadowych renderów w effect.
    const raf = requestAnimationFrame(compute);

    const mq = window.matchMedia("(max-width: 767px)");
    mq.addEventListener("change", compute);
    return () => {
      cancelAnimationFrame(raf);
      mq.removeEventListener("change", compute);
    };
  }, []);

  if (!supported) return null;

  const url = modelUrl ?? process.env.NEXT_PUBLIC_BOTTLE_MODEL_URL ?? null;

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <BottleScene lowPower={lowPower} modelUrl={url || null} />
    </div>
  );
}
