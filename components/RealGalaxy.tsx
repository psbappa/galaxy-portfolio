/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import { useRef } from "react";

function RedStar({
  position,
  size = 0.3,
}: {
  position: [number, number, number];
  size?: number;
}) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial
        color="#ff3b1f"
        emissive="#ff1a00"
        emissiveIntensity={3}
      />
    </mesh>
  );
}

function MovingRedStar({
  position,
  size = 0.3,
  speed = 0.5,
}: {
  position: [number, number, number];
  size?: number;
  speed?: number;
}) {
  const starRef = useRef<THREE.Mesh>(null);
  const basePosition = useRef(new THREE.Vector3(...position));

  useFrame(({ clock }) => {
    if (!starRef.current) return;

    const t = clock.getElapsedTime();

    // subtle floating motion
    starRef.current.position.y =
      basePosition.current.y + Math.sin(t * speed) * 0.15;

    // slow rotation (lava feel)
    starRef.current.rotation.y += 0.003;
  });

  return (
    <mesh ref={starRef} position={position}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial
        color="#ff3b1f"
        emissive="#ff1a00"
        emissiveIntensity={2.2 + speed * 0.05}
      />
    </mesh>
  );
}

function LocalStarDust({ radius = 8, count = 1200 }) {
  return <Stars radius={radius} depth={radius} count={count} factor={0.8} />;
}

// GALAXY DISK
// ⚠️ IMPORTANT RULES (don’t skip)
// ❌ Never use import img from for Three textures
// ❌ Don’t put image in app/ or components/
// ✅ Always use absolute path starting with /textures/
// ✅ Restart dev server if image not loading
function GalaxyDisk() {
  const texture = new THREE.TextureLoader().load("/textures/andromeda.jpg");
  texture.colorSpace = THREE.SRGBColorSpace;

  return (
    <mesh rotation={[-Math.PI / 2.4, 0, 0]}>
      <circleGeometry args={[8, 256]} />
      <meshStandardMaterial
        map={texture}
        transparent
        opacity={1}
        emissive={new THREE.Color(0xffffff)}
        emissiveIntensity={1.2}
      />
      <pointLight position={[18, 6, -35]} intensity={0.3} color="#ff2200" />
    </mesh>
  );
}

function DeepSpaceRedStar({
  position,
  size = 0.6,
  drift = 0.02,
  seed = 1,
}: {
  position: [number, number, number];
  size?: number;
  drift?: number;
  seed?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const base = useRef(new THREE.Vector3(...position));

  useFrame(({ clock }) => {
    if (!ref.current) return;

    const t = clock.getElapsedTime() + seed * 10;

    // extremely subtle random-like drift
    ref.current.position.x = base.current.x + Math.sin(t * 0.1 + seed) * drift;
    ref.current.position.y =
      base.current.y + Math.cos(t * 0.13 + seed * 2) * drift;
    ref.current.position.z =
      base.current.z + Math.sin(t * 0.08 + seed * 3) * drift;

    // almost unnoticeable rotation
    ref.current.rotation.y += 0.0005;
  });

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial
        color="#ff2a00"
        emissive="#ff1200"
        emissiveIntensity={1.8}
      />
    </mesh>
  );
}


export default function RealGalaxy() {
  return (
    <Canvas camera={{ position: [0, 4, 12], fov: 45 }} gl={{ antialias: true }}>
      <color attach="background" args={["#02030a"]} />

      {/* LIGHTING */}
      <ambientLight intensity={0.6} />
      <pointLight position={[0, 0, 0]} intensity={4} color="#ffd7a8" />

      {/* FAR STARS */}
      <Stars radius={150} depth={120} count={16000} factor={3} fade />

      {/* NEAR STARS */}
      <Stars radius={40} depth={20} count={4000} factor={1.5} />

      <group position={[-22, -4, -45]}>
        {/* 🔥 DEEP SPACE RED STARS */}
        <DeepSpaceRedStar position={[-22, -4, -45]} size={1} seed={7} />
        <LocalStarDust radius={10} count={1500} />
      </group>

      {/* STAR DEPTH */}
      <Stars radius={150} depth={120} count={20000} factor={2} fade />

      {/* 🔥 MOVING LAVA STARS */}
      {/* <MovingRedStar position={[3, 1, -2]} size={0.35} speed={0.8} />
      <MovingRedStar position={[-4, -0.5, 1]} size={0.25} speed={0.5} /> */}

      {/* GALAXY */}
      <GalaxyDisk />

      {/* 🔥 LAVA STARS */} 
      <RedStar position={[3, 1, -2]} size={0.35} />

      {/* CAMERA CONTROL */}
      <OrbitControls
        enableZoom
        minDistance={6}
        maxDistance={80}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.25}
      />

    </Canvas>
  );
}
