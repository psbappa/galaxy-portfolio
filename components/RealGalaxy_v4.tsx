/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/purity */
"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import {
  useRef,
  useEffect,
  useMemo,
  useState,
  forwardRef,
  ReactNode,
} from "react";

/* ================= TYPES ================= */

type ProceduralPlanetProps = {
  radius?: number;
  distance?: number;
  speed?: number;
  color?: THREE.ColorRepresentation;
  emissive?: THREE.ColorRepresentation;
  tilt?: number;
  seed?: number;
  children?: ReactNode;
};

type PlanetRingProps = {
  inner: number;
  outer: number;
};

type ParticleRingProps = {
  radius?: number;
  count?: number;
};

/* ================= PLANET (SYNC ROOT) ================= */

const ProceduralPlanet = forwardRef<THREE.Group, ProceduralPlanetProps>(
  function ProceduralPlanet(
    {
      radius = 1,
      distance = 20,
      speed = 0.02,
      color = "#ffaa55",
      emissive = "#331100",
      tilt = 0.3,
      seed = 1,
      children,
    },
    ref
  ) {
    const groupRef = useRef<THREE.Group>(null);

    useFrame(({ clock }) => {
      if (!groupRef.current) return;

      const t = clock.getElapsedTime() * speed + seed * 10;

      groupRef.current.position.set(
        Math.sin(t) * distance,
        Math.sin(t * 0.25) * 1.5,
        Math.cos(t * 0.95) * distance
      );

      // Saturn-style wobble
      groupRef.current.rotation.z = tilt + Math.sin(t * 0.5) * 0.05;
      groupRef.current.rotation.y += 0.002;
    });

    return (
      <group
        ref={(node) => {
          groupRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
      >
        <mesh>
          <sphereGeometry args={[radius, 48, 48]} />
          <meshStandardMaterial
            color={color}
            emissive={emissive}
            emissiveIntensity={1.1}
          />
        </mesh>

        {/* CHILDREN = PERFECTLY SYNCED */}
        {children}
      </group>
    );
  }
);

/* ================= NEBULA FOG ================= */

function NebulaFog(): null {
  const { scene } = useThree();
  useEffect(() => {
    scene.fog = new THREE.FogExp2("#220033", 0.02);
  }, [scene]);
  return null;
}

/* ================= SPIRAL ARMS ================= */

function SpiralArms({
  arms = 3,
  points = 900,
  radius = 80,
}: {
  arms?: number;
  points?: number;
  radius?: number;
}) {
  const stars = useMemo<THREE.Vector3[]>(() => {
    const arr: THREE.Vector3[] = [];
    for (let a = 0; a < arms; a++) {
      for (let i = 0; i < points; i++) {
        const angle =
          (i / points) * Math.PI * 4 + (a * Math.PI * 2) / arms;
        const r = Math.sqrt(Math.random()) * radius;
        arr.push(
          new THREE.Vector3(
            Math.cos(angle) * r,
            (Math.random() - 0.5) * 2,
            Math.sin(angle) * r
          )
        );
      }
    }
    return arr;
  }, [arms, points, radius]);

  return (
    <>
      {stars.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.05, 6, 6]} />
          <meshStandardMaterial
            color="#ffd9aa"
            emissive="#ffcc88"
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}
    </>
  );
}

/* ================= ASTEROIDS ================= */

function Asteroids({ count = 70 }: { count?: number }) {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ camera }) => {
    ref.current?.children.forEach((obj) => {
      const m = obj as THREE.Mesh;
      m.position.z += 0.6;
      m.rotation.x += 0.01;
      m.rotation.y += 0.01;

      if (m.position.z > camera.position.z + 5) {
        m.position.z = -220;
        m.position.x = (Math.random() - 0.5) * 50;
        m.position.y = (Math.random() - 0.5) * 30;
      }
    });
  });

  return (
    <group ref={ref}>
      {Array.from({ length: count }).map((_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 50,
            (Math.random() - 0.5) * 30,
            Math.random() * -220,
          ]}
        >
          <sphereGeometry args={[0.3 + Math.random() * 0.4, 12, 12]} />
          <meshStandardMaterial color="#777" emissive="#222" />
        </mesh>
      ))}
    </group>
  );
}

/* ================= PLANET RING (SYNCED) ================= */

function PlanetRing({ inner, outer }: PlanetRingProps) {
  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[inner, outer, 64]} />
      <meshStandardMaterial
        color="#7c3aed"
        emissive="#6b21a8"
        emissiveIntensity={0.6}
        transparent
        opacity={0.35}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/* ================= PARTICLE RING (SYNCED) ================= */

function ParticleRing({
  radius = 3.5,
  count = 800,
}: ParticleRingProps) {
  const pts = useMemo<THREE.Vector3[]>(() => {
    const arr: THREE.Vector3[] = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = radius + (Math.random() - 0.5) * 0.4;
      arr.push(new THREE.Vector3(Math.cos(angle) * r, 0, Math.sin(angle) * r));
    }
    return arr;
  }, [count, radius]);

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

/* ================= WARP TUNNEL ================= */

function WarpTunnel() {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (ref.current) ref.current.rotation.z += 0.002;
  });

  return (
    <mesh ref={ref} position={[0, 0, -40]}>
      <torusGeometry args={[20, 0.5, 16, 100]} />
      <meshStandardMaterial
        color="#442266"
        emissive="#220044"
        emissiveIntensity={0.4}
        transparent
        opacity={0.3}
      />
    </mesh>
  );
}

/* ================= CAMERA DRIFT ================= */

function InfiniteCameraDrift({ warp }: { warp: number }) {
  useFrame(({ camera }) => {
    camera.position.z -= 0.02 + warp;
  });
  return null;
}

/* ================= MAIN ================= */

export default function RealGalaxy() {
  const [warp, setWarp] = useState<number>(0);

  useEffect(() => {
    const onScroll = () => setWarp(Math.min(window.scrollY / 200, 1));
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
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
      <NebulaFog />

      <ambientLight intensity={0.6} />
      <pointLight position={[0, 0, 0]} intensity={4} />

      <Stars radius={150} depth={120} count={20000} factor={2} fade />
      <Stars radius={40} depth={20} count={4000} factor={1.5} fade />

      <SpiralArms />
      <WarpTunnel />

      <ProceduralPlanet
        radius={2.8}
        distance={25}
        speed={0.015}
        color="#ff6b2d"
        emissive="#331100"
        tilt={0.3}
        seed={1}
      >
        <PlanetRing inner={3.2} outer={3.8} />
        <ParticleRing />
      </ProceduralPlanet>

      <Asteroids />
      <InfiniteCameraDrift warp={warp} />

      <OrbitControls autoRotate autoRotateSpeed={0.15} />
    </Canvas>
  );
}
