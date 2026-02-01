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
import { useRef, useEffect, useState } from "react";

/* =====================================================
   SUN (CENTRAL STAR)
===================================================== */
function Sun() {
  const outerRef = useRef<THREE.Mesh>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();

  useFrame(() => {
    if (!outerRef.current || !coreRef.current) return;

    // distance from camera
    const d = camera.position.length();

    // normalize (near = hot, far = calm)
    const heat = THREE.MathUtils.clamp(
      1 - d / 25, // 25 = zoom threshold
      0,
      1
    );

    // slow rotation
    outerRef.current.rotation.y += 0.0008;
    coreRef.current.rotation.y -= 0.0012;

    // 🔥 gradient intensity control
    (
      outerRef.current.material as THREE.MeshStandardMaterial
    ).emissiveIntensity = 1.5 + heat * 2;

    (
      coreRef.current.material as THREE.MeshStandardMaterial
    ).emissiveIntensity = 3 + heat * 6;

    // core pulse
    const s = 0.75 + heat * 0.25 + Math.sin(Date.now() * 0.002) * 0.03;
    coreRef.current.scale.setScalar(s);
  });

  return (
    <group>
      {/* OUTER SUN */}
      <mesh ref={outerRef}>
        <sphereGeometry args={[1.3, 48, 48]} />
        <meshStandardMaterial
          color="#ff9a00"
          emissive="#ff6a00"
          emissiveIntensity={1.5}
        />
      </mesh>

      {/* CORE GRADIENT */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.9, 32, 32]} />
        <meshStandardMaterial
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
   DEEP SPACE RED STAR
===================================================== */
function DeepSpaceRedStar({
  position,
  size = 0.6,
  seed = 1,
  orbitRadius = 5,   // distance from base
  orbitSpeed = 0.02, // orbit speed around base
  drift = 1.2,       // wobble amplitude
}: {
  position: [number, number, number];
  size?: number;
  seed?: number;
  orbitRadius?: number;
  orbitSpeed?: number;
  drift?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const base = useRef(new THREE.Vector3(...position));

  useFrame(({ clock, camera }) => {
    if (!ref.current) return;

    const t = clock.getElapsedTime() + seed * 10;

    // Wobble/drift (bigger for visibility)
    const driftX = Math.sin(t * 0.15 + seed) * drift;
    const driftY = Math.cos(t * 0.12 + seed) * drift * 0.6;
    const driftZ = Math.sin(t * 0.1 + seed) * drift * 0.8;

    // Orbit around its base
    const orbitX = Math.cos(t * orbitSpeed + seed) * orbitRadius;
    const orbitZ = Math.sin(t * orbitSpeed + seed) * orbitRadius;

    // Camera parallax offset
    const camOffsetX = camera.position.x * 0.015 * seed;
    const camOffsetY = camera.position.y * 0.015 * seed;

    // Set final position
    ref.current.position.x = base.current.x + driftX + orbitX + camOffsetX;
    ref.current.position.y = base.current.y + driftY + camOffsetY;
    ref.current.position.z = base.current.z + driftZ + orbitZ;

    // Rotation
    ref.current.rotation.y += 0.003;
    ref.current.rotation.x += 0.0015;
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial
        color="#35b095"
        emissive="#40b081"
        emissiveIntensity={3.5}
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
   MOVING EARTH
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
          color="#edff4c"
          transparent
          opacity={0.15}
          emissive="#3aaeff"
          emissiveIntensity={0.6}
        />
      </mesh>

      <mesh ref={moonRef}>
        <sphereGeometry args={[size * 0.27, 8, 8]} />
        <meshStandardMaterial color="#fffdfd" emissive="#f8f6f6" emissiveIntensity={0.3} />
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
      <Stars radius={10} depth={5} count={1000} factor={0.4} fade />
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

/* =====================================================
   LIVING STARS
===================================================== */
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
    ref.current.rotation.y = t * speed;
    ref.current.rotation.x = t * speed * 0.3;
  });

  return (
    <group ref={ref}>
      <Stars radius={radius} depth={depth} count={count} factor={factor} fade />
    </group>
  );
}

/* =====================================================
   STAR LAYER GROUP (DYNAMIC ZOOM-BASED)
===================================================== */
function StarsLayerGroup() {
  const { camera } = useThree();
  const ref = useRef<THREE.Group>(null);

  // Define layers: near, mid, far
  const baseLayers = [
    { radius: 20, depth: 15, baseCount: 400, factor: 0.8, speed: 0.004, fade: true },
    { radius: 60, depth: 40, baseCount: 1000, factor: 1.2, speed: 0.002, fade: true },
    { radius: 140, depth: 100, baseCount: 1000, factor: 2, speed: 0.001, fade: true },
  ];

  const [counts, setCounts] = useState(baseLayers.map(l => l.baseCount));

  useFrame(() => {
    const distance = camera.position.length(); // zoom distance
    const newCounts = baseLayers.map((layer, i) => {
      // closer zoom = more near stars
      const scale = i === 0 ? 1.2 : i === 1 ? 1 : 0.8;
      return Math.floor(layer.baseCount * scale * (500 / Math.max(0.1, distance)));
    });
    setCounts(newCounts);
  });

  return (
    <group ref={ref}>
      {baseLayers.map((layer, i) => (
        <ParallaxGroup key={i} parallax={0.04 / (i + 1)}>
          <LivingStars
            radius={layer.radius}
            depth={layer.depth}
            count={counts[i]}
            factor={layer.factor}
            speed={layer.speed}
          />
        </ParallaxGroup>
      ))}
    </group>
  );
}

/* =========================
   CAMERA LOCK (IMPORTANT)
========================= */

function CameraFocus() {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 2, 10);
    camera.lookAt(-4, 0, 0); // 🔥 FORCE LOOK AT STATION
  }, [camera]);

  return null;
}

