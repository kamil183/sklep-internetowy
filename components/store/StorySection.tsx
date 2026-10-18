import Reveal from "@/components/ui/Reveal";
import { PRODUCT } from "@/lib/config/product";
import {
  displayNotes,
  displayNotesLabel,
  displayScentCharacter,
  displayScentStory,
  displaySignature,
  isPlaceholder,
} from "@/lib/utils/product";

/** Sekcja 2 — Historia zapachu (tekst po lewej, flakon po prawej). */
export default function StorySection() {
  const story = displayScentStory(PRODUCT);
  const character = displayScentCharacter(PRODUCT);
  const notes = displayNotes(PRODUCT);
  const notesLabel = displayNotesLabel(PRODUCT);
  const signature = displaySignature(PRODUCT);

  return (
    <section
      id="historia"
      data-bottle
      className="relative flex min-h-screen items-center py-32"
    >
      <div className="mx-auto w-full max-w-7xl px-6 md:px-10">
        <div className="max-w-xl">
          <Reveal>
            <p className="section-label">Historia zapachu</p>
          </Reveal>

          <Reveal delay={0.1}>
            <p
              className={`font-display text-3xl font-light leading-snug md:text-4xl ${
                isPlaceholder(story) ? "text-creamdim" : ""
              }`}
            >
              {story}
            </p>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="mt-10">
              <h3 className="mb-4 text-[11px] uppercase tracking-[0.35em] text-gold">
                {notesLabel}
              </h3>
              <ul className="flex flex-wrap gap-3">
                {notes.map((note) => (
                  <li
                    key={note}
                    className={`border px-4 py-2 text-sm ${
                      isPlaceholder(note)
                        ? "border-dashed border-line text-creamdim"
                        : "border-line text-ink"
                    }`}
                  >
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={0.3}>
            <p className="mt-10 max-w-md text-sm leading-relaxed text-creamdim">
              {character}
            </p>
          </Reveal>

          {signature && (
            <Reveal delay={0.38}>
              <p className="mt-8 font-display text-2xl font-light tracking-[0.12em] text-gold md:text-3xl">
                {signature}
              </p>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  );
}
