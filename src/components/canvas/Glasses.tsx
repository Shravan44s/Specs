'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { STYLES, type Style } from '@/data/content';
import { LENS_COUNT, STYLE_COUNT, live, stage } from '@/lib/stage';
import { damp } from '@/lib/utils';

/**
 * A procedural pair of glasses. Each rim is a closed curve from a handful of shape
 * parameters (superellipse + cat-eye lift + aviator teardrop + flat top), swept into a
 * tube whose cross-section thickens for acetate and thins for metal. Morphing between
 * styles just blends the parameters, so the frame flows from round to aviator to
 * cat-eye. Lenses are real transmissive glass; temples hinge open and shut.
 */

const N = 160; // points around a rim
const R = 14; // points around the rim cross-section
const BRIDGE = 0.085;

type Shape = Style['shape'];

function mixShape(a: Shape, b: Shape, f: number): Shape {
  const m = (x: number, y: number) => x + (y - x) * f;
  return { a: m(a.a, b.a), b: m(a.b, b.b), n: m(a.n, b.n), cat: m(a.cat, b.cat), avi: m(a.avi, b.avi), brow: m(a.brow, b.brow), flatTop: m(a.flatTop, b.flatTop) };
}

/** Rim point for parameter t ∈ [0,1), lens-local, outer side toward +x. */
function rim(t: number, s: Shape, out: THREE.Vector2) {
  const th = t * Math.PI * 2;
  const c = Math.cos(th);
  const si = Math.sin(th);
  const n = si > 0 ? s.n + s.flatTop * 5 : s.n;
  let x = s.a * Math.sign(c) * Math.pow(Math.abs(c), 2 / n);
  let y = s.b * Math.sign(si) * Math.pow(Math.abs(si), 2 / n);
  const nx = x / s.a;
  const ny = y / s.b;
  // Cat-eye: lift and pull out the outer-top corner.
  const ox = Math.max(0, nx);
  const lift = ox * ox * (3 - 2 * ox); // smoothstep toward the outer edge
  y += s.cat * 0.07 * lift * Math.pow(Math.max(0, ny), 1.5);
  x += s.cat * 0.02 * lift * Math.max(0, ny);
  // Aviator: a teardrop that drops deeper toward the nose.
  if (ny < 0) y *= 1 + s.avi * 0.42 * (1 - Math.min(1, (nx + 0.35) ** 2));
  out.set(x, y);
  return out;
}