/* =========================
   DISTANT SMALL SPACE STATION
========================= */

function DistantSpaceStation() {
  const orbitRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (orbitRef.current) {
      orbitRef.current.rotation.y = t * 0.05; // universe-sync slow orbit
    }
  });

  return (
    <group ref={orbitRef}>
      {/* station placed far from camera */}
      <group position={[12, 1.5, -8]} scale={0.12}>
        {/* core */}
        <mesh>
          <cylinderGeometry args={[0.4, 0.4, 1.6, 16]} />
          <meshStandardMaterial
            color="#d80202"
            metalness={0.6}
            roughness={0.4}
          />
        </mesh>

        {/* solar panels */}
        <mesh position={[-1.2, 0, 0]}>
          <boxGeometry args={[1.8, 0.05, 0.6]} />
          <meshStandardMaterial color="#1f4cff" />
        </mesh>
        <mesh position={[1.2, 0, 0]}>
          <boxGeometry args={[1.8, 0.05, 0.6]} />
          <meshStandardMaterial color="#1f4cff" />
        </mesh>

        {/* small beacon */}
        <mesh position={[0, 1, 0]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#ff4444" emissive="#ff2222" />
        </mesh>
      </group>
    </group>
  );
}

/* -------------------- EARTH -------------------- */
function Earth() {
  return (
    <mesh>
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial color="#2a5fff" />
    </mesh>
  );
}

/* -------------------- MOON -------------------- */
function Moon() {
  const moonRef = useRef<THREE.Mesh>(null);
  let angle = 0;

  useFrame((_, delta) => {
    angle += delta * 0.4;
    if (moonRef.current) {
      moonRef.current.position.set(
        Math.cos(angle) * 2.5,
        0,
        Math.sin(angle) * 2.5
      );
    }
  });

  return (
    <mesh ref={moonRef}>
      <sphereGeometry args={[0.27, 32, 32]} />
      <meshStandardMaterial color="#f3efef" />
    </mesh>
  );
}

