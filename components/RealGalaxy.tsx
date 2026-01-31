"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";

function GalaxyDisk() {
  const texture = new THREE.TextureLoader().load(
    "https://upload.wikimedia.org/wikipedia/commons/6/60/Andromeda_Galaxy_%28unWISE%29.jpg"
  );

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
    </mesh>
  );
}

export default function RealGalaxy() {
  return (
    <Canvas
      camera={{ position: [0, 4, 12], fov: 45 }}
      gl={{ antialias: true }}
    >
      <color attach="background" args={["#02030a"]} />

      {/* LIGHTING */}
      <ambientLight intensity={0.6} />
      <pointLight position={[0, 0, 0]} intensity={4} color="#ffd7a8" />

      {/* STAR DEPTH */}
      <Stars radius={100} depth={60} count={8000} factor={4} fade />

      {/* GALAXY */}
      <GalaxyDisk />

      {/* CAMERA CONTROL */}
      <OrbitControls
        enableZoom
        enablePan={false}
        dampingFactor={0.08}
        autoRotate
        autoRotateSpeed={0.25}
      />
    </Canvas>
  );
}
