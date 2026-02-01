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
      <sphereGeometry args={[1.2, 32, 32]} />
      <meshStandardMaterial
        color="#ff6a00"
        emissive="#ff4d00"
        emissiveIntensity={3}
      />
    </mesh>
  );
}

/* =====================================================
   DEEP SPACE RED STAR (ANCHOR OBJECT)
===================================================== */
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

    ref.current.position.x = base.current.x + Math.sin(t * 0.08) * drift;
    ref.current.position.y = base.current.y + Math.cos(t * 0.1) * drift;
    ref.current.position.z = base.current.z + Math.sin(t * 0.06) * drift;

    ref.current.rotation.y += 0.0004;
  });

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[size, 48, 48]} />
      <meshStandardMaterial
        color="#35b095"
        emissive="#40b081"
        emissiveIntensity={1.8}
      />
    </mesh>
  );
}

/* =====================================================
   LOCAL STAR DUST (STATIC CLUSTER)
===================================================== */
function LocalStarDust({ radius = 8, count = 500 }) {
  return <Stars radius={radius} depth={radius} count={count} factor={0.8} fade />;
}

/* =====================================================
   REALISTIC EARTH SYSTEM (ENGINEERED)
===================================================== */
function MovingEarthStar({
  position,
  size = 0.32,
  orbitSpeed = 0.25,
  rotationSpeed = 0.6,
}: {
  position: [number, number, number];
  size?: number;
  orbitSpeed?: number;
  rotationSpeed?: number;
}) {
  const earthGroup = useRef<THREE.Group>(null);
  const earthMesh = useRef<THREE.Mesh>(null);
  const moonRef = useRef<THREE.Mesh>(null);

  const base = useRef(new THREE.Vector3(...position));

  // axial tilt = 23.5°
  const axialTilt = THREE.MathUtils.degToRad(23.5);

  useFrame(({ clock }) => {
    if (!earthGroup.current || !earthMesh.current || !moonRef.current) return;

    const t = clock.getElapsedTime();

    /* ---- Earth orbit wobble ---- */
    earthGroup.current.position.x =
      base.current.x + Math.cos(t * orbitSpeed) * 0.25;
    earthGroup.current.position.z =
      base.current.z + Math.sin(t * orbitSpeed) * 0.25;

    /* ---- Earth self rotation ---- */
    earthMesh.current.rotation.y += 0.01 * rotationSpeed;

    /* ---- Moon orbit ---- */
    const moonAngle = t * 0.8;
    moonRef.current.position.set(
      Math.cos(moonAngle) * 0.7,
      0,
      Math.sin(moonAngle) * 0.7
    );
  });

  return (
    <group ref={earthGroup} position={position} rotation={[0, axialTilt, 0]}>
      {/* EARTH */}
      <mesh ref={earthMesh}>
        <sphereGeometry args={[size, 48, 48]} />
        <meshStandardMaterial
          color="#1f6ed4"
          emissive="#0a2a5a"
          emissiveIntensity={0.9}
          roughness={0.6}
          metalness={0.1}
        />
      </mesh>

      {/* ATMOSPHERE */}
      <mesh scale={1.08}>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial
          color="#4cc9ff"
          transparent
          opacity={0.15}
          emissive="#3aaeff"
          emissiveIntensity={0.6}
        />
      </mesh>

      {/* MOON */}
      <mesh ref={moonRef}>
        <sphereGeometry args={[size * 0.27, 24, 24]} />
        <meshStandardMaterial
          color="#888"
          emissive="#222"
          emissiveIntensity={0.3}
        />
      </mesh>
    </group>
  );
}


/* =====================================================
   PARALLAX GROUP (LAYER LOGIC)
===================================================== */
function ParallaxGroup({
  parallax,
  children,
}: {
  parallax: number;
  children: React.ReactNode;
}) {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ camera }) => {
    if (!ref.current) return;
    ref.current.position.x = camera.position.x * parallax;
    ref.current.position.y = camera.position.y * parallax;
  });

  return <group ref={ref}>{children}</group>;
}

/* =====================================================
   CAMERA DUST (LOCKED TO CAMERA)
===================================================== */
function CameraDust() {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ camera }) => {
    if (!ref.current) return;
    ref.current.position.copy(camera.position);
  });

  return (
    <group ref={ref}>
      <Stars radius={10} depth={5} count={1200} factor={0.4} fade />
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
   SATURN (WITH RING)
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

    group.current.position.set(
      Math.sin(t) * (distance + spiral),
      Math.sin(seed) * 0.6,
      Math.cos(t) * (distance + spiral)
    );

    group.current.rotation.y += 0.002;
  });

  return (
    <group ref={group}>
      <mesh>
        <sphereGeometry args={[0.9, 48, 48]} />
        <meshStandardMaterial
          color="#d6c28b"
          emissive="#332200"
          emissiveIntensity={1}
        />
      </mesh>

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
   MAIN SCENE
===================================================== */
export default function RealGalaxy() {
  return (
    <Canvas camera={{ position: [0, 3, 14], fov: 45 }}>
      <color attach="background" args={["#02030a"]} />

      {/* LIGHT */}
      <ambientLight intensity={0.6} />
      <pointLight position={[5, 5, 5]} intensity={3.5} />

      {/* CAMERA SPACE FEEL */}
      <CameraDust />

      {/* =====================
          NEAR SPACE LAYER
      ===================== */}
      <ParallaxGroup parallax={0.08}>
        <LocalStarDust radius={20} count={1500} />
        <MovingEarthStar position={[3, 1, -2]} size={0.1} orbitSpeed={0.8} rotationSpeed={1} />
      </ParallaxGroup>

      {/* =====================
          MID SPACE LAYER
      ===================== */}
      <ParallaxGroup parallax={0.04}>
        <Stars radius={60} depth={40} count={6000} factor={1.4} fade />
      </ParallaxGroup>

      {/* =====================
          FAR SPACE LAYER
      ===================== */}
      <ParallaxGroup parallax={0.015}>
        <Stars radius={140} depth={100} count={12000} factor={2} fade />
      </ParallaxGroup>

      {/* =====================
          DEEP SPACE ANCHORS
      ===================== */}
      <group position={[-22, -4, -45]}>
        <LocalStarDust radius={20} count={1500} />
        <SaturnPlanet distance={21} speed={0.18} seed={7} />
        <DeepSpaceRedStar position={[35, 18, -160]} size={1.5} seed={4} />
      </group>

      

      {/* MOTION */}
      {/* <InfiniteCameraDrift /> */}

      <Sun />

      {/* CONTROLS */}
      <OrbitControls
        makeDefault
        enablePan
        enableZoom
        enableRotate
        dampingFactor={0.08}
        minDistance={2}
        maxDistance={400}
      />
    </Canvas>
  );
}
