'use client';

import { useState, useRef, JSX } from 'react';

import RealGalaxy from '@/components/RealGalaxy';
import RealGalaxy_v1 from '@/components/RealGalaxy_v1';
import RealGalaxy_v2 from '@/components/RealGalaxy_v2';
import RealGalaxy_v3 from '@/components/RealGalaxy_v3';
import RealGalaxy_v4 from '@/components/RealGalaxy_v4';
import RealGalaxy_v5 from '@/components/RealGalaxy_v5';
import RealGalaxy_v6 from '@/components/RealGalaxy_v6';
import RealGalaxy_v7 from '@/components/RealGalaxy_v7';
import RealGalaxy_v8 from '@/components/RealGalaxy_v8';

export default function HomePage() {
  const [selected, setSelected] = useState('default');
  const containerRef = useRef<HTMLDivElement>(null);

  const goFullScreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const galaxies: Record<string, JSX.Element> = {
    default: <RealGalaxy />,
    v1: <RealGalaxy_v1 />,
    v2: <RealGalaxy_v2 />,
    v3: <RealGalaxy_v3 />,
    v4: <RealGalaxy_v4 />,
    v5: <RealGalaxy_v5 />,
    v6: <RealGalaxy_v6 />,
    v7: <RealGalaxy_v7 />,
    v8: <RealGalaxy_v8 />,
  };

  return (
    <main className="fixed inset-0 w-screen h-screen bg-black overflow-hidden">
      {/* Top Bar */}
      <div className="absolute top-3 left-3 z-50 flex gap-3">
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="bg-black/70 text-white border border-gray-600 px-3 py-1 rounded"
        >
          <option value="default">Real Galaxy (Default)</option>
          <option value="v1">Galaxy v1</option>
          <option value="v2">Galaxy v2</option>
          <option value="v3">Galaxy v3</option>
          <option value="v4">Galaxy v4</option>
          <option value="v5">Galaxy v5</option>
          <option value="v6">Galaxy v6</option>
          <option value="v7">Galaxy v7</option>
          <option value="v8">Galaxy v8</option>
        </select>
      </div>

      {/* Fullscreen Button */}
      <button
        onClick={goFullScreen}
        className="absolute top-3 right-3 z-50 bg-black/70 text-white border border-gray-600 px-3 py-1 rounded hover:bg-black"
      >
        ⛶
      </button>

      {/* Galaxy Container */}
      <div ref={containerRef} className="w-full h-full">
        {galaxies[selected]}
      </div>
    </main>
  );
}
