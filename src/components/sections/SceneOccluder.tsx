'use client';

import { useRef, type ReactNode } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { useApp } from '@/lib/store';

/**
 * Opaque run of sections. While it fully covers the viewport the WebGL layer is
 * hidden anyway, so we pause its render loop to save battery.
 */
export function SceneOccluder({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const set = useApp.getState().setSceneVisible;
    ScrollTrigger.create({
      trigger: ref.current,
      start: 'top top',
      end: 'bottom bottom',
      onToggle: (self) => set(!self.isActive),
    });
    return () => set(true);
  });

  return (
    <div ref={ref} className="solid z-10 rounded-t-[32px] shadow-[0_-40px_80px_-20px_rgb(10_20_60/0.18)] md:rounded-t-[48px]">
      {children}
    </div>
  );
}
