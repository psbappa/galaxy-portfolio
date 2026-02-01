/* eslint-disable react/jsx-no-undef */
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
        color="#6dff1f"
        emissive="#52b903"
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

function ProceduralPlanet({
  radius = 1,
  distance = 20,
  speed = 0.02,
  color = "#ffaa55",
  emissive = "#331100",
  tilt = 0.3,
  seed = 1,
}: {
  radius?: number;
  distance?: number;
  speed?: number;
  color?: string;
  emissive?: string;
  tilt?: number;
  seed?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;

    const t = clock.getElapsedTime() * speed + seed * 10;

    // NOT perfect circle → realism
    const x = Math.sin(t) * distance;
    const z = Math.cos(t * 0.97) * distance;
    const y = Math.sin(t * 0.3) * 2;

    ref.current.position.set(x, y, z);

    // slow axial rotation
    ref.current.rotation.y += 0.001;
    ref.current.rotation.x = tilt;
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

function ParallaxStars({
  count = 3000,
  radius = 100,
  speed = 0.02,
}: {
  count?: number;
  radius?: number;
  speed?: number;
}) {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ camera }) => {
    if (!ref.current) return;

    // parallax illusion
    ref.current.position.x = camera.position.x * speed;
    ref.current.position.y = camera.position.y * speed;
  });

  return (
    <group ref={ref}>
      <Stars
        radius={radius}
        depth={radius * 0.6}
        count={count}
        factor={2}
        fade
      />
    </group>
  );
}

export default function RealGalaxy() {
  function InfiniteCameraDrift() {
    useFrame(({ camera }) => {
      // as you zoom, slightly shift forward endlessly
      if (camera.position.z > 2) {
        camera.position.z -= 0.02;
      }
    });

    return null;
  }

  return (
    <>
      Simple 5 stars
      <Canvas
      style={{
        width: "100vw",
        height: "100vh",
        display: "block",
      }}
      camera={{ position: [0, 4, 12], fov: 45 }}
      gl={{ antialias: true }}
    >
        <color attach="background" args={["#02030a"]} />

        {/* LIGHT */}
        <ambientLight intensity={0.6} />
        <pointLight position={[0, 0, 0]} intensity={4} />

        {/* STAR DEPTH */}
        <Stars radius={150} depth={120} count={20000} factor={2} fade />

        {/* FAR STARS */}
        <Stars radius={150} depth={120} count={16000} factor={3} fade />

        {/* NEAR STARS */}
        <Stars radius={40} depth={20} count={4000} factor={1.5} fade />

        <group position={[-22, -4, -45]}>
          <DeepSpaceRedStar position={[-22, -4, -45]} size={9} seed={7} />
          <LocalStarDust radius={50} count={800} />
        </group>

        {/* PARALLAX STAR DEPTH */}
        <ParallaxStars radius={200} count={18000} speed={0.01} />
        <ParallaxStars radius={80} count={6000} speed={0.03} />
        <ParallaxStars radius={40} count={3000} speed={0.06} />

        {/* PLANETS */}
        <ProceduralPlanet
          radius={2.8}
          distance={25}
          speed={0.015}
          color="#ff6b2d"
          emissive="#331100"
          seed={1}
        />

        <ProceduralPlanet
          radius={1.6}
          distance={40}
          speed={0.01}
          color="#c8ff5a"
          emissive="#112200"
          seed={3}
        />

        <ProceduralPlanet
          radius={0.9}
          distance={15}
          speed={0.03}
          color="#6dff1f"
          emissive="#1a3300"
          seed={7}
        />

        {/* YOUR EXISTING STARS */}
        <MovingRedStar position={[-4, -0.5, 1]} size={0.25} speed={0.5} />
        <RedStar position={[3, 1, -2]} size={0.35} />

        {/* INFINITE FEEL */}
        <InfiniteCameraDrift />

        {/* CAMERA */}
        <OrbitControls
          enableZoom
          minDistance={2}
          maxDistance={200}
          enablePan={false}
          dampingFactor={0.08}
          autoRotate
          autoRotateSpeed={0.15}
        />
      </Canvas>
    </>
  );
}
