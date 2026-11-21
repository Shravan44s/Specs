import { FACTS } from '@/data/content';
import { CountUp } from '@/components/ui/CountUp';
import { SplitReveal } from '@/components/ui/SplitReveal';

export function Story() {
  return (
    <section id="story" className="relative bg-navy px-5 py-24 text-white md:px-10 md:py-36">
      <div className="mx-auto max-w-[1300px]">
        <p className="eyebrow !text-aqua-2">The story</p>
        <SplitReveal as="h2" className="display mt-3 max-w-4xl text-5xl md:text-[5vw]">
          From a website to <span className="serif text-aqua-2">a nation’s</span> optician
        </SplitReveal>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/70">
          Lenskart began online in 2010 with a simple idea: well-made glasses shouldn’t be a luxury. It grew into stores, home eye tests, virtual try-on and its own manufacturing — selling frames and lenses designed, made and fitted at scale.
        </p>
        <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {FACTS.map((f) => (
            <div key={f.label} className="bg-navy p-8">
              <CountUp to={f.value} prefix={f.prefix} suffix={f.suffix} className="display block text-6xl text-aqua-2" />
              <p className="mono mt-4 text-[10px] tracking-[0.22em] uppercase">{f.label}</p>
              <p className="mt-3 text-sm leading-relaxed text-white/60">{f.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
