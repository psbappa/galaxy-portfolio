/* eslint-disable react/jsx-no-undef */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import { useRef, useEffect, useState } from "react";

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
   DEEP SPACE RED STAR
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
   LOCAL STAR DUST
===================================================== */
function LocalStarDust({ radius = 8, count = 500 }) {
  return <Stars radius={radius} depth={radius} count={count} factor={0.8} fade />;
}

/* =====================================================
   REALISTIC EARTH
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
  const axialTilt = THREE.MathUtils.degToRad(23.5);

  useFrame(({ clock }) => {
    if (!earthGroup.current || !earthMesh.current || !moonRef.current) return;

    const t = clock.getElapsedTime();

    earthGroup.current.position.x =
      base.current.x + Math.cos(t * orbitSpeed) * 0.25;
    earthGroup.current.position.z =
      base.current.z + Math.sin(t * orbitSpeed) * 0.25;

    earthMesh.current.rotation.y += 0.01 * rotationSpeed;

    const moonAngle = t * 0.8;
    moonRef.current.position.set(
      Math.cos(moonAngle) * 0.7,
      0,
      Math.sin(moonAngle) * 0.7
    );
  });

  return (
    <group ref={earthGroup} position={position} rotation={[0, axialTilt, 0]}>
      <mesh ref={earthMesh}>
        <sphereGeometry args={[size, 48, 48]} />
        <meshStandardMaterial
          color="#1f6ed4"
          emissive="#0a2a5a"
          emissiveIntensity={0.9}
        />
      </mesh>

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

      <mesh ref={moonRef}>
        <sphereGeometry args={[size * 0.27, 24, 24]} />
        <meshStandardMaterial color="#888" emissive="#222" emissiveIntensity={0.3} />
      </mesh>
    </group>
  );
}

/* =====================================================
   PARALLAX GROUP
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
      <Stars radius={10} depth={5} count={1200} factor={0.4} fade />
    </group>
  );
}

/* =====================================================
   SATURN
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
        <meshStandardMaterial color="#d6c28b" emissive="#332200" emissiveIntensity={1} />
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

function LivingStars({
  radius,
  depth,
  count,
  factor,
  speed = 0.002,
}: {
  radius: number;
  depth: number;
  count: number;
  factor: number;
  speed?: number;
}) {
  const ref = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();

    // slow cosmic drift
    ref.current.rotation.y = t * speed;
    ref.current.rotation.x = t * speed * 0.3;
  });

  return (
    <group ref={ref}>
      <Stars
        radius={radius}
        depth={depth}
        count={count}
        factor={factor}
        fade
      />
    </group>
  );
}

/* =====================================================
   MAIN SCENE + LOADING OVERLAY
===================================================== */
export default function RealGalaxy() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 2800);
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
            far: 5000, // 🔥 allow deep space zoom
          }}
        >
          <color attach="background" args={["#02030a"]} />

          <ambientLight intensity={0.6} />
          <pointLight position={[5, 5, 5]} intensity={3.5} />

          <CameraDust />

          <ParallaxGroup parallax={0.08}>
            <LocalStarDust radius={20} count={1500} />
            <MovingEarthStar position={[3, 1, -2]} size={0.1} orbitSpeed={0.8} />
          </ParallaxGroup>

          <ParallaxGroup parallax={0.04}>
            <LivingStars
              radius={60}
              depth={40}
              count={6000}
              factor={1.4}
              speed={0.003}
            />
          </ParallaxGroup>

          <ParallaxGroup parallax={0.015}>
            <LivingStars
              radius={140}
              depth={100}
              count={12000}
              factor={2}
              speed={0.0015}
            />
          </ParallaxGroup>

          <group position={[-22, -4, -45]}>
            <LocalStarDust radius={20} count={1500} />
            <SaturnPlanet distance={21} speed={0.18} seed={7} />
            <DeepSpaceRedStar position={[35, 18, -160]} size={1.5} seed={4} />
          </group>

          <Sun />

          <OrbitControls
            makeDefault
            enablePan
            enableZoom
            enableRotate
            dampingFactor={0.08}
            minDistance={0.1}     // 🔥 ultra zoom-in
            maxDistance={5000}    // 🔥 ultra zoom-out
            zoomSpeed={1.2}
            panSpeed={0.8}
          />
        </Canvas>
      )}
    </div>
  );
}
