import { COLLECTIONS } from '@/data/content';
import { SplitReveal } from '@/components/ui/SplitReveal';

/** The house's lines as tall cards with a drawn frame silhouette. */
export function Collections() {
  return (
    <section id="collections" className="relative bg-bg-2 px-5 pt-28 pb-20 md:px-10 md:pt-36">
      <div className="mx-auto max-w-[1300px]">
        <p className="eyebrow text-aqua">Collections</p>
        <SplitReveal as="h2" className="display mt-3 text-5xl md:text-[5.5vw]">
          A pair for <span className="serif text-aqua-grad">every</span> version of you
        </SplitReveal>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {COLLECTIONS.map((c) => (
            <article
              key={c.name}
              data-cursor
              className="group relative flex aspect-[3/4] flex-col justify-between overflow-hidden rounded-3xl p-6 transition-transform duration-700 ease-out-expo hover:-translate-y-2"
              style={{ background: c.hue[0], color: c.hue[0] === '#e7f1ff' ? '#0b1238' : '#fff' }}
            >
              <svg viewBox="0 0 240 90" className="w-full transition-transform duration-700 ease-out-expo group-hover:scale-110" aria-hidden>
                <g fill="none" stroke={c.hue[1]} strokeWidth="6" strokeLinecap="round">
                  <rect x="12" y="18" width="92" height="58" rx="26" />
                  <rect x="136" y="18" width="92" height="58" rx="26" />
                  <path d="M104 36 q16 -12 32 0" />
                </g>
              </svg>
              <div>
                <p className="mono text-[10px] tracking-[0.22em] uppercase opacity-70">{c.line}</p>
                <h3 className="display mt-2 text-3xl">{c.name}</h3>
                <p className="mt-2 text-sm opacity-75">{c.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
