"use client";

/**
 * Animowane tło hero — public/videos/hero-sky.mp4 (pętla bezszwowa).
 * Bez JS-a zostaje ciemny gradient nocnego nieba (warstwa .hero-sky).
 */
export default function HeroSky() {
  return (
    <div className="hero-sky-wrap" aria-hidden="true">
      <div className="hero-sky" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <video
        className="hero-sky-video"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/images/hero-sky-poster.jpg"
        src="/videos/hero-sky.mp4"
      />
      <div className="hero-sky-veil" />
      <div
        className="absolute inset-x-0 bottom-0 h-28"
        style={{ background: "linear-gradient(180deg, rgba(246,241,233,0) 0%, #f6f1e9 100%)" }}
      />
    </div>
  );
}