/** Tortoiseshell acetate, drawn once. */
function tortoise(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 128;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#c98a3a';
  ctx.fillRect(0, 0, 512, 128);
  for (let i = 0; i < 260; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 128;
    const r = 6 + Math.random() * 26;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    const dark = Math.random() < 0.6;
    g.addColorStop(0, dark ? 'rgba(40,16,4,0.85)' : 'rgba(240,180,90,0.6)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(x, y, r * 1.8, r, Math.random() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

/** A Snellen-style eye chart. */
function chartTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 1024;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#fbfcff';
  ctx.fillRect(0, 0, 1024, 1024);
  ctx.fillStyle = '#0b1230';
  ctx.textAlign = 'center';
  const rows = ['E', 'F P', 'T O Z', 'L P E D', 'P E C F D', 'E D F C Z P', 'F E L O P Z D', 'D E F P O T E C'];
  let y = 170;
  rows.forEach((r, i) => {
    const size = 170 / (1 + i * 0.62);
    ctx.font = `700 ${size}px Arial, Helvetica, sans-serif`;
    ctx.fillText(r, 512, y);
    ctx.font = '500 16px monospace';
    ctx.fillStyle = '#e3204b';
    ctx.fillText(String(i + 1), 900, y - size * 0.3);
    ctx.fillStyle = '#0b1230';
    y += size * 1.05 + 26;
  });
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

type LensLook = { color: string; transmission: number; iridescence: number; iriMin: number; iriMax: number; tint: number };
const LOOKS: LensLook[] = [
  { color: '#ffffff', transmission: 1, iridescence: 0, iriMin: 100, iriMax: 400, tint: 0 },
  { color: '#f4f6ff', transmission: 1, iridescence: 1, iriMin: 120, iriMax: 300, tint: 0.05 },
  { color: '#ffffff', transmission: 1, iridescence: 0.8, iriMin: 300, iriMax: 520, tint: 0 },
  { color: '#3d3a42', transmission: 0.72, iridescence: 0.2, iriMin: 200, iriMax: 400, tint: 0.65 },
  { color: '#2c3a33', transmission: 0.6, iridescence: 0.5, iriMin: 380, iriMax: 600, tint: 0.75 },
];

export function Glasses() {
  const root = useRef<THREE.Group>(null);
  const templeR = useRef<THREE.Group>(null);
  const templeL = useRef<THREE.Group>(null);
  const chart = useRef<THREE.Mesh>(null);
  const last = useRef(-1);
  const bridgeMesh = useRef<THREE.Mesh>(null);
  const topBarMesh = useRef<THREE.Mesh>(null);
  const hingeR = useRef<THREE.Mesh>(null);
  const hingeL = useRef<THREE.Mesh>(null);

  const r = useMemo(() => {
    const rimGeo = (mirror: boolean) => {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * R * 3), 3).setUsage(THREE.DynamicDrawUsage));
      g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(N * R * 3), 3).setUsage(THREE.DynamicDrawUsage));
      const uv = new Float32Array(N * R * 2);
      const idx: number[] = [];
      for (let i = 0; i < N; i++)
        for (let j = 0; j < R; j++) {
          uv[(i * R + j) * 2] = (i / N) * 4;
          uv[(i * R + j) * 2 + 1] = j / R;
          const a = i * R + j;
          const b = ((i + 1) % N) * R + j;
          const c = i * R + ((j + 1) % R);
          const d = ((i + 1) % N) * R + ((j + 1) % R);
          if (mirror) idx.push(a, c, b, b, c, d);
          else idx.push(a, b, c, b, d, c);
        }
      g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
      g.setIndex(idx);
      return g;
    };
    const lensGeo = (mirror: boolean) => {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(new Float32Array((N + 1) * 3), 3).setUsage(THREE.DynamicDrawUsage));
      const idx: number[] = [];
      for (let i = 0; i < N; i++) {
        const a = 1 + i;
        const b = 1 + ((i + 1) % N);
        if (mirror) idx.push(0, b, a);
        else idx.push(0, a, b);
      }
      g.setIndex(idx);
      return g;
    };
    const tort = tortoise();
    const white = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1);
    white.needsUpdate = true;
    const frame = new THREE.MeshPhysicalMaterial({ vertexColors: true, map: white, roughness: 0.18, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.04 });
    const lens = new THREE.MeshPhysicalMaterial({ color: '#ffffff', transmission: 1, thickness: 0.03, roughness: 0.02, ior: 1.52, metalness: 0, iridescenceIOR: 1.35, iridescenceThicknessRange: [100, 400], specularIntensity: 1, envMapIntensity: 1.2, side: THREE.DoubleSide, transparent: true, opacity: 1 });
    const metal = new THREE.MeshStandardMaterial({ color: '#c9ccd2', metalness: 1, roughness: 0.2 });
    // Temples and bridge: same finish as the front, solid colour (no vertex colours).
    const arms = new THREE.MeshPhysicalMaterial({ color: '#14151a', roughness: 0.18, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.04 });
    const pad = new THREE.MeshPhysicalMaterial({ color: '#ffffff', transmission: 0.8, roughness: 0.2, thickness: 0.01 });
    const chartMat = new THREE.MeshBasicMaterial({ map: chartTexture(), transparent: true, opacity: 0, toneMapped: false });
    const temple = (side: 1 | -1) =>
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3([
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(0.01 * side, 0, -0.3),
          new THREE.Vector3(0.025 * side, -0.005, -0.72),
          new THREE.Vector3(0.03 * side, -0.05, -0.92),
          new THREE.Vector3(0.025 * side, -0.16, -1.02),
        ]),
        64,
        0.016,
        12,
        false,
      ).scale(1, 1.5, 1);
    return {
      rimR: rimGeo(false),
      rimL: rimGeo(true),
      lensR: lensGeo(false),
      lensL: lensGeo(true),
      bridge: new THREE.BufferGeometry(),
      topBar: new THREE.BufferGeometry(),
      templeGeoR: temple(1),
      templeGeoL: temple(-1),
      frame,
      arms,
      lens,
      metal,
      pad,
      chartMat,
      tort,
      white,
      tmp: new THREE.Vector2(),
      tmp2: new THREE.Vector2(),
      col: new THREE.Color(),
      colA: new THREE.Color(),
      colB: new THREE.Color(),
      gold: new THREE.Color('#c9a45a'),
    };
  }, []);

  useEffect(
    () => () => {
      [r.rimR, r.rimL, r.lensR, r.lensL, r.bridge, r.topBar, r.templeGeoR, r.templeGeoL].forEach((g) => g.dispose());
      [r.frame, r.arms, r.lens, r.metal, r.pad, r.chartMat].forEach((m) => m.dispose());
      r.tort.dispose();
      r.white.dispose();
      r.chartMat.map?.dispose();
    },
    [r],
  );

  /** Rebuild rims, lenses and bridge for a blended style. */
  const rebuild = (styleF: number) => {
    const lo = Math.floor(styleF);
    const hi = Math.min(lo + 1, STYLE_COUNT - 1);
    const f = styleF - lo;
    const A = STYLES[lo];
    const B = STYLES[hi];
    const s = mixShape(A.shape, B.shape, f);
    const metal = (A.finish.metal ? 1 : 0) * (1 - f) + (B.finish.metal ? 1 : 0) * f;
    r.colA.set(A.finish.color);
    r.colB.set(B.finish.color);
    const base = r.col.copy(r.colA).lerp(r.colB, f);
    const cx = s.a + BRIDGE / 2 + 0.03;
    const w0 = 0.032 * (1 - metal) + 0.011 * metal; // in-plane half width
    const d0 = 0.03 * (1 - metal) + 0.011 * metal; // depth half

    for (const [geo, lensG, side] of [
      [r.rimR, r.lensR, 1],
      [r.rimL, r.lensL, -1],
    ] as const) {
      const pos = geo.attributes.position.array as Float32Array;
      const colA = geo.attributes.color.array as Float32Array;
      const lp = lensG.attributes.position.array as Float32Array;
      lp[0] = cx * side;
      lp[1] = 0;
      lp[2] = 0.012;
      for (let i = 0; i < N; i++) {
        const p = rim(i / N, s, r.tmp);
        const px = p.x;
        const py = p.y;
        const q = rim(((i + 1) % N) / N, s, r.tmp2);
        const p0 = rim((i - 1 + N) / N, s, new THREE.Vector2());
        let tx = q.x - p0.x;
        let ty = q.y - p0.y;
        const tl = Math.hypot(tx, ty) || 1;
        tx /= tl;
        ty /= tl;
        const nx = ty; // outward in-plane normal for a CCW curve
        const ny = -tx;
        const top = py > 0 ? py / s.b : 0;
        // Browline: heavy top, hairline bottom.
        const brow = 1 + s.brow * (top > 0 ? 0.6 * Math.min(1, top * 2) : -0.55);
        const w = w0 * brow;
        const d = d0 * (1 + s.brow * (top > 0 ? 0.15 : -0.4));
        const goldBottom = s.brow > 0.5 && py < 0;
        for (let j = 0; j < R; j++) {
          const ph = (j / R) * Math.PI * 2;
          const ox = nx * w * Math.cos(ph);
          const oy = ny * w * Math.cos(ph);
          const oz = d * Math.sin(ph);
          const v = (i * R + j) * 3;
          pos[v] = (px + ox + cx) * side;
          pos[v + 1] = py + oy;
          pos[v + 2] = oz;
          const c = goldBottom ? r.gold : base;
          colA[v] = c.r;
          colA[v + 1] = c.g;
          colA[v + 2] = c.b;
        }
        // Lens edge sits inside the rim groove.
        const inset = w * 0.4;
        lp[(i + 1) * 3] = (px - nx * inset + cx) * side;
        lp[(i + 1) * 3 + 1] = py - ny * inset;
        lp[(i + 1) * 3 + 2] = -0.006 * (1 - Math.hypot(px / s.a, py / s.b));
      }
      geo.attributes.position.needsUpdate = true;
      geo.attributes.color.needsUpdate = true;
      geo.computeVertexNormals();
      geo.computeBoundingSphere();
      lensG.attributes.position.needsUpdate = true;
      lensG.computeVertexNormals();
      lensG.computeBoundingSphere();
    }

    // Bridge between the inner-top of each rim, and the aviator's top bar.
    const ix = cx - s.a * 0.92;
    const iy = s.b * 0.38;
    r.bridge.dispose();
    r.bridge = new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([new THREE.Vector3(ix, iy, 0), new THREE.Vector3(0.02, iy + 0.03 + s.avi * 0.01, 0.02), new THREE.Vector3(-0.02, iy + 0.03 + s.avi * 0.01, 0.02), new THREE.Vector3(-ix, iy, 0)]),
      24,
      Math.max(w0, d0) * 0.75,
      10,
    );
    r.topBar.dispose();
    const ty = s.b * 0.92;
    r.topBar = new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([new THREE.Vector3(cx - s.a * 0.55, ty, 0), new THREE.Vector3(0, ty + 0.012, 0.01), new THREE.Vector3(-(cx - s.a * 0.55), ty, 0)]),
      24,
      0.008,
      8,
    );
    if (bridgeMesh.current) bridgeMesh.current.geometry = r.bridge;
    if (topBarMesh.current) {
      topBarMesh.current.geometry = r.topBar;
      topBarMesh.current.visible = s.avi > 0.4;
    }

    // Material: metal vs polished acetate, tortoise where it applies.
    r.frame.metalness = metal;
    r.frame.roughness = 0.14 + metal * 0.1;
    r.frame.clearcoat = 1 - metal;
    // Arms follow the frame; tortoise styles get a matching brown.
    r.arms.color.copy(base);
    if ((f < 0.5 ? A : B).finish.tortoise) r.arms.color.set('#6a3a16');
    r.arms.metalness = metal;
    r.arms.roughness = 0.14 + metal * 0.1;
    r.arms.clearcoat = 1 - metal;
    const useTort = (f < 0.5 ? A : B).finish.tortoise;
    const want = useTort ? r.tort : r.white;
    if (r.frame.map !== want) {
      r.frame.map = want;
      r.frame.needsUpdate = true;
    }
    // Hinges sit on the outer-top of each rim.
    const hx = cx + s.a * 0.98;
    const hy = s.b * 0.42;
    templeR.current?.position.set(hx, hy, -0.02);
    templeL.current?.position.set(-hx, hy, -0.02);
    hingeR.current?.position.set(hx - 0.01, hy, -0.01);
    hingeL.current?.position.set(-hx + 0.01, hy, -0.01);
  };


  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    const styleF = Math.max(0, Math.min(STYLE_COUNT - 1, live.style));
    stage.style = styleF;
    if (Math.abs(styleF - last.current) > 0.0005) {
      rebuild(styleF);
      last.current = styleF;
    }

    // Lens look.
    const lensF = Math.max(0, Math.min(LENS_COUNT - 1, live.lens));
    stage.lens = lensF;
    const lo = Math.floor(lensF);
    const hi = Math.min(lo + 1, LENS_COUNT - 1);
    const f = lensF - lo;
    const A = LOOKS[lo];
    const B = LOOKS[hi];
    const m = (x: number, y: number) => x + (y - x) * f;
    r.lens.color.set(A.color).lerp(new THREE.Color(B.color), f);
    // Photochromic breathes: darkens and clears as if stepping in and out of sun.
    const photo = Math.max(0, 1 - Math.abs(lensF - 3));
    const breathe = photo * (0.5 + 0.5 * Math.sin(t * 0.9));
    r.lens.transmission = m(A.transmission, B.transmission) + breathe * 0.25;
    r.lens.iridescence = m(A.iridescence, B.iridescence);
    r.lens.iridescenceThicknessRange = [m(A.iriMin, B.iriMin), m(A.iriMax, B.iriMax)];
    r.chartMat.opacity = damp(r.chartMat.opacity, live.chart, 4, dt);
    if (chart.current) chart.current.visible = r.chartMat.opacity > 0.01;

    // Temples: fold flat, or open with a slight outward splay.
    const fold = Math.max(0, Math.min(1, live.fold));
    const ang = fold * (Math.PI / 2 - 0.06) - (1 - fold) * 0.05;
    if (templeR.current) templeR.current.rotation.y = -ang;
    if (templeL.current) templeL.current.rotation.y = ang;

    if (root.current) {
      root.current.position.y = Math.sin(t * 0.9) * 0.025;
      root.current.rotation.z = Math.sin(t * 0.6) * 0.015;
      root.current.scale.setScalar(0.65 + 0.35 * stage.intro);
    }
  });

  return (
    <group>
      <mesh ref={chart} position={[0, 0.05, -1.4]} visible={false} material={r.chartMat}>
        <planeGeometry args={[1.6, 1.6]} />
      </mesh>
      <group ref={root}>
        <mesh geometry={r.rimR} material={r.frame} castShadow />
        <mesh geometry={r.rimL} material={r.frame} castShadow />
        <mesh geometry={r.lensR} material={r.lens} />
        <mesh geometry={r.lensL} material={r.lens} />
        <mesh ref={bridgeMesh} material={r.arms} castShadow />
        <mesh ref={topBarMesh} material={r.metal} />
        {/* Nose pads on little metal arms. */}
        {[1, -1].map((s) => (
          <group key={s} position={[0.075 * s, -0.02, 0.04]}>
            <mesh material={r.pad} scale={[0.012, 0.03, 0.02]} rotation={[0, 0.5 * s, 0]}>
              <sphereGeometry args={[1, 16, 12]} />
            </mesh>
          </group>
        ))}
        <mesh ref={hingeR} material={r.metal}>
          <boxGeometry args={[0.03, 0.035, 0.05]} />
        </mesh>
        <mesh ref={hingeL} material={r.metal}>
          <boxGeometry args={[0.03, 0.035, 0.05]} />
        </mesh>
        <group ref={templeR}>
          <mesh geometry={r.templeGeoR} material={r.arms} castShadow />
        </group>
        <group ref={templeL}>
          <mesh geometry={r.templeGeoL} material={r.arms} castShadow />
        </group>
      </group>
    </group>
  );
}
