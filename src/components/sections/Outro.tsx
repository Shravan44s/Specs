'use client';

import { ArrowUp, ArrowUpRight } from 'lucide-react';
import { useSmoothScroll } from '@/components/providers/SmoothScroll';
import { SplitReveal } from '@/components/ui/SplitReveal';

export function Outro() {
  const { scrollTo } = useSmoothScroll();
  return (
    <section id="outro" className="relative h-[200svh]">
      <div className="sticky top-0 flex h-svh flex-col justify-between px-5 pt-28 pb-8 md:px-10">
        <div className="max-w-xl">
          <p className="eyebrow text-aqua">Your move</p>
          <SplitReveal as="h2" className="display mt-3 text-[13vw] md:text-[6.5vw]">
            <span className="block">Look good.</span>
            <span className="serif text-aqua-grad block">See better.</span>
          </SplitReveal>
          <a href="https://www.lenskart.com" target="_blank" rel="noreferrer" className="mt-8 inline-flex items-center gap-2 rounded-full bg-navy px-6 py-3.5 text-sm font-semibold text-white shadow-[var(--shadow)] transition-transform hover:scale-[1.03]">
            Shop at lenskart.com <ArrowUpRight className="size-4" />
          </a>
        </div>
        <footer className="flex flex-col gap-6 border-t border-line pt-6 md:flex-row md:items-end md:justify-between">
          <p className="max-w-xl text-[11px] leading-relaxed text-muted">
            Unofficial design concept for portfolio purposes. Not affiliated with, endorsed by or operated by Lenskart; brand and product names belong to their owners. The 3D glasses are an original procedural model. No purchases or personal data are taken on this page.
          </p>
          <button type="button" onClick={() => scrollTo('#hero')} className="mono flex items-center gap-2 self-start rounded-full border border-line px-5 py-3 text-[10px] tracking-[0.25em] uppercase transition-colors hover:border-aqua hover:text-aqua">
            Back to top <ArrowUp className="size-3.5" />
          </button>
        </footer>
      </div>
    </section>
  );
}
