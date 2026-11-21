/**
 * Unofficial design concept. Facts about Lenskart are drawn from public reporting and
 * kept general; product lines are named only to describe them.
 */

export type Style = {
  name: string;
  faces: string;
  note: string;
  /** Frame material look. */
  finish: { color: string; tortoise?: boolean; metal?: boolean };
  /** Shape parameters for the rim curve (see canvas/frames.ts). */
  shape: { a: number; b: number; n: number; cat: number; avi: number; brow: number; flatTop: number };
};

export const STYLES: Style[] = [
  { name: 'Round', faces: 'Square · rectangular', note: 'Soft circles balance strong jaws and angular features. Bookish, timeless, a little rebellious.', finish: { color: '#c79a4b', metal: true }, shape: { a: 0.23, b: 0.22, n: 2, cat: 0, avi: 0, brow: 0, flatTop: 0 } },
  { name: 'Rectangle', faces: 'Round · oval', note: 'Clean horizontal lines add structure to softer faces. The everyday office hero.', finish: { color: '#14151a' }, shape: { a: 0.27, b: 0.18, n: 4.6, cat: 0, avi: 0, brow: 0, flatTop: 0.1 } },
  { name: 'Aviator', faces: 'Oval · heart · square', note: 'The teardrop born in a cockpit. Thin metal, double bridge, instant confidence.', finish: { color: '#b8bcc4', metal: true }, shape: { a: 0.27, b: 0.23, n: 2.4, cat: 0, avi: 1, brow: 0, flatTop: 0.25 } },
  { name: 'Cat-eye', faces: 'Heart · diamond · round', note: 'Up-swept outer corners lift the cheekbones. Fifties glamour, modern edge.', finish: { color: '#7a1830' }, shape: { a: 0.26, b: 0.18, n: 2.7, cat: 1, avi: 0, brow: 0, flatTop: 0 } },
  { name: 'Wayfarer', faces: 'Oval · round · oblong', note: 'The trapezoid that every decade borrows. Thick acetate, slightly tapered.', finish: { color: '#f3e6d2', tortoise: true }, shape: { a: 0.27, b: 0.2, n: 3.6, cat: 0.35, avi: 0.2, brow: 0, flatTop: 0.2 } },
  { name: 'Clubmaster', faces: 'Oval · square · oblong', note: 'A bold browline over a slim metal lower rim. Mid-century intellectual.', finish: { color: '#1b1b1f' }, shape: { a: 0.26, b: 0.2, n: 2.8, cat: 0.15, avi: 0, brow: 1, flatTop: 0.25 } },
];

export type LensTech = { name: string; kicker: string; body: string; stat: [string, string] };

export const LENSES: LensTech[] = [
  { name: 'Clear', kicker: 'Base · 1.56 index', body: 'Thin, light lenses ground to your prescription. Everything else is a layer on top.', stat: ['Layers', '1'] },
  { name: 'Blue-cut', kicker: 'For screens', body: 'A coating that reflects part of the high-energy blue light from phones and laptops. Look for the faint blue sheen on the surface.', stat: ['Screen time', 'All day'] },
  { name: 'Anti-glare', kicker: 'Multi-layer AR', body: 'Ultra-thin layers cancel reflections, so people see your eyes, not the ceiling lights, and night driving feels calmer.', stat: ['Reflections', '≈ −99%'] },
  { name: 'Photochromic', kicker: 'Indoors ↔ outdoors', body: 'Molecules in the lens darken under UV in sunlight and clear again indoors. One pair, two jobs.', stat: ['Switch time', '~30 s'] },
  { name: 'Polarized', kicker: 'For the road & water', body: 'A vertical filter blocks horizontally polarized glare bouncing off roads, cars and water.', stat: ['Glare', 'Blocked'] },
];

export type Collection = { name: string; line: string; body: string; hue: [string, string] };

export const COLLECTIONS: Collection[] = [
  { name: 'Vincent Chase', line: 'Fashion-forward everyday frames', body: 'Trend-led shapes and colours at an approachable price.', hue: ['#0b1340', '#7ae3d7'] },
  { name: 'John Jacobs', line: 'Premium, designed in Europe', body: 'Considered materials, quieter design, a little more luxury.', hue: ['#1b1b1f', '#d8c69a'] },
  { name: 'Lenskart Air', line: 'Feather-light flexible frames', body: 'Lightweight frames built to be forgotten on your face.', hue: ['#e7f1ff', '#2457ff'] },
  { name: 'Hustlr', line: 'Built for movement', body: 'Sporty, grippy and tough enough for the daily rush.', hue: ['#14221c', '#b5ff5a'] },
];

export type Fact = { value: number; suffix?: string; prefix?: string; label: string; detail: string };

export const FACTS: Fact[] = [
  { value: 2010, label: 'Founded', detail: 'Started online in India by Peyush Bansal with co-founders Amit Chaudhary and Sumeet Kapahi.' },
  { value: 2000, suffix: '+', label: 'Stores', detail: 'An omnichannel network across India and international markets, alongside the app and website.' },
  { value: 3, suffix: 'D', label: 'Virtual try-on', detail: 'Try frames on your own face from your phone before you buy.' },
  { value: 1, label: 'Mega factory', detail: 'Frames and lenses are made at scale in its own manufacturing facility in Rajasthan.' },
];

export type Shape = { id: string; name: string; tip: string; picks: number[] };

/** Face-shape finder: which of STYLES suit which face. */
export const FACES: Shape[] = [
  { id: 'round', name: 'Round', tip: 'Add angles and width: frames wider than they are tall.', picks: [1, 4, 3] },
  { id: 'square', name: 'Square', tip: 'Soften strong jaws with curves and thinner rims.', picks: [0, 2, 3] },
  { id: 'oval', name: 'Oval', tip: 'Lucky you — almost everything works. Go bold.', picks: [2, 4, 5] },
  { id: 'heart', name: 'Heart', tip: 'Balance a wider forehead with bottom-heavy or light frames.', picks: [2, 0, 3] },
  { id: 'oblong', name: 'Oblong', tip: 'Deeper frames shorten a longer face.', picks: [4, 5, 0] },
];
