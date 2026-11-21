'use client';

import { useRef, type ElementType, type ReactNode } from 'react';
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';
import { useGSAP } from '@gsap/react';
import { cn, prefersReducedMotion } from '@/lib/utils';

type Props = {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  /** 'lines' slides masked lines up; 'chars' staggers characters with a 3D flip. */
  by?: 'lines' | 'chars';
  delay?: number;
  /** Play immediately instead of when scrolled into view (e.g. the hero after the loader). */
  play?: boolean;
  start?: string;
};

/** Masked text reveal using GSAP SplitText; re-splits itself on resize. */
export function SplitReveal({ as: Tag = 'div', children, className, by = 'lines', delay = 0, play, start = 'top 85%' }: Props) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || play === false) return;
      if (prefersReducedMotion()) {
        gsap.set(el, { autoAlpha: 1 });
        return;
      }

      const split = SplitText.create(el, {
        type: by === 'chars' ? 'lines,chars' : 'lines',
        mask: 'lines',
        linesClass: 'split-line',
        autoSplit: true,
        onSplit(self) {
          gsap.set(el, { autoAlpha: 1 });
          const targets = by === 'chars' ? self.chars : self.lines;
          return gsap.from(targets, {
            yPercent: 115,
            rotateX: by === 'chars' ? -70 : 0,
            transformOrigin: '50% 100%',
            duration: by === 'chars' ? 1.1 : 1.2,
            ease: 'expo.out',
            stagger: by === 'chars' ? 0.028 : 0.09,
            delay,
            scrollTrigger: play ? undefined : { trigger: el, start, once: true },
          });
        },
      });
      return () => split.revert();
    },
    { scope: ref, dependencies: [play] },
  );

  return (
    <Tag ref={ref} className={cn('invisible [perspective:600px]', className)}>
      {children}
    </Tag>
  );
}
