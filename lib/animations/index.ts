export {}; // lib/animations — GSAP + Lenis helpers

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function useGSAP(fn: () => void, deps: unknown[] = []) {
  const ref = gsap.context(fn, deps);
  return ref;
}