/* -------------------- SPACE STATION -------------------- */
function SpaceStation() {
  const stationRef = useRef<THREE.Group>(null);
  let angle = 0;

  useFrame((_, delta) => {
    angle += delta * 0.6;
    if (stationRef.current) {
      stationRef.current.position.set(
        Math.cos(angle) * 3.3,
        0.2,
        Math.sin(angle) * 3.3
      );
      stationRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <group ref={stationRef} scale={0.15}>
      {/* Core */}
      <mesh>
        <cylinderGeometry args={[0.15, 0.15, 1.2, 16]} />
        <meshStandardMaterial color="#aaaaaa" />
      </mesh>

      {/* Solar Panels */}
      <mesh position={[0, 0, 0.8]}>
        <boxGeometry args={[2.5, 0.05, 0.6]} />
        <meshStandardMaterial color="#3a6cff" />
      </mesh>

      <mesh position={[0, 0, -0.8]}>
        <boxGeometry args={[2.5, 0.05, 0.6]} />
        <meshStandardMaterial color="#3a6cff" />
      </mesh>
    </group>
  );
}

function SmallSpaceStation({
  position = [6, 1, -8],
  scale = 0.2,
  rotationSpeed = 0.01,
}: {
  position?: [number, number, number];
  scale?: number;
  rotationSpeed?: number;
}) {
  const stationRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (stationRef.current) {
      stationRef.current.rotation.y += rotationSpeed; // slow rotation
      stationRef.current.rotation.x += rotationSpeed * 0.2;
    }
  });

  return (
    <group ref={stationRef} position={position} scale={scale}>
      {/* Main Core */}
      <mesh>
        <cylinderGeometry args={[0.5, 0.5, 2, 16]} />
        <meshStandardMaterial color="#aaa" metalness={0.7} roughness={0.4} />
      </mesh>

      {/* Solar Panels Left */}
      <mesh position={[-1.5, 0, 0]}>
        <boxGeometry args={[3, 0.05, 0.6]} />
        <meshStandardMaterial color="#1f4cff" />
      </mesh>

      {/* Solar Panels Right */}
      <mesh position={[1.5, 0, 0]}>
        <boxGeometry args={[3, 0.05, 0.6]} />
        <meshStandardMaterial color="#1f4cff" />
      </mesh>

      {/* Small Antenna / Beacon */}
      <mesh position={[0, 1, 0]}>
        <coneGeometry args={[0.1, 0.6, 8]} />
        <meshStandardMaterial color="#ff4444" emissive="#ff2222" emissiveIntensity={0.5} />
      </mesh>

      {/* Docking port / detail */}
      <mesh position={[0, 0, 0.7]}>
        <boxGeometry args={[0.4, 0.4, 0.6]} />
        <meshStandardMaterial color="#777" metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  );
}

function MovingSpaceStation({
  pathCenter = [0, 0, 0],
  orbitRadius = 8,
  speed = 0.02,
  scale = 0.2,
  tilt = 0.1, // orbital tilt
  seed = 1,
}: {
  pathCenter?: [number, number, number];
  orbitRadius?: number;
  speed?: number;
  scale?: number;
  tilt?: number;
  seed?: number;
}) {
  const stationRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed + seed * 10;

    if (stationRef.current) {
      // Circular orbit around pathCenter
      const x = pathCenter[0] + Math.cos(t) * orbitRadius;
      const y = pathCenter[1] + Math.sin(t * tilt) * orbitRadius * 0.3; // slight vertical tilt
      const z = pathCenter[2] + Math.sin(t) * orbitRadius;

      stationRef.current.position.set(x, y, z);

      // Slow rotation on its own axis
      stationRef.current.rotation.y += 0.01;
      stationRef.current.rotation.x += 0.003;
    }
  });

  return (
    <group ref={stationRef} scale={scale}>
      {/* Main Core */}
      <mesh>
        <cylinderGeometry args={[0.5, 0.5, 2, 16]} />
        <meshStandardMaterial color="#aaa" metalness={0.7} roughness={0.4} />
      </mesh>

      {/* Solar Panels Left */}
      <mesh position={[-1.5, 0, 0]}>
        <boxGeometry args={[3, 0.05, 0.6]} />
        <meshStandardMaterial color="#1f4cff" />
      </mesh>

      {/* Solar Panels Right */}
      <mesh position={[1.5, 0, 0]}>
        <boxGeometry args={[3, 0.05, 0.6]} />
        <meshStandardMaterial color="#1f4cff" />
      </mesh>

      {/* Small Beacon / Antenna */}
      <mesh position={[0, 1, 0]}>
        <coneGeometry args={[0.1, 0.6, 8]} />
        <meshStandardMaterial color="#ff4444" emissive="#ff2222" emissiveIntensity={0.5} />
      </mesh>

      {/* Docking port / detail */}
      <mesh position={[0, 0, 0.7]}>
        <boxGeometry args={[0.4, 0.4, 0.6]} />
        <meshStandardMaterial color="#777" metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  );
}

