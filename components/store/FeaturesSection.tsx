import type { LucideIcon } from "lucide-react";
import { Droplets, Gem, Leaf, Sparkles } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import { PRODUCT } from "@/lib/config/product";
import {
  displayFeatureDescription,
  displayFeatureTitle,
  isPlaceholder,
} from "@/lib/utils/product";

const ICONS: Record<string, LucideIcon> = {
  sparkles: Sparkles,
  droplets: Droplets,
  leaf: Leaf,
  gem: Gem,
};

/** Sekcja 4 — Cechy produktu (placeholdery do uzupełnienia przez markę). */
export default function FeaturesSection() {
  return (
    <section id="cechy" data-bottle className="relative flex min-h-screen items-center py-32">
      <div className="mx-auto w-full max-w-7xl px-6 md:px-10">
        <div className="text-center">
          <Reveal>
            <p className="section-label mx-auto justify-center before:hidden">
              <span className="h-px w-10 bg-gold" />
              Cechy produktu
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="mx-auto max-w-2xl font-display text-4xl font-light md:text-5xl">
              To, co wyróżnia {PRODUCT.brand}
            </h2>
          </Reveal>
        </div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PRODUCT.features.map((feature, index) => {
            const Icon = ICONS[feature.icon] ?? Sparkles;
            const title = displayFeatureTitle(PRODUCT, index);
            const description = displayFeatureDescription(PRODUCT, index);
            const placeholder = isPlaceholder(title);
            return (
              <Reveal key={feature.id} delay={0.08 * index}>
                <article className="card group h-full p-7 transition-colors duration-300 hover:border-gold/50">
                  <Icon
                    size={26}
                    strokeWidth={1.2}
                    className="text-gold transition-transform duration-300 group-hover:-translate-y-1"
                  />
                  <h3
                    className={`mt-6 font-display text-xl ${
                      placeholder ? "text-creamdim" : "text-cream"
                    }`}
                  >
                    {title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-creamdim">{description}</p>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
