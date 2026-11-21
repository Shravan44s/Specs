'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

/** Blend-mode cursor follower for fine pointers; grows over [data-cursor] targets. */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const el = dot.current;
    if (!el || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    gsap.set(el, { xPercent: -50, yPercent: -50, autoAlpha: 0 });
    const x = gsap.quickTo(el, 'x', { duration: 0.35, ease: 'power3.out' });
    const y = gsap.quickTo(el, 'y', { duration: 0.35, ease: 'power3.out' });

    const move = (e: PointerEvent) => {
      gsap.to(el, { autoAlpha: 1, duration: 0.3, overwrite: 'auto' });
      x(e.clientX);
      y(e.clientY);
      const hot = (e.target as Element).closest?.('a, button, [data-cursor]');
      gsap.to(el, { scale: hot ? 2.6 : 1, duration: 0.4, ease: 'power3.out', overwrite: 'auto' });
    };
    const leave = () => gsap.to(el, { autoAlpha: 0, duration: 0.3 });
    window.addEventListener('pointermove', move, { passive: true });
    document.documentElement.addEventListener('pointerleave', leave);
    return () => {
      window.removeEventListener('pointermove', move);
      document.documentElement.removeEventListener('pointerleave', leave);
    };
  });

  return (
    <div
      ref={dot}
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-[70] hidden size-4 rounded-full bg-white mix-blend-difference [@media(hover:hover)_and_(pointer:fine)]:block"
    />
  );
}
