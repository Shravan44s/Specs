'use client';

import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, PerformanceMonitor } from '@react-three/drei';
import { Bloom, EffectComposer, ToneMapping } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import * as THREE from 'three';
import { useApp } from '@/lib/store';
import { live, resolveKeys, shotAt, stage } from '@/lib/stage';
import { TIER_DPR, detectTier, downgrade, type Tier } from '@/lib/tier';
import { damp, spring, type Spring } from '@/lib/utils';
import { Glasses } from './Glasses';

function ReadySignal() {
  const frames = useRef(0);
  useFrame(() => {
    if (frames.current++ === 4) useApp.getState().setSceneReady();
  });
  return null;
}

/** A painted soft shadow under the pair: cheap, and identical on every GPU. */
function SoftShadow() {
  const tex = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const ctx = c.getContext('2d')!;
    const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, 'rgba(11,18,56,0.32)');
    g.addColorStop(0.55, 'rgba(11,18,56,0.08)');
    g.addColorStop(1, 'rgba(11,18,56,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }, []);
  useEffect(() => () => tex.dispose(), [tex]);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.36, -0.35]} scale={[2.4, 1.5, 1]}>
      <planeGeometry />
      <meshBasicMaterial map={tex} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

function Director() {
  const size = useThree((s) => s.size);
  const portrait = size.width < 768 || size.width / size.height < 0.9;
  const sp = useRef<Record<'az' | 'el' | 'dist' | 'shift' | 'lift' | 'fov', Spring>>({
    az: { x: 0.4, v: 0 },
    el: { x: 0.2, v: 0 },
    dist: { x: 5, v: 0 },
    shift: { x: 0, v: 0 },
    lift: { x: 0, v: 0 },
    fov: { x: 30, v: 0 },
  });
  const extra = useRef({ orbit: 0, px: 0, py: 0 });
  const v = useMemo(() => ({ off: new THREE.Vector3(), target: new THREE.Vector3(), right: new THREE.Vector3(), up: new THREE.Vector3(0, 1, 0) }), []);

  useEffect(() => {
    resolveKeys();
    const onRefresh = () => resolveKeys();
    window.addEventListener('lk:layout', onRefresh);
    document.fonts?.ready.then(onRefresh);
    return () => window.removeEventListener('lk:layout', onRefresh);
  }, [size.width, size.height]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 20);
    const shot = shotAt(window.scrollY, portrait);
    const s = sp.current;
    const x = extra.current;
    live.style = damp(live.style, shot.style, 3, dt);
    live.fold = damp(live.fold, shot.fold, 3, dt);
    live.lens = damp(live.lens, shot.lens, 3, dt);
    live.chart = damp(live.chart, shot.chart, 3, dt);
    if (shot.spin > 0.001) x.orbit += shot.spin * dt;
    else x.orbit = damp(x.orbit, Math.round(x.orbit / (Math.PI * 2)) * Math.PI * 2, 0.8, dt);
    const K = 16;
    spring(s.az, shot.az + x.orbit, K, 1, dt);
    spring(s.el, shot.el, K, 1, dt);
    spring(s.dist, shot.dist + (1 - stage.intro) * 1.5, K, 1, dt);
    spring(s.shift, shot.shift, K, 1, dt);
    spring(s.lift, shot.lift, K, 1, dt);
    spring(s.fov, shot.fov, K * 0.6, 1, dt);
    x.px = damp(x.px, stage.pointer.x, 2, dt);
    x.py = damp(x.py, stage.pointer.y, 2, dt);
    const az = s.az.x + x.px * 0.12;
    const el = s.el.x + x.py * 0.06;
    v.off.set(Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)).multiplyScalar(s.dist.x);
    v.right.copy(v.off).negate().cross(v.up).normalize();
    v.target.set(0, s.lift.x, 0).addScaledVector(v.right, s.shift.x);
    const cam = state.camera as THREE.PerspectiveCamera;
    cam.position.copy(v.target).add(v.off);
    cam.lookAt(v.target);
    if (Math.abs(cam.fov - s.fov.x) > 0.01) {
      cam.fov = s.fov.x;
      cam.updateProjectionMatrix();
    }
  });
  return null;
}

function Effects({ tier }: { tier: Tier }) {
  if (tier === 'low') return null;
  return (
    <EffectComposer multisampling={4}>
      <Bloom mipmapBlur luminanceThreshold={1.1} luminanceSmoothing={0.2} intensity={0.35} radius={0.6} />
      <ToneMapping mode={ToneMappingMode.AGX} />
    </EffectComposer>
  );
}

export default function Stage() {
  const tier = useApp((s) => s.tier);
  const setTier = useApp((s) => s.setTier);
  const visible = useApp((s) => s.sceneVisible);

  useEffect(() => {
    if (!useApp.getState().tier) setTier(detectTier());
  }, [setTier]);

  if (!tier) return null;

  return (
    <Canvas
      dpr={TIER_DPR[tier]}
      frameloop={visible ? 'always' : 'never'}
      camera={{ position: [2, 0.6, 3.5], fov: 30, near: 0.02, far: 50 }}
      gl={{ antialias: true, powerPreference: 'high-performance', alpha: false, stencil: false, toneMapping: tier === 'low' ? THREE.AgXToneMapping : THREE.NoToneMapping }}
      aria-hidden
    >
      <color attach="background" args={['#eef1f7']} />
      <PerformanceMonitor flipflops={2} onDecline={() => tier !== 'low' && setTier(downgrade(tier))} />
      {/* A white product studio made of softboxes: crisp highlights on acetate and glass. */}
      <Environment resolution={256} frames={1}>
        <color attach="background" args={['#dfe5f0']} />
        <Lightformer form="rect" intensity={4} position={[0, 4, 2]} rotation-x={Math.PI / 2.4} scale={[6, 2, 1]} />
        <Lightformer form="rect" intensity={2.5} position={[-4, 1, 2]} rotation-y={Math.PI / 2.5} scale={[3, 3, 1]} />
        <Lightformer form="rect" intensity={2.5} position={[4, 1, 2]} rotation-y={-Math.PI / 2.5} scale={[3, 3, 1]} />
        <Lightformer form="ring" color="#3fe0d0" intensity={2} position={[0, 0.5, -4]} scale={2.5} />
      </Environment>
      <ambientLight intensity={0.6} />
      <directionalLight position={[2, 4, 3]} intensity={1.6} />
      <Director />
      <Suspense fallback={null}>
        <Glasses />
        <SoftShadow />
        <Effects tier={tier} />
        <ReadySignal />
      </Suspense>
    </Canvas>
  );
}
