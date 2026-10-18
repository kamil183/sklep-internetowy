"use client";

/**
 * Tło ZODARA — warstwy ZA sceną 3D, obecne na CAŁEJ stronie:
 *  1. .hero-sky-video — animowane tło (public/videos/hero-sky.mp4):
 *     pełnia księżyca, kwitnąca wiśnia, chmury, spadające płatki. Pętla bezszwowa.
 *  2. .hero-sky — ciemny gradient nocnego nieba (fallback + podkład).
 *  3. .hero-sky-veil — woalka u góry i u dołu dla czytelności tekstu.
 *  4. .hero-sky-scrim — przyciemniacz, który rośnie z scrolliem.
 *
 * W hero wideo gra na pełnej mocy; im głębiej w stronę, tym mocniej tonie
 * w czerń — aż zostaje ledwie wyczuwalny blask księżyca pod sekcjami.
 * Dzięki temu tło NIE znika po pierwszym ekranie, ale nigdy nie konkuruje z tekstem.
 */

import { useEffect, useRef } from "react";

export default function HeroSky() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const skyRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const vh = window.innerHeight || 1;
      const y = window.scrollY;
      // Początek wygaszania dopiero po ~0.9 ekranu, pełna cisza po ~3.4 ekranach,
      // czyli mniej więcej w okolicach sekcji „Produkt".
      const start = vh * 0.9;
      const end = vh * 3.4;
      const raw = Math.min(1, Math.max(0, (y - start) / (end - start)));
      const t = raw * raw * (3 - 2 * raw); // smoothstep — bez ostrego kolan

      if (videoRef.current) videoRef.current.style.opacity = String(1 - t * 0.5);
      if (skyRef.current) skyRef.current.style.opacity = String(1 - t);
      if (scrimRef.current) scrimRef.current.style.opacity = String(t * 0.86);
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // Odtwarzanie tylko przy pełnej animacji — przy reduced motion zostaje klatka poster.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      video.pause();
      return;
    }
    // React bywa kapryśny co do właściwości muted — ustawiamy ją wprost,
    // inaczej przeglądarka zablokuje autoplay.
    video.muted = true;
    void video.play().catch(() => {
      /* autoplay zablokowany — zostaje klatka poster */
    });
  }, []);

  return (
    <div className="hero-sky-wrap" aria-hidden="true">
      <div ref={skyRef} className="hero-sky" />
      <video
        ref={videoRef}
        className="hero-sky-video"
        src="/videos/hero-sky.mp4"
        poster="/images/hero-sky-poster.jpg"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        disablePictureInPicture
      />
      <div className="hero-sky-veil" />
      <div ref={scrimRef} className="hero-sky-scrim" />
    </div>
  );
}
