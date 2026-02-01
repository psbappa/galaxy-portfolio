/* eslint-disable react/jsx-no-undef */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import { useRef } from "react";

/* =====================================================
   SUN (CENTRAL STAR)
===================================================== */
function Sun() {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (!ref.current) return;
    ref.current.rotation.y += 0.001;
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[2.4, 64, 64]} />
      <meshStandardMaterial
        color="#ff9b00"
        emissive="#ff4d00"
        emissiveIntensity={3}
      />
    </mesh>
  );
}

/* =====================================================
   PLANET ORBIT (SPIRAL PLANE LOGIC)
===================================================== */
function OrbitPlanet({
  radius,
  distance,
  speed,
  color,
  emissive,
  seed = 1,
}: {
  radius: number;
  distance: number;
  speed: number;
  color: string;
  emissive: string;
  seed?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;

    const t = clock.getElapsedTime() * speed + seed * 10;

    // spiral-ish orbital distortion
    const spiralOffset = Math.sin(t * 0.4) * 0.6;

    const x = Math.sin(t) * (distance + spiralOffset);
    const z = Math.cos(t) * (distance + spiralOffset);
    const y = Math.sin(seed) * 0.6; // SAME ORBITAL PLANE

    ref.current.position.set(x, y, z);
    ref.current.rotation.y += 0.003;
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[radius, 48, 48]} />
      <meshStandardMaterial
        color={color}
        emissive={emissive}
        emissiveIntensity={1.2}
      />
    </mesh>
  );
}

/* =====================================================
   SATURN STYLE PLANET (WITH RING)
===================================================== */
function SaturnPlanet({
  distance,
  speed,
  seed = 1,
}: {
  distance: number;
  speed: number;
  seed?: number;
}) {
  const group = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!group.current) return;

    const t = clock.getElapsedTime() * speed + seed * 10;
    const spiral = Math.sin(t * 0.3) * 0.8;

    const x = Math.sin(t) * (distance + spiral);
    const z = Math.cos(t) * (distance + spiral);
    const y = Math.sin(seed) * 0.6;

    group.current.position.set(x, y, z);
    group.current.rotation.y += 0.002;
  });

  return (
    <group ref={group}>
      {/* planet */}
      <mesh>
        <sphereGeometry args={[0.9, 48, 48]} />
        <meshStandardMaterial
          color="#d6c28b"
          emissive="#332200"
          emissiveIntensity={1}
        />
      </mesh>

      {/* ring */}
      <mesh rotation={[Math.PI / 2.2, 0, 0]}>
        <ringGeometry args={[1.2, 2, 64]} />
        <meshStandardMaterial
          color="#bba46a"
          emissive="#221600"
          emissiveIntensity={0.6}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

/* =====================================================
   CAMERA DUST
===================================================== */
function CameraDust() {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ camera }) => {
    if (!ref.current) return;
    ref.current.position.copy(camera.position);
  });

  return (
    <group ref={ref}>
      <Stars radius={10} depth={5} count={1200} factor={0.4} />
    </group>
  );
}

/* =====================================================
   INFINITE CAMERA DRIFT
===================================================== */
function InfiniteCameraDrift() {
  useFrame(({ camera }) => {
    if (camera.position.z > 2) camera.position.z -= 0.015;
  });
  return null;
}

/* =====================================================
   MAIN SCENE
===================================================== */
export default function RealGalaxy() {
  return (
    <Canvas camera={{ position: [0, 4, 16], fov: 45 }}>
      <color attach="background" args={["#02030a"]} />

      {/* LIGHT */}
      <ambientLight intensity={0.6} />
      <pointLight position={[0, 0, 0]} intensity={5} />

      {/* SPACE FEEL */}
      <CameraDust />
      <Stars radius={200} depth={150} count={18000} factor={2} fade />

      {/* SUN */}
      <Sun />

      {/* PLANETARY SPIRAL SYSTEM */}
      <OrbitPlanet
        radius={1.1}
        distance={8}
        speed={0.5}
        color="#3d4e70"
        emissive="#0A769C"
        seed={1}
      />

      <OrbitPlanet
        radius={0.6}
        distance={12}
        speed={0.35}
        color="#9cff5a"
        emissive="#223300"
        seed={3}
      />

      <OrbitPlanet
        radius={0.8}
        distance={16}
        speed={0.25}
        color="#ff6b6b"
        emissive="#330000"
        seed={5}
      />

      <SaturnPlanet distance={21} speed={0.18} seed={7} />

      <OrbitPlanet
        radius={0.5}
        distance={26}
        speed={0.12}
        color="#7f8cff"
        emissive="#111833"
        seed={9}
      />

      {/* MOTION */}
      <InfiniteCameraDrift />

      {/* CONTROLS */}
      <OrbitControls
        enableZoom
        minDistance={4}
        maxDistance={200}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.2}
        dampingFactor={0.08}
      />
    </Canvas>
  );
}
