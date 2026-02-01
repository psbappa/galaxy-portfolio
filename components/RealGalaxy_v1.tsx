/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/purity */
"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import { useRef, useEffect, useMemo, useState, ReactNode } from "react";

/* ================= TYPES ================= */

type PlanetProps = {
  radius: number;
  distance: number;
  speed: number;
  color: THREE.ColorRepresentation;
  emissive?: THREE.ColorRepresentation;
  tilt?: number;
  wobble?: number;
  children?: ReactNode;
};

/* ================= PLANET CORE ================= */

function Planet({
  radius,
  distance,
  speed,
  color,
  emissive,
  tilt = 0,
  wobble = 0,
  children,
}: PlanetProps) {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime() * speed;

    ref.current.position.set(Math.sin(t) * distance, 0, Math.cos(t) * distance);

    ref.current.rotation.z = tilt + Math.sin(t) * wobble;
    ref.current.rotation.y += 0.002;
  });

  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[radius, 48, 48]} />
        <meshStandardMaterial
          color={color}
          emissive={emissive ?? color}
          emissiveIntensity={0.8}
        />
      </mesh>
      {children}
    </group>
  );
}

/* ================= RING ================= */

function PlanetRing({ inner, outer }: { inner: number; outer: number }) {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[inner, outer, 64]} />
      <meshStandardMaterial
        color="#c084fc"
        emissive="#7c3aed"
        emissiveIntensity={0.5}
        transparent
        opacity={0.35}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/* ================= PARTICLE RING ================= */

function ParticleRing({ radius }: { radius: number }) {
  const pts = useMemo<THREE.Vector3[]>(() => {
    return Array.from({ length: 700 }, () => {
      const a = Math.random() * Math.PI * 2;
      const r = radius + (Math.random() - 0.5) * 0.4;
      return new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r);
    });
  }, [radius]);

  return (
    <>
      {pts.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.03, 6, 6]} />
          <meshStandardMaterial
            color="#ffddaa"
            emissive="#ffaa77"
            emissiveIntensity={0.4}
          />
        </mesh>
      ))}
    </>
  );
}

/* ================= SUN ================= */

function Sun() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (ref.current) ref.current.rotation.y += 0.001;
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[4, 64, 64]} />
      <meshStandardMaterial
        color="#ffcc55"
        emissive="#ff9933"
        emissiveIntensity={2.5}
      />
    </mesh>
  );
}

/* ================= FOG ================= */

function NebulaFog() {
  const { scene } = useThree();
  useEffect(() => {
    scene.fog = new THREE.FogExp2("#120018", 0.015);
  }, [scene]);
  return null;
}

/* ================= CAMERA ================= */

function CameraDrift() {
  useFrame(({ camera }) => {
    camera.position.z -= 0.01;
  });
  return null;
}

/* ================= MAIN ================= */

export default function RealGalaxy() {
  return (
    <>
      General 2d Galaxy
      <Canvas
        style={{
          width: "100vw",
          height: "100vh",
          display: "block",
        }}
        camera={{ position: [0, 4, 12], fov: 45 }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={["#02010a"]} />
        <NebulaFog />

        <ambientLight intensity={0.6} />
        <pointLight position={[0, 0, 0]} intensity={6} />

        <Stars radius={300} depth={150} count={30000} factor={2} fade />

        {/* SUN */}
        <Sun />

        {/* MERCURY */}
        <Planet radius={0.5} distance={7} speed={1.6} color="#aaa" />

        {/* VENUS */}
        <Planet radius={0.9} distance={10} speed={1.2} color="#e0b45d" />

        {/* EARTH */}
        <Planet radius={1} distance={14} speed={1} color="#3fa9f5" tilt={0.4}>
          <PlanetRing inner={1.4} outer={1.5} />
        </Planet>

        {/* MARS */}
        <Planet radius={0.8} distance={18} speed={0.8} color="#c1440e" />

        {/* JUPITER */}
        <Planet radius={2.5} distance={25} speed={0.4} color="#d2b48c" />

        {/* SATURN */}
        <Planet
          radius={2.2}
          distance={32}
          speed={0.3}
          color="#deb887"
          tilt={0.5}
          wobble={0.05}
        >
          <PlanetRing inner={2.6} outer={3.4} />
          <ParticleRing radius={3} />
        </Planet>

        {/* URANUS */}
        <Planet
          radius={1.7}
          distance={40}
          speed={0.2}
          color="#7fffd4"
          tilt={1.2}
        />

        {/* NEPTUNE */}
        <Planet radius={1.6} distance={48} speed={0.15} color="#4169e1" />

        {/* PLUTO */}
        <Planet radius={0.4} distance={56} speed={0.1} color="#999" />

        <CameraDrift />
        <OrbitControls autoRotate autoRotateSpeed={0.2} />
      </Canvas>
    </>
  );
}
