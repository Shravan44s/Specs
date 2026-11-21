import { clamp, lerp, smoothstep } from './utils';

/**
 * The film. A pair of glasses floats at the origin, lenses facing +z. Scroll unfolds the
 * temples, morphs the frame through six styles, switches the lens technology, and
 * turns the pair so you see it from every side. Keys are pinned to section ids.
 */
export type Shot = {
  az: number;
  el: number;
  dist: number;
  shift: number;
  lift: number;
  fov: number;
  spin: number;
  /** Frame style 0 → STYLE_COUNT − 1, fractional = mid-morph. */
  style: number;
  /** Temples folded 0 = open (wearable), 1 = folded flat. */
  fold: number;
  /** Lens technology 0 clear, 1 blue-cut, 2 anti-glare, 3 photochromic, 4 polarized. */
  lens: number;
  /** Eye chart behind the lenses 0 → 1. */
  chart: number;
};

type Anchor = [id: string, p: number, off?: number];
type Key = { at: Anchor; shot: Partial<Shot>; portrait?: Partial<Shot> };

export const STYLE_COUNT = 6;
export const LENS_COUNT = 5;

const BASE: Shot = { az: 0.4, el: 0.12, dist: 3.4, shift: 0, lift: 0, fov: 30, spin: 0, style: 0, fold: 1, lens: 0, chart: 0 };

const styleKeys: Key[] = Array.from({ length: STYLE_COUNT }, (_, i) => ({
  at: ['styles', i / (STYLE_COUNT - 1)],
  shot: { style: i, fold: 0, az: 0.15 + Math.sin(i * 1.3) * 0.35, el: 0.08 + (i % 2) * 0.08, dist: 3.1, shift: -0.55, lift: 0.02 },
  portrait: { shift: 0, dist: 4.6, lift: -0.35 },
}));

const lensKeys: Key[] = Array.from({ length: LENS_COUNT - 1 }, (_, i) => ({
  at: ['lenses', (i + 0.5) / (LENS_COUNT - 1)],
  shot: { lens: i + 1, az: 0.05 * (i % 2 ? -1 : 1), el: 0.04, dist: 3.3, shift: -0.75, chart: 1 },
  portrait: { shift: 0, dist: 4, lift: -0.3 },
}));

const KEYS: Key[] = [
  { at: ['hero', 0], shot: { az: 0.5, el: 0.18, dist: 3.4, shift: -0.65, lift: 0.02, spin: 0.12, fold: 0, style: 0 }, portrait: { shift: 0, dist: 4.8, lift: -0.4 } },
  { at: ['hero', 1, -0.3], shot: { az: -0.6, el: 0.35, dist: 3.6, shift: -0.4, spin: 0, fold: 0.6 }, portrait: { shift: 0, dist: 5 } },
  ...styleKeys,
  { at: ['lenses', 0, -0.4], shot: { az: 0, el: 0.06, dist: 3.3, shift: -0.75, fold: 0, lens: 0, chart: 1, style: 1 }, portrait: { shift: 0, dist: 4, lift: -0.3 } },
  ...lensKeys,
  { at: ['collections', 0, -0.8], shot: { az: 1.2, el: 0.9, dist: 4, shift: 0, chart: 0, lens: 0 } },
  { at: ['outro', 0, -0.5], shot: { az: -0.9, el: 0.5, dist: 4, shift: 0, fold: 0.5, style: 3 }, portrait: { dist: 5 } },
  { at: ['outro', 0, 0.3], shot: { az: 0.35, el: 0.12, dist: 3.2, shift: 0, lift: 0.18, fold: 0, spin: 0.15 }, portrait: { dist: 4.6 } },
];

type Resolved = { y: number; shot: Shot; portrait: Shot };
let resolved: Resolved[] = [];

export function resolveKeys(): void {
  const vh = window.innerHeight;
  const scrollY = window.scrollY;
  let prev = BASE;
  let prevPortrait = BASE;
  const next: Resolved[] = [];
  for (const key of KEYS) {
    const [id, p, off = 0] = key.at;
    const el = document.getElementById(id);
    if (!el) continue;
    const rect = el.getBoundingClientRect();
    const top = rect.top + scrollY;
    const span = Math.max(rect.height - vh, 0);
    const shot = { ...prev, ...key.shot };
    const portrait = { ...prevPortrait, ...key.shot, ...key.portrait };
    next.push({ y: top + p * span + off * vh, shot, portrait });
    prev = shot;
    prevPortrait = portrait;
  }
  resolved = next.sort((a, b) => a.y - b.y);
}

const out: Shot = { ...BASE };

export function shotAt(scrollY: number, portrait: boolean): Shot {
  if (resolved.length === 0) return out;
  const pick = (r: Resolved) => (portrait ? r.portrait : r.shot);
  let i = 0;
  while (i < resolved.length - 1 && scrollY > resolved[i + 1].y) i++;
  const a = resolved[i];
  const b = resolved[Math.min(i + 1, resolved.length - 1)];
  const span = b.y - a.y;
  const t = a === b ? 0 : span < 1 ? 1 : smoothstep(clamp((scrollY - a.y) / span, 0, 1));
  const pa = pick(a);
  const pb = pick(b);
  for (const k of Object.keys(out) as (keyof Shot)[]) out[k] = lerp(pa[k], pb[k], t);
  return out;
}

export const stage = {
  pointer: { x: 0, y: 0 },
  intro: 0,
  velocity: 0,
  style: 0,
  lens: 0,
};

export const live: Shot = { ...BASE };
