import * as THREE from "three";
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";

export default function SaptarishiStars() {
  const groupRef = useRef<THREE.Group>(null!);

  // Realistic Big Dipper style layout
  const positions = useMemo(() => {
    const scale = 4;

    const starPositions = [
      [-3, 1, 0], // Star 1
      [-1.5, 2, 0], // Star 2
      [0, 2.2, 0], // Star 3
      [1.5, 1.5, 0], // Star 4 (bend)
      [3, 0.5, 0], // Star 5
      [4.5, 0.8, 0], // Star 6
      [6, 1.2, 0], // Star 7 (handle end)
    ];
    
    // If you want more like Pleiades cluster (tight group of 7 stars): Then scale by 6–8.
    // This makes a tight celestial sister cluster.
    // const starPositions = [
    //   [0, 0, 0],
    //   [0.5, 0.3, 0],
    //   [-0.4, 0.6, 0],
    //   [0.8, -0.2, 0],
    //   [-0.6, -0.4, 0],
    //   [0.2, 0.9, 0],
    //   [-0.9, 0.1, 0],
    // ];

    const arr = new Float32Array(starPositions.length * 3);

    starPositions.forEach((pos, i) => {
      arr[i * 3] = pos[0] * scale;
      arr[i * 3 + 1] = pos[1] * scale;
      arr[i * 3 + 2] = pos[2] * scale;
    });

    return arr;
  }, []);

  useFrame((_, delta) => {
    groupRef.current.rotation.y += delta * 0.1;
  });

  return (
    <group ref={groupRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={positions}
            count={positions.length / 3}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial size={0.03} color="#ffffff" sizeAttenuation />
      </points>
    </group>
  );
}
