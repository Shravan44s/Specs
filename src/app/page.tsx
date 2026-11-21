import { StageMount } from '@/components/canvas/StageMount';
import { SmoothScroll } from '@/components/providers/SmoothScroll';
import { Collections } from '@/components/sections/Collections';
import { Finder } from '@/components/sections/Finder';
import { Hero } from '@/components/sections/Hero';
import { Lenses } from '@/components/sections/Lenses';
import { Outro } from '@/components/sections/Outro';
import { SceneOccluder } from '@/components/sections/SceneOccluder';
import { Story } from '@/components/sections/Story';
import { Styles } from '@/components/sections/Styles';
import { Cursor } from '@/components/ui/Cursor';
import { Loader } from '@/components/ui/Loader';
import { Nav } from '@/components/ui/Nav';

export default function Home() {
  return (
    <SmoothScroll>
      <Loader />
      <StageMount />
      <Nav />
      <Cursor />
      <div className="grain" aria-hidden />
      <main className="relative z-10">
        <Hero />
        <Styles />
        <Lenses />
        <SceneOccluder>
          <Collections />
          <Finder />
          <Story />
        </SceneOccluder>
        <Outro />
      </main>
    </SmoothScroll>
  );
}
