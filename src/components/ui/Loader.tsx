'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useApp } from '@/lib/store';
import { stage } from '@/lib/stage';
import { prefersReducedMotion } from '@/lib/utils';

/**
 * Focus pull. A blurry word sharpens as if a lens snaps into place while the scene
 * loads; then two circular "lenses" iris open to reveal the page.
 */
export function Loader() {
  const root = useRef<HTMLDivElement>(null);
  const word = useRef<HTMLHeadingElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    const reduced = prefersReducedMotion();
    gsap.fromTo(word.current, { filter: 'blur(18px)', opacity: 0.4, letterSpacing: '0.2em' }, { filter: 'blur(0px)', opacity: 1, letterSpacing: '-0.04em', duration: reduced ? 0 : 1.8, ease: 'power3.out' });
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      const tl = gsap.timeline({ onComplete: () => setGone(true) });
      tl.to(root.current, { clipPath: 'circle(0% at 50% 50%)', duration: reduced ? 0.2 : 1.1, ease: 'expo.inOut' }, '+=0.25')
        .add(() => useApp.getState().setIntroDone(), '-=0.55')
        .to(stage, { intro: 1, duration: reduced ? 0.01 : 2, ease: 'power3.out' }, '-=0.8');
    };
    const minTime = new Promise((r) => setTimeout(r, reduced ? 0 : 2100));
    const ready = new Promise<void>((r) => {
      if (useApp.getState().sceneReady) return r();
      const unsub = useApp.subscribe((s) => {
        if (s.sceneReady) {
          unsub();
          r();
        }
      });
    });
    const timeout = new Promise((r) => setTimeout(r, 9000));
    Promise.all([minTime, Promise.race([ready, timeout])]).then(finish);
  }, []);

  if (gone) return null;
  return (
    <div ref={root} className="fixed inset-0 z-[80] flex flex-col items-center justify-center gap-4 bg-navy text-white" style={{ clipPath: 'circle(150% at 50% 50%)' }} role="status" aria-label="Loading">
      <p className="mono text-[10px] tracking-[0.35em] text-aqua-2 uppercase">Adjusting focus</p>
      <h1 ref={word} className="display text-6xl md:text-8xl">
        lenskart<span className="text-aqua">.</span>
      </h1>
      <p className="serif text-lg text-white/60">a concept in 3D</p>
    </div>
  );
}
