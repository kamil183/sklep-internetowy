/**
 * Magazyn postępu scrolla dla „scroll story" flakonu.
 *
 * - `progress` (0..1) jest ustawiane przez ScrollTrigger (patrz SmoothScroll).
 * - `waypoints` są przeliczane z pozycji prawdziwych sekcji [data-bottle],
 *   dzięki czemu animacje 3D są zsynchronizowane z sekcjami strony,
 *   niezależnie od ich wysokości.
 * - Scena 3D czyta wartości w `useFrame` i interpoluje płynnie (lerp + smoothstep).
 */

export interface BottleState {
  x: number;
  y: number;
  z: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  /** 0 = zakrętka zamknięta, 1 = całkowicie odsunięta. */
  capLift: number;
  scale: number;
}

export interface Waypoint {
  at: number;
  state: BottleState;
}

/**
 * Stany flakonu dla kolejnych sekcji strony:
 * 1. HERO      — centralnie, spokojnie
 * 2. HISTORIA  — obrót, przesunięcie w prawo (tekst po lewej)
 * 3. FLAKON    — przesunięcie w lewo, inny kąt (tekst po prawej)
 * 4. CECHY     — zakrętka zaczyna się unosić (otwieranie)
 * 5. PRODUKT   — zakrętka zdjęta + subtelny ruch „sprayu"
 * 6. CTA       — powrót do pozycji głównej, zakrętka wraca
 * 7. KONTAKT   — flakon delikatnie się wycofuje
 */
export const BOTTLE_STATES: BottleState[] = [
  { x: 0, y: 0, z: 0, rotX: 0, rotY: -0.15, rotZ: 0, capLift: 0, scale: 1 },
  { x: 1.6, y: 0, z: 0, rotX: 0, rotY: 0.85 * Math.PI, rotZ: 0, capLift: 0, scale: 0.95 },
  { x: -1.7, y: 0.05, z: 0, rotX: 0.05, rotY: 1.7 * Math.PI, rotZ: 0.05, capLift: 0, scale: 1.05 },
  { x: 0, y: 0.35, z: -0.5, rotX: 0, rotY: 2.15 * Math.PI, rotZ: 0, capLift: 0.55, scale: 0.6 },
  { x: 1.5, y: 0.1, z: 0, rotX: 0, rotY: 2.7 * Math.PI, rotZ: -0.55, capLift: 1, scale: 0.9 },
  { x: 0, y: 0, z: 0, rotX: 0, rotY: 4 * Math.PI, rotZ: 0, capLift: 0, scale: 1 },
  { x: 0, y: -0.7, z: -1, rotX: 0, rotY: 4.2 * Math.PI, rotZ: 0, capLift: 0, scale: 0.85 },
];

/** Zapasowy rozkład (gdyby sekcje nie miały atrybutów data-bottle). */
const FALLBACK_AT = [0, 0.16, 0.33, 0.5, 0.66, 0.82, 1];

export const scrollStore: {
  progress: number;
  waypoints: Waypoint[];
} = {
  progress: 0,
  waypoints: BOTTLE_STATES.map((state, i) => ({ at: FALLBACK_AT[i], state })),
};

/** Przeliczenie punktów odniesienia z aktualnych pozycji sekcji. */
export function recalcWaypoints() {
  if (typeof window === "undefined") return;
  const els = Array.from(document.querySelectorAll<HTMLElement>("[data-bottle]"));
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

  if (els.length < 2) {
    scrollStore.waypoints = BOTTLE_STATES.map((state, i) => ({
      at: FALLBACK_AT[i] ?? 1,
      state,
    }));
    return;
  }

  let waypoints = els.map((el, i) => {
    const rect = el.getBoundingClientRect();
    const centerY = rect.top + window.scrollY + rect.height / 2;
    const raw = maxScroll > 0 ? (centerY - window.innerHeight / 2) / maxScroll : 0;
    return {
      at: Math.min(Math.max(raw, 0), 1),
      state: BOTTLE_STATES[Math.min(i, BOTTLE_STATES.length - 1)],
    };
  });

  // Monotoniczna kolejność punktów (gwarancja stabilnej interpolacji).
  waypoints = waypoints.map((wp, i) =>
    i === 0 ? { ...wp, at: 0 } : { ...wp, at: Math.max(wp.at, waypoints[i - 1].at + 0.001) },
  );
  waypoints[waypoints.length - 1].at = 1;

  scrollStore.waypoints = waypoints;
}

function smoothstep(t: number) {
  const clamped = Math.min(Math.max(t, 0), 1);
  return clamped * clamped * (3 - 2 * clamped);
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

/** Pobierz płynnie interpolowany stan flakonu dla postępu scrolla `p`. */
export function sampleBottleState(p: number): BottleState {
  const wps = scrollStore.waypoints;
  if (wps.length === 0) return BOTTLE_STATES[0];
  if (p <= wps[0].at) return wps[0].state;
  if (p >= wps[wps.length - 1].at) return wps[wps.length - 1].state;

  for (let i = 0; i < wps.length - 1; i++) {
    const a = wps[i];
    const b = wps[i + 1];
    if (p >= a.at && p <= b.at) {
      const t = smoothstep((p - a.at) / (b.at - a.at));
      return {
        x: lerp(a.state.x, b.state.x, t),
        y: lerp(a.state.y, b.state.y, t),
        z: lerp(a.state.z, b.state.z, t),
        rotX: lerp(a.state.rotX, b.state.rotX, t),
        rotY: lerp(a.state.rotY, b.state.rotY, t),
        rotZ: lerp(a.state.rotZ, b.state.rotZ, t),
        capLift: lerp(a.state.capLift, b.state.capLift, t),
        scale: lerp(a.state.scale, b.state.scale, t),
      };
    }
  }
  return wps[wps.length - 1].state;
}
