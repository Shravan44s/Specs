# Lenskart — See Different (unofficial 3D concept)

A scroll-driven 3D eyewear experience built with Next.js 16, React Three Fiber, GSAP ScrollTrigger and Lenis.

- **Hero** — a photoreal pair of glasses floats in a white product studio; the temples unfold.
- **Frame shapes** — the same pair morphs through Round, Rectangle, Aviator, Cat-eye, Wayfarer and Clubmaster (metal, polished acetate, tortoiseshell).
- **Lens technology** — transmissive glass lenses over an eye chart: clear, blue-cut, anti-glare, photochromic, polarized.
- **Collections**, an interactive **face-shape finder**, the **story** in numbers, and a call to action.

The glasses are fully procedural (`src/components/canvas/Glasses.tsx`): each rim is a parametric curve swept into a tube, so styles blend continuously.

```bash
npm install
npm run dev
```

Unofficial design concept for portfolio purposes. Not affiliated with, endorsed by or operated by Lenskart. No purchases or personal data are taken.
