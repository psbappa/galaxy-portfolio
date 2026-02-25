/* eslint-disable react-hooks/refs */
/* eslint-disable react-hooks/purity */
/* eslint-disable react-hooks/immutability */
/* eslint-disable react/jsx-no-undef */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import * as THREE from "three";
import { useRef, useEffect, useState, useMemo } from "react";
import ProStarfield from "./ProStarfield";
import SaptarishiStars from "./SaptarishiStars";

/* =====================================================
   SUN (CENTRAL STAR)
===================================================== */
function Sun() {
  const outerRef = useRef<THREE.Mesh>(null!);
  const coreRef = useRef<THREE.Mesh>(null!);
  const outerMat = useRef<THREE.MeshStandardMaterial>(null!);
  const coreMat = useRef<THREE.MeshStandardMaterial>(null!);

  const { camera, clock } = useThree();

  const ZOOM_THRESHOLD = 5;
  const ZOOM_THRESHOLD_SQ = ZOOM_THRESHOLD * ZOOM_THRESHOLD;

  useFrame(() => {
    if (!outerRef.current || !coreRef.current) return;

    // 🚀 Use squared distance (no sqrt)
    const distSq = camera.position.lengthSq();

    // normalize heat
    const heat = THREE.MathUtils.clamp(1 - distSq / ZOOM_THRESHOLD_SQ, 0, 1);

    // Slow rotation
    outerRef.current.rotation.y += 0.0008;
    coreRef.current.rotation.y -= 0.0012;

    // 🔥 Intensity control
    outerMat.current.emissiveIntensity = 1.5 + heat * 2;
    coreMat.current.emissiveIntensity = 3 + heat * 6;

    // 🌡 Frame-synced pulse
    const t = clock.getElapsedTime();
    const pulse = Math.sin(t * 2) * 0.03;

    const scale = 0.75 + heat * 0.25 + pulse;
    coreRef.current.scale.setScalar(scale);
  });

  return (
    <group>
      {/* OUTER */}
      <mesh ref={outerRef}>
        {/* Magic number: 0.7, 16, 16 */}
        <sphereGeometry args={[1.3, 32, 32]} />
        <meshStandardMaterial
          ref={outerMat}
          color="#ff9a00"
          emissive="#ff6a00"
          emissiveIntensity={1.5}
        />
      </mesh>

      {/* CORE */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.9, 24, 24]} />
        <meshStandardMaterial
          ref={coreMat}
          color="#fff2a0"
          emissive="#ffffff"
          emissiveIntensity={2}
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

/* =====================================================
   Moving not LIVING STARS but outer space ke liye perfect hain
===================================================== */
function MovingStars() {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((_, delta) => {
    groupRef.current.rotation.y += delta * 0.02;
  });

  return (
    <group ref={groupRef}>
      <Stars radius={980} depth={400} count={400} factor={0.8} fade />
    </group>
  );
}

/* =====================================================
   OrbitingG and blinking STARS - like sun also
===================================================== */
function OrbitingStars() {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    groupRef.current.rotation.y = t * 0.1;
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <Stars radius={180} depth={900} count={50} factor={1.2} fade />
    </group>
  );
}

/* =====================================================
   OrbitingG STARS - Just like Outside the sun
===================================================== */
function DynamicStars() {
  const pointsRef = useRef<THREE.Points>(null!);
  const starCount = 7;

  const positions = useMemo(() => {
    const arr = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const r = Math.random() * 100;
      const theta = Math.random() * Math.PI * 2;

      arr[i * 3] = Math.cos(theta) * r;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 20;
      arr[i * 3 + 2] = Math.sin(theta) * r;
    }
    return arr;
  }, []);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    pointsRef.current.rotation.y = t * 0.03;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} sizeAttenuation />
    </points>
  );
}

/* =====================================================
   GalaxyBackground STARS
===================================================== */
function GalaxyBackground() {
  const ref = useRef<THREE.Group>(null!);

  useFrame((_, delta) => {
    ref.current.rotation.y += delta * 0.01;
  });

  return (
    <group ref={ref}>
      <Stars radius={200} depth={120} count={200} factor={1.5} fade />
    </group>
  );
}

/* =====================================================
   DEEP SPACE RED STAR
===================================================== */

/* =====================================================
   LOCAL STAR DUST
===================================================== */

/* =====================================================
   MOVING EARTH
===================================================== */

/* =====================================================
   PARALLAX GROUP
===================================================== */

/* =====================================================
   CAMERA DUST
===================================================== */

/* =====================================================
   SATURN
===================================================== */

/* =====================================================
   STAR LAYER GROUP (DYNAMIC ZOOM-BASED)
===================================================== */

/* =========================
   CAMERA LOCK (IMPORTANT)
========================= */

/* =========================
   DISTANT SMALL SPACE STATION
========================= */

/* =========================
   BlinkingStars
========================= */

/* =========================
   MilkyWayGalaxy
========================= */

/* =====================================================
   MAIN SCENE + LOADING OVERLAY
===================================================== */
export default function RealGalaxy() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 3000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      {/* LOADING OVERLAY */}
      {loading && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle at center, #02030a, #000)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
            animation: "fadeOut 2.8s forwards",
          }}
        >
          <div
            style={{
              color: "#9fdcff",
              fontSize: "1.2rem",
              letterSpacing: "0.15em",
              textAlign: "center",
              animation: "pulse 1.8s ease-in-out infinite",
            }}
          >
            OTHER PLANETS ARE YET TO BE READY TO LAUNCH…
          </div>

          <style>{`
            @keyframes fadeOut {
              0% { opacity: 1; }
              70% { opacity: 1; }
              100% { opacity: 0; }
            }
            @keyframes pulse {
              0% { opacity: 0.4; transform: scale(0.98); }
              50% { opacity: 1; transform: scale(1); }
              100% { opacity: 0.4; transform: scale(0.98); }
            }
          `}</style>
        </div>
      )}

      {/* CANVAS */}
      {!loading && (
        <Canvas
          camera={{
            position: [0, 3, 14],
            fov: 45,
            near: 0.1,
            far: 5000,
          }}
        >
          <color attach="background" args={["#0a0202"]} />

          {/* <MovingStars /> */}
          {/* <OrbitingStars /> */}
          <Sun />
          {/* <ProStarfield /> */}
          {/* <DynamicStars />           */}
          {/* <GalaxyBackground /> */}

          <SaptarishiStars />

          {/* CAMERA CONTROL */}
          <OrbitControls
            makeDefault
            enablePan
            enableZoom
            enableRotate
            dampingFactor={0.08}
            minDistance={0.1}
            maxDistance={5000}
            zoomSpeed={1.2}
            panSpeed={0.8}
          />

          {/* CINEMATIC POST EFFECTS */}
          <EffectComposer>
            <Bloom
              intensity={3} // 🔥 glow strength
              luminanceThreshold={0.15} // kitna bright hone pe glow aaye
              luminanceSmoothing={0.9}
              blendFunction={BlendFunction.ADD}
            />
            <Vignette
              eskil={false}
              offset={0.15}
              darkness={0.7} // lens edge darkening
            />
          </EffectComposer>
        </Canvas>
      )}
    </div>
  );
}
