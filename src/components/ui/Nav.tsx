'use client';

import { useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { useSmoothScroll } from '@/components/providers/SmoothScroll';
import { useApp } from '@/lib/store';
import { cn } from '@/lib/utils';

const LINKS = [
  { href: '#styles', label: 'Frames' },
  { href: '#lenses', label: 'Lenses' },
  { href: '#collections', label: 'Collections' },
  { href: '#finder', label: 'Find your fit' },
  { href: '#story', label: 'Story' },
];

export function Nav() {
  const bar = useRef<HTMLElement>(null);
  const [open, setOpen] = useState(false);
  const introDone = useApp((s) => s.introDone);
  const { scrollTo } = useSmoothScroll();

  useGSAP(
    () => {
      if (!introDone) return;
      gsap.fromTo(bar.current, { yPercent: -120 }, { yPercent: 0, duration: 1.1, ease: 'expo.out', delay: 0.5 });
      ScrollTrigger.create({
        start: 'top -80',
        end: 'max',
        onUpdate: (self) => {
          bar.current?.classList.toggle('is-condensed', self.scroll() > 80);
          gsap.to(bar.current, { yPercent: self.direction === 1 && self.scroll() > 600 ? -120 : 0, duration: 0.5, ease: 'power3.out', overwrite: 'auto' });
        },
      });
    },
    { dependencies: [introDone] },
  );

  const go = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    scrollTo(href);
  };

  return (
    <>
      <header ref={bar} className="group/nav fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-6 md:pt-4" style={{ transform: 'translateY(-120%)' }}>
        <nav className="mx-auto flex max-w-[1440px] items-center justify-between rounded-full px-4 py-2 transition-[background,box-shadow] duration-500 group-[.is-condensed]/nav:glass group-[.is-condensed]/nav:shadow-[var(--shadow)] md:px-6">
          <a href="#hero" onClick={go('#hero')} aria-label="Back to top" className="display text-xl">
            lenskart<span className="text-aqua">.</span>
            <span className="mono ml-2 rounded-full border border-line px-2 py-0.5 align-middle text-[8px] tracking-[0.2em] text-muted uppercase">concept</span>
          </a>
          <ul className="hidden items-center gap-1 lg:flex">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} onClick={go(l.href)} className="rounded-full px-4 py-2 text-[13px] font-medium text-muted transition-colors hover:text-fg">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <a href="https://www.lenskart.com" target="_blank" rel="noreferrer" className="hidden items-center gap-1.5 rounded-full bg-navy px-4 py-2.5 text-[12px] font-semibold text-white transition-transform hover:scale-[1.03] sm:flex">
              Visit lenskart.com <ArrowUpRight className="size-3.5" />
            </a>
            <button type="button" className="grid size-10 place-items-center rounded-full border border-line lg:hidden" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} onClick={() => setOpen((o) => !o)}>
              {open ? <X className="size-4" /> : <Menu className="size-4" />}
            </button>
          </div>
        </nav>
        <div className="mx-auto mt-2 h-[2px] max-w-[1400px] overflow-hidden rounded-full bg-line/50">
          <div className="scroll-progress h-full bg-gradient-to-r from-navy via-aqua to-navy" />
        </div>
      </header>
      <div className={cn('fixed inset-0 z-40 flex flex-col justify-center gap-3 bg-bg/95 px-8 backdrop-blur-xl transition-[opacity,visibility] duration-500 lg:hidden', open ? 'visible opacity-100' : 'invisible opacity-0')}>
        {LINKS.map((l) => (
          <a key={l.href} href={l.href} onClick={go(l.href)} className="display text-4xl transition-colors hover:text-aqua">
            {l.label}
          </a>
        ))}
      </div>
    </>
  );
}
