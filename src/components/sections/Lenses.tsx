'use client';

import { useEffect, useState } from 'react';
import gsap from 'gsap';
import { LENSES } from '@/data/content';
import { stage } from '@/lib/stage';
import { clamp, cn } from '@/lib/utils';

/** Pinned run: an eye chart behind the pair while the lens coating changes. */
export function Lenses() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let last = -1;
    const tick = () => {
      const l = clamp(Number.isFinite(stage.lens) ? stage.lens : 0, 0, LENSES.length - 1);
      const i = Math.round(l);
      if (i !== last) {
        last = i;
        setIndex(i);
      }
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  const l = LENSES[index];
  return (
    <section id="lenses" className="relative h-[520svh]">
      <div className="sticky top-0 flex h-svh flex-col justify-center px-5 md:px-10">
        <div className="max-w-md">
          <p className="eyebrow text-aqua">Lens technology</p>
          <h2 className="display mt-3 text-5xl md:text-7xl">What’s in the glass</h2>
          <div className="mt-8 flex flex-wrap gap-2">
            {LENSES.map((x, i) => (
              <span key={x.name} className={cn('rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors', i === index ? 'border-navy bg-navy text-white' : 'border-line text-muted')}>
                {x.name}
              </span>
            ))}
          </div>
          <article key={l.name} className="glass brackets mt-6 rounded-3xl p-6 shadow-[var(--shadow)]">
            <p className="mono text-[10px] tracking-[0.22em] text-aqua uppercase">{l.kicker}</p>
            <h3 className="display mt-2 text-3xl">{l.name}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">{l.body}</p>
            <div className="mt-5 flex items-baseline justify-between border-t border-line pt-4">
              <span className="mono text-[10px] tracking-[0.2em] text-muted uppercase">{l.stat[0]}</span>
              <span className="display text-2xl">{l.stat[1]}</span>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