function GiantSpaceStation({
  position = [50, 10, -200], // far away
  baseScale = 4,             // giant scale
  minVisibleScale = 0.5,     // min scale when super far
  rotationSpeed = 0.004,
}: {
  position?: [number, number, number];
  baseScale?: number;
  minVisibleScale?: number;
  rotationSpeed?: number;
}) {
  const ref = useRef<THREE.Group>(null);
  const { camera } = useThree();

  useFrame(() => {
    if (!ref.current) return;

    // distance from camera
    const distance = ref.current.position.distanceTo(camera.position);

    // scale adjustment: farther = smaller but not too tiny
    const scaleFactor = Math.max(baseScale * (200 / Math.max(distance, 0.1)), minVisibleScale);
    ref.current.scale.set(scaleFactor, scaleFactor, scaleFactor);

    // slow rotation
    ref.current.rotation.y += rotationSpeed;
    ref.current.rotation.x += rotationSpeed * 0.2;
  });

  return (
    <group ref={ref} position={position}>
      {/* Main Core */}
      <mesh>
        <cylinderGeometry args={[1, 1, 5, 24]} />
        <meshStandardMaterial color="#888" metalness={0.7} roughness={0.4} />
      </mesh>

      {/* Solar Panels Left */}
      <mesh position={[-3, 0, 0]}>
        <boxGeometry args={[6, 0.1, 1.5]} />
        <meshStandardMaterial color="#1f4cff" />
      </mesh>

      {/* Solar Panels Right */}
      <mesh position={[3, 0, 0]}>
        <boxGeometry args={[6, 0.1, 1.5]} />
        <meshStandardMaterial color="#1f4cff" />
      </mesh>

      {/* Antenna / Beacon */}
      <mesh position={[0, 3, 0]}>
        <coneGeometry args={[0.3, 1, 12]} />
        <meshStandardMaterial color="#ff4444" emissive="#ff2222" emissiveIntensity={0.8} />
      </mesh>

      {/* Docking / detail modules */}
      <mesh position={[0, 0, 2]}>
        <boxGeometry args={[1.5, 1, 3]} />
        <meshStandardMaterial color="#666" metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  );
}

