'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { STYLES } from '@/data/content';
import { stage } from '@/lib/stage';
import { clamp, cn } from '@/lib/utils';

/** Pinned run: the frame morphs through six shapes; the HUD follows the live shape. */
export function Styles() {
  const [index, setIndex] = useState(0);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let last = -1;
    const tick = () => {
      const s = clamp(Number.isFinite(stage.style) ? stage.style : 0, 0, STYLES.length - 1);
      const i = Math.round(s);
      if (i !== last) {
        last = i;
        setIndex(i);
      }
      if (barRef.current) barRef.current.style.transform = `scaleX(${s / (STYLES.length - 1)})`;
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  const st = STYLES[index];
  return (
    <section id="styles" className="relative h-[700svh]">
      <div className="sticky top-0 flex h-svh flex-col justify-between px-5 pt-24 pb-8 md:px-10 md:pt-28">
        <div className="flex items-start justify-between">
          <div>
            <p className="eyebrow">Frame shapes · {String(index + 1).padStart(2, '0')} / 06</p>
            <h2 className="display mt-3 text-[16vw] leading-none md:text-[7vw]">{st.name}</h2>
          </div>
          <p className="mono hidden max-w-[16rem] text-right text-[10px] leading-relaxed tracking-[0.22em] text-muted uppercase md:block">Same pair. Keep scrolling and watch it reshape itself.</p>
        </div>
        <div className="flex flex-col gap-5">
          <div className="flex md:justify-end max-md:justify-center">
            <article key={st.name} className="glass brackets w-full max-w-sm rounded-3xl p-6 shadow-[var(--shadow)] md:p-7">
              <p className="mono text-[10px] tracking-[0.22em] text-aqua uppercase">Suits · {st.faces}</p>
              <p className="serif mt-3 text-3xl leading-tight">{st.note}</p>
              <div className="mt-5 flex items-center gap-3 border-t border-line pt-4">
                <span className="size-5 rounded-full border border-line" style={{ background: st.finish.tortoise ? 'radial-gradient(circle at 30% 30%, #e0a24e, #5a2a0c 70%)' : st.finish.color }} />
                <span className="text-xs text-muted">{st.finish.metal ? 'Metal' : st.finish.tortoise ? 'Tortoise acetate' : 'Polished acetate'}</span>
              </div>
            </article>
          </div>
          <div>
            <div className="flex justify-between">
              {STYLES.map((s, i) => (
                <span key={s.name} className={cn('text-[11px] font-semibold transition-colors md:text-sm', i === index ? 'text-fg' : 'text-muted/60')}>
                  {s.name}
                </span>
              ))}
            </div>
            <div className="mt-2 h-[2px] w-full rounded-full bg-line">
              <div ref={barRef} className="h-full origin-left rounded-full bg-aqua" style={{ transform: 'scaleX(0)' }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
