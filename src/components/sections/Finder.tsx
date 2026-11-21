'use client';

import { useState } from 'react';
import { FACES, STYLES } from '@/data/content';
import { SplitReveal } from '@/components/ui/SplitReveal';
import { cn } from '@/lib/utils';

/** Simple face outlines for the picker. */
const FACE_PATH: Record<string, string> = {
  round: 'M50 8 C80 8 92 34 92 56 C92 82 74 96 50 96 C26 96 8 82 8 56 C8 34 20 8 50 8 Z',
  square: 'M18 12 H82 Q92 12 92 24 V78 Q92 94 72 96 H28 Q8 94 8 78 V24 Q8 12 18 12 Z',
  oval: 'M50 4 C78 4 88 32 88 54 C88 82 70 98 50 98 C30 98 12 82 12 54 C12 32 22 4 50 4 Z',
  heart: 'M50 98 C30 90 12 68 10 40 C9 20 26 6 50 6 C74 6 91 20 90 40 C88 68 70 90 50 98 Z',
  oblong: 'M50 2 C72 2 80 20 80 40 V66 C80 86 68 99 50 99 C32 99 20 86 20 66 V40 C20 20 28 2 50 2 Z',
};

/** Mini frame drawings per style index. */
function FrameIcon({ i }: { i: number }) {
  const shapes = [
    <g key="r">
      <circle cx="30" cy="25" r="17" />
      <circle cx="90" cy="25" r="17" />
    </g>,
    <g key="re">
      <rect x="8" y="12" width="44" height="28" rx="5" />
      <rect x="68" y="12" width="44" height="28" rx="5" />
    </g>,
    <g key="a">
      <path d="M8 12 H52 C52 34 44 44 30 44 C16 44 8 30 8 12 Z" />
      <path d="M68 12 H112 C112 30 104 44 90 44 C76 44 68 34 68 12 Z" />
      <path d="M40 8 H80" />
    </g>,
    <g key="c">
      <path d="M8 18 Q30 8 56 6 Q54 40 30 40 Q8 40 8 18 Z" />
      <path d="M112 18 Q90 8 64 6 Q66 40 90 40 Q112 40 112 18 Z" />
    </g>,
    <g key="w">
      <path d="M6 10 H54 L50 36 Q30 44 12 36 Z" />
      <path d="M66 10 H114 L108 36 Q90 44 70 36 Z" />
    </g>,
    <g key="cl">
      <path d="M8 14 H54" strokeWidth="7" />
      <path d="M66 14 H112" strokeWidth="7" />
      <path d="M10 16 Q12 40 30 40 Q52 40 52 16" />
      <path d="M68 16 Q68 40 90 40 Q110 40 110 16" />
    </g>,
  ];
  return (
    <svg viewBox="0 0 120 50" className="w-full" aria-hidden>
      <g fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
        {shapes[i]}
        <path d="M52 20 Q60 14 68 20" />
      </g>
    </svg>
  );
}

export function Finder() {
  const [face, setFace] = useState(FACES[0].id);
  const f = FACES.find((x) => x.id === face)!;
  return (
    <section id="finder" className="relative px-5 py-24 md:px-10 md:py-36">
      <div className="mx-auto max-w-[1300px]">
        <p className="eyebrow text-aqua">Find your fit</p>
        <SplitReveal as="h2" className="display mt-3 text-5xl md:text-[5.5vw]">
          What’s your face shape?
        </SplitReveal>
        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-3">
            {FACES.map((x) => (
              <button
                key={x.id}
                type="button"
                onClick={() => setFace(x.id)}
                aria-pressed={x.id === face}
                className={cn('flex flex-col items-center gap-3 rounded-3xl border p-4 transition-all', x.id === face ? 'border-navy bg-navy text-white shadow-[var(--shadow)]' : 'border-line bg-card hover:border-aqua')}
              >
                <svg viewBox="0 0 100 100" className="h-16 w-16" aria-hidden>
                  <path d={FACE_PATH[x.id]} fill="none" stroke="currentColor" strokeWidth="4" />
                </svg>
                <span className="text-sm font-semibold">{x.name}</span>
              </button>
            ))}
          </div>
          <div key={f.id} className="rounded-3xl border border-line bg-card p-6 shadow-[var(--shadow)] md:p-8">
            <p className="serif text-3xl leading-tight">{f.tip}</p>
            <p className="mono mt-6 text-[10px] tracking-[0.22em] text-muted uppercase">Try these shapes</p>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {f.picks.map((p, k) => (
                <div key={p} className="flex flex-col items-center gap-3 rounded-2xl bg-bg p-4 text-navy">
                  <FrameIcon i={p} />
                  <span className="text-sm font-semibold">{STYLES[p].name}</span>
                  {k === 0 && <span className="rounded-full bg-aqua px-2 py-0.5 text-[10px] font-bold text-white">Best match</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