function FallingAsteroids({
  count = 50,
  areaRadius = 30,
  speedMin = 0.02,
  speedMax = 0.08,
  sizeMin = 0.05,
  sizeMax = 0.3,
}: {
  count?: number;
  areaRadius?: number;
  speedMin?: number;
  speedMax?: number;
  sizeMin?: number;
  sizeMax?: number;
}) {
  const asteroids = useRef<
    { mesh: THREE.Mesh; speed: number; axis: THREE.Vector3; radius: number }[]
  >([]);

  const initialized = useRef(false);

  useFrame(({ clock }) => {
    if (!initialized.current) return;

    asteroids.current.forEach((asteroid) => {
      // rotate asteroid along random axis
      asteroid.mesh.rotation.x += asteroid.speed * 0.5;
      asteroid.mesh.rotation.y += asteroid.speed * 0.3;

      // fall along z-axis toward center
      const direction = new THREE.Vector3(0, -0.02, 1).normalize(); // slightly downward
      asteroid.mesh.position.addScaledVector(direction, asteroid.speed);

      // recycle asteroids when too far
      if (asteroid.mesh.position.z > areaRadius) {
        asteroid.mesh.position.set(
          (Math.random() - 0.5) * areaRadius * 2,
          Math.random() * areaRadius * 0.5 + 5,
          -areaRadius
        );
        asteroid.speed = Math.random() * (speedMax - speedMin) + speedMin;
      }
    });
  });

  if (!initialized.current) {
    // initialize asteroid meshes
    asteroids.current = Array.from({ length: count }, () => {
      const geom = new THREE.IcosahedronGeometry(
        Math.random() * (sizeMax - sizeMin) + sizeMin,
        1
      );
      const mat = new THREE.MeshStandardMaterial({
        color: "#fffdfd",
        metalness: 0.3,
        roughness: 0.7,
        emissive: "#111",
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(
        (Math.random() - 0.5) * areaRadius * 2,
        Math.random() * areaRadius * 0.5 + 5,
        (Math.random() - 0.5) * areaRadius * 2
      );
      return {
        mesh,
        speed: Math.random() * (speedMax - speedMin) + speedMin,
        axis: new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize(),
        radius: Math.random() * areaRadius,
      };
    });
    initialized.current = true;
  }

  return <>{asteroids.current.map((a, i) => <primitive key={i} object={a.mesh} />)}</>;
}

function FallingAsteroidsWithTrail({
  count = 50,
  areaRadius = 30,
  speedMin = 0.02,
  speedMax = 0.08,
  sizeMin = 0.05,
  sizeMax = 0.3,
  trailColor = "#ff6600",
}: {
  count?: number;
  areaRadius?: number;
  speedMin?: number;
  speedMax?: number;
  sizeMin?: number;
  sizeMax?: number;
  trailColor?: string;
}) {
  const asteroids = useRef<
    {
      mesh: THREE.Mesh;
      speed: number;
      axis: THREE.Vector3;
      trail: THREE.Points;
    }[]
  >([]);

  const initialized = useRef(false);

  useFrame(({ clock }) => {
    if (!initialized.current) return;

    asteroids.current.forEach((asteroid) => {
      // rotate asteroid along random axis
      asteroid.mesh.rotation.x += asteroid.speed * 0.5;
      asteroid.mesh.rotation.y += asteroid.speed * 0.3;

      // move along z-axis
      const direction = new THREE.Vector3(0, -0.02, 1).normalize();
      asteroid.mesh.position.addScaledVector(direction, asteroid.speed);

      // update trail position
      asteroid.trail.position.copy(asteroid.mesh.position);

      // recycle when far
      if (asteroid.mesh.position.z > areaRadius) {
        const newPos = new THREE.Vector3(
          (Math.random() - 0.5) * areaRadius * 2,
          Math.random() * areaRadius * 0.5 + 5,
          -areaRadius
        );
        asteroid.mesh.position.copy(newPos);
        asteroid.trail.position.copy(newPos);
        asteroid.speed = Math.random() * (speedMax - speedMin) + speedMin;
      }
    });
  });

  if (!initialized.current) {
    asteroids.current = Array.from({ length: count }, () => {
      const geom = new THREE.IcosahedronGeometry(
        Math.random() * (sizeMax - sizeMin) + sizeMin,
        1
      );
      const mat = new THREE.MeshStandardMaterial({
        color: "#888",
        metalness: 0.3,
        roughness: 0.7,
        emissive: "#111",
      });
      const mesh = new THREE.Mesh(geom, mat);

      // fire tail / trail
      const trailGeom = new THREE.BufferGeometry();
      const positions = new Float32Array(3);
      trailGeom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const trailMat = new THREE.PointsMaterial({
        color: trailColor,
        size: Math.random() * 0.15 + 0.05,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending,
      });
      const trail = new THREE.Points(trailGeom, trailMat);

      // initial position
      const initPos = new THREE.Vector3(
        (Math.random() - 0.5) * areaRadius * 2,
        Math.random() * areaRadius * 0.5 + 5,
        (Math.random() - 0.5) * areaRadius * 2
      );
      mesh.position.copy(initPos);
      trail.position.copy(initPos);

      return { mesh, speed: Math.random() * (speedMax - speedMin) + speedMin, axis: new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize(), trail };
    });
    initialized.current = true;
  }

  return (
    <>
      {asteroids.current.map((a, i) => (
        <group key={i}>
          <primitive object={a.mesh} />
          <primitive object={a.trail} />
        </group>
      ))}
    </>
  );
}

function BlinkingStars({
  count = 100,
  radius = 60,
  depth = 50,
  sizeMin = 0.03,
  sizeMax = 0.12,
}: {
  count?: number;
  radius?: number;
  depth?: number;
  sizeMin?: number;
  sizeMax?: number;
}) {
  const stars = useRef<
    { mesh: THREE.Mesh; speed: number; baseOpacity: number }[]
  >([]);

  const initialized = useRef(false);

  useFrame(({ clock }) => {
    if (!initialized.current) return;

    stars.current.forEach((s) => {
      const t = clock.getElapsedTime() * s.speed;
      const material = s.mesh.material as THREE.MeshStandardMaterial;
      material.opacity = Math.abs(Math.sin(t)) * s.baseOpacity;
    });
  });

  if (!initialized.current) {
    stars.current = Array.from({ length: count }, () => {
      const geom = new THREE.SphereGeometry(
        Math.random() * (sizeMax - sizeMin) + sizeMin,
        8,
        8
      );
      const mat = new THREE.MeshStandardMaterial({
        color: "#ffffff",
        transparent: true,
        opacity: Math.random() * 0.8 + 0.2,
        emissive: "#ffffff",
        emissiveIntensity: 0.5,
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(
        (Math.random() - 0.5) * radius * 2,
        (Math.random() - 0.5) * depth,
        (Math.random() - 0.5) * radius * 2
      );
      return {
        mesh,
        speed: Math.random() * 2 + 1, // blinking speed
        baseOpacity: mat.opacity,
      };
    });
    initialized.current = true;
  }

  return <>{stars.current.map((s, i) => <primitive key={i} object={s.mesh} />)}</>;
}

function Rocket({
  startPosition = [0, 0, 0],
  speed = 0.15,
  tailLength = 15,
  color = "#ff3333",
}: {
  startPosition?: [number, number, number];
  speed?: number;
  tailLength?: number;
  color?: string;
}) {
  const rocketRef = useRef<THREE.Group>(null);
  const tailRef = useRef<THREE.Points[]>([]);
  const { scene } = useThree();
  const positions = useRef<THREE.Vector3[]>([]);

  // Initialize positions for tail
  useEffect(() => {
    for (let i = 0; i < tailLength; i++) {
      positions.current.push(new THREE.Vector3(...startPosition));
      const geom = new THREE.BufferGeometry();
      const posArray = new Float32Array(3);
      geom.setAttribute("position", new THREE.BufferAttribute(posArray, 3));
      const mat = new THREE.PointsMaterial({
        color,
        size: Math.random() * 0.15 + 0.05,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
      });
      const points = new THREE.Points(geom, mat);
      tailRef.current.push(points);
      scene.add(points);
    }
  }, [scene, startPosition, tailLength, color]);

  useFrame(() => {
    if (!rocketRef.current) return;

    // move rocket forward along z-axis
    rocketRef.current.position.z += speed;

    // update tail positions
    positions.current.pop(); // remove last
    positions.current.unshift(rocketRef.current.position.clone()); // add current position at start

    tailRef.current.forEach((tail, i) => {
      const pos = positions.current[i];
      const geom = tail.geometry as THREE.BufferGeometry;
      const positionAttr = geom.attributes.position as THREE.BufferAttribute;
      positionAttr.setXYZ(0, pos.x, pos.y, pos.z);
      positionAttr.needsUpdate = true;
    });
  });

  return (
    <group ref={rocketRef} position={startPosition} rotation={[0, Math.PI, 0]}>
      {/* Rocket Body */}
      <mesh>
        <cylinderGeometry args={[0.2, 0.3, 1.5, 12]} />
        <meshStandardMaterial color="#ffffff" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* Rocket Nose */}
      <mesh position={[0, 0.85, 0]}>
        <coneGeometry args={[0.2, 0.5, 12]} />
        <meshStandardMaterial color="#ff3333" emissive="#ff6600" emissiveIntensity={0.9} />
      </mesh>
      {/* Rocket Fins */}
      <mesh position={[-0.15, -0.65, 0]}>
        <boxGeometry args={[0.1, 0.4, 0.02]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[0.15, -0.65, 0]}>
        <boxGeometry args={[0.1, 0.4, 0.02]} />
        <meshStandardMaterial color="#333" />
      </mesh>
    </group>
  );
}

function MilkyWayGalaxy({
  radius = 120,
  arms = 9,
  starCount = 6000,
  rotationSpeed = 0.002,
}: {
  radius?: number;
  arms?: number;
  starCount?: number;
  rotationSpeed?: number;
}) {
  const ref = useRef<THREE.Group>(null);
  const geometry = useRef<THREE.BufferGeometry>(new THREE.BufferGeometry());

  useEffect(() => {
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const r = Math.random() ** 0.7 * radius;
      const armAngle =
        ((i % arms) / arms) * Math.PI * 2 +
        r * 0.05 +
        Math.random() * 0.5;

      const x = Math.cos(armAngle) * r;
      const z = Math.sin(armAngle) * r;
      const y = (Math.random() - 0.5) * 6;

      positions.set([x, y, z], i * 3);

      const intensity = 0.6 + Math.random() * 0.4;
      colors.set([intensity, intensity * 0.9, 1], i * 3);
    }

    geometry.current.setAttribute(
      "position",
      new THREE.BufferAttribute(positions, 3)
    );
    geometry.current.setAttribute(
      "color",
      new THREE.BufferAttribute(colors, 3)
    );
  }, [radius, starCount, arms]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    ref.current.rotation.y = clock.getElapsedTime() * rotationSpeed;
  });

  return (
    <group ref={ref}>
      {/* Galaxy Stars */}
      <points geometry={geometry.current}>
        <pointsMaterial
          size={0.0006}
          vertexColors
          transparent
          opacity={1.85}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Galaxy Core Glow */}
      <mesh>
        <sphereGeometry args={[6, 32, 32]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#88aaff"
          emissiveIntensity={2.5}
          transparent
          opacity={0.25}
        />
      </mesh>
    </group>
  );
}


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
          <color attach="background" args={["#02030a"]} />
          
          {/* CAMERA FORCE */}
          <CameraFocus />
          
          <ambientLight intensity={0.6} />
          <pointLight position={[5, 5, 5]} intensity={3.5} />

          <CameraDust />
          <MovingSpaceStation pathCenter={[0, 0, 0]} orbitRadius={18} speed={0.02} scale={0.12} tilt={0.15} seed={3} />
          <StarsLayerGroup />

          <group position={[-22, -4, -45]}>
            <LocalStarDust radius={20} count={1500} />
            <SaturnPlanet distance={60} speed={0.05} seed={7} />
            <DeepSpaceRedStar position={[35, 18, -160]} size={1.5} seed={4} orbitRadius={8} orbitSpeed={0.015} drift={2} />
          </group>

          <MovingSpaceStation pathCenter={[1, 5, 9]} orbitRadius={18} speed={0.05} scale={0.08} tilt={0.89} seed={3} />

          {/* PLANET SYSTEM */}
          <group>
            {/* <Earth /> */}
            <MovingEarthStar position={[3, 1, -2]} size={0.1} orbitSpeed={0.8} />
            {/* <Moon /> */}
          </group>
          
          <Sun />

          {/* 🛰️ small distant station */}
          {/* <DistantSpaceStation /> */}
          {/* <SmallSpaceStation position={[10, 2, -12]} scale={0.18} rotationSpeed={0.008} /> */}

          <BlinkingStars count={120} radius={80} depth={60} sizeMin={0.03} sizeMax={0.1} />

          {/* <Rocket startPosition={[0, 1, -50]} speed={0.2} tailLength={2} color="#ff6600" /> */}

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
          

          <FallingAsteroids count={10} areaRadius={2000} speedMin={0.02} speedMax={0.08} sizeMin={0.05} sizeMax={0.25} />

          {/* <FallingAsteroidsWithTrail 
            count={80} 
            areaRadius={50} 
            speedMin={0.02} 
            speedMax={0.06} 
            sizeMin={0.05} 
            sizeMax={0.25} 
            trailColor="#ff6600" 
          /> */}

          <MovingSpaceStation pathCenter={[0, 0, 0]} orbitRadius={18} speed={0.02} scale={0.3} tilt={0.15} seed={3} />
           
          <GiantSpaceStation position={[50, 10, -200]} baseScale={0.7} minVisibleScale={0.5} rotationSpeed={0.004} />

          {/* <MilkyWayGalaxy
            radius={10}
            arms={1}
            starCount={80}
            rotationSpeed={0.0015}
          /> */}

          {/* CINEMATIC POST EFFECTS */}
          <EffectComposer>
            <Bloom
              intensity={3}            // 🔥 glow strength
              luminanceThreshold={0.15} // kitna bright hone pe glow aaye
              luminanceSmoothing={0.9}
              blendFunction={BlendFunction.ADD}
            />
            <Vignette
              eskil={false}
              offset={0.15}
              darkness={0.7}             // lens edge darkening
            />
          </EffectComposer>
        </Canvas>
      )}
    </div>
  );
}
