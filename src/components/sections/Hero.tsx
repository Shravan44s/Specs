'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ArrowDown } from 'lucide-react';
import { SplitReveal } from '@/components/ui/SplitReveal';
import { useApp } from '@/lib/store';

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const introDone = useApp((s) => s.introDone);
  useGSAP(
    () => {
      if (!introDone) return;
      gsap.from('.hero-fade', { autoAlpha: 0, y: 24, duration: 1.2, ease: 'expo.out', stagger: 0.08, delay: 0.8 });
      gsap.to('.hero-copy', { yPercent: -25, autoAlpha: 0, ease: 'none', scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom 30%', scrub: true } });
    },
    { scope: root, dependencies: [introDone] },
  );
  return (
    <section ref={root} id="hero" className="relative h-[140svh]">
      <div className="hero-copy sticky top-0 flex h-svh flex-col justify-center px-5 md:px-10">
        <div className="max-w-xl">
          <p className="hero-fade mono mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1.5 text-[10px] tracking-[0.25em] text-muted uppercase">
            <span className="size-1.5 rounded-full bg-aqua" /> Eyewear, reimagined in 3D
          </p>
          <SplitReveal as="h1" by="chars" play={introDone} delay={0.4} className="display text-[15vw] md:text-[7.5vw]">
            <span className="block">See the world</span>
            <span className="serif text-aqua-grad block">differently.</span>
          </SplitReveal>
          <p className="hero-fade mt-6 max-w-md text-base leading-relaxed text-muted">
            Six frame shapes, five lens technologies, one pair of glasses that changes as you scroll. Find what suits your face — and what your eyes actually need.
          </p>
          <div className="hero-fade mt-8 flex flex-wrap items-center gap-3">
            <a href="#finder" className="rounded-full bg-navy px-6 py-3.5 text-sm font-semibold text-white shadow-[var(--shadow)] transition-transform hover:scale-[1.03]">
              Find your frame
            </a>
            <span className="mono flex items-center gap-2 text-[10px] tracking-[0.25em] text-muted uppercase">
              Scroll to explore <ArrowDown className="size-4 animate-bounce text-aqua" />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
