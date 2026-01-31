"use client";

import { useEffect, useRef } from "react";

const FEATURES = {
  audio: true,
  breathing: true,
  scrollGravity: true,
  lowPowerFallback: true
};

export default function GalaxyPortfolio() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const isLowPower =
      FEATURES.lowPowerFallback &&
      (window.innerWidth < 768 || navigator.hardwareConcurrency <= 4);

    const STAR_COUNT = isLowPower ? 1200 : 4000;

    const cx = () => canvas.width / 2;
    const cy = () => canvas.height / 2;

    const stars = Array.from({ length: STAR_COUNT }).map(() => {
      const r = Math.random() ** 0.6 * Math.min(canvas.width, canvas.height) * 0.48;
      return {
        angle: Math.random() * Math.PI * 2,
        radius: r,
        speed: 0.00015 + (r / canvas.width) * 0.001,
        size: Math.random() * 1.5 + 0.3,
        alpha: Math.random() * 0.8 + 0.2
      };
    });

    // ---- AUDIO (optional, user-initiated safe) ----
    let analyser: AnalyserNode | null = null;
    let dataArray: Uint8Array | null = null;

    if (FEATURES.audio) {
      window.addEventListener("click", async () => {
        if (analyser) return;
        try {
          const audioCtx = new AudioContext();
          analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          dataArray = new Uint8Array(analyser.frequencyBinCount);
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          const source = audioCtx.createMediaStreamSource(stream);
          source.connect(analyser);
        } catch {}
      }, { once: true });
    }

    let scrollOffset = 0;
    if (FEATURES.scrollGravity) {
      window.addEventListener("scroll", () => {
        scrollOffset = window.scrollY * 0.0002;
      });
    }

    let frameId: number;

    const render = () => {
      ctx.fillStyle = "rgba(5, 7, 15, 0.25)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Event horizon glow
      const g = ctx.createRadialGradient(cx(), cy(), 20, cx(), cy(), 90);
      g.addColorStop(0, "black");
      g.addColorStop(0.4, "rgba(30,40,70,0.9)");
      g.addColorStop(1, "rgba(100,150,255,0.15)");

      ctx.beginPath();
      ctx.arc(cx(), cy(), 90, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx(), cy(), 28, 0, Math.PI * 2);
      ctx.fillStyle = "black";
      ctx.fill();

      let audioEnergy = 1;
      if (analyser && dataArray) {
        analyser.getByteFrequencyData(dataArray as Uint8Array<ArrayBuffer>);
        audioEnergy =
          dataArray.reduce((a, b) => a + b, 0) /
          dataArray.length /
          120;
      }

      const breath =
        FEATURES.breathing
          ? (Math.sin(Date.now() * 0.0008) + 1) / 2
          : 0;

      stars.forEach(s => {
        s.angle += s.speed;
        const r = s.radius * (1 + breath * 0.04) * audioEnergy;
        const warp = FEATURES.scrollGravity
          ? Math.sin(s.angle * 2 + scrollOffset) * 6
          : 0;

        const x = cx() + Math.cos(s.angle) * (r + warp);
        const y = cy() + Math.sin(s.angle) * (r + warp);

        ctx.beginPath();
        ctx.arc(x, y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.alpha})`;
        ctx.fill();
      });

      frameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black text-white overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0" />

      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-5xl font-semibold mb-4">
          Relax. Focus. Create.
        </h1>
        <p className="max-w-xl opacity-80 mb-8">
          A calm, system-driven frontend portfolio built with intent.
        </p>
      </div>
    </div>
  );
}
