/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/purity */
import * as THREE from "three"
import { useRef, useMemo } from "react"
import { useFrame, useThree } from "@react-three/fiber"

export default function ProStarfield() {
  const pointsRef = useRef<THREE.Points>(null!)
  const { clock } = useThree()

  const STAR_COUNT = 30
  const RADIUS = 2500

  // Generate positions ONCE (no regeneration)
  const { positions, sizes } = useMemo(() => {
    const positions = new Float32Array(STAR_COUNT * 3)
    const sizes = new Float32Array(STAR_COUNT)

    for (let i = 0; i < STAR_COUNT; i++) {
      const r = Math.random() * RADIUS
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos((Math.random() * 2) - 1)

      const x = r * Math.sin(phi) * Math.cos(theta)
      const y = r * Math.sin(phi) * Math.sin(theta)
      const z = r * Math.cos(phi)

      positions[i * 3] = x
      positions[i * 3 + 1] = y
      positions[i * 3 + 2] = z

      sizes[i] = Math.random() * 2 + 0.5
    }

    return { positions, sizes }
  }, [])

  // Gentle galaxy rotation (VERY CHEAP)
  useFrame((_, delta) => {
    pointsRef.current.rotation.y += delta * 0.01
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={positions.length / 3}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          array={sizes}
          count={sizes.length}
          itemSize={1}
        />
      </bufferGeometry>

      <shaderMaterial
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexShader={`
          attribute float size;
          varying float vAlpha;

          void main() {
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * (300.0 / -mvPosition.z);
            vAlpha = size / 3.0;
            gl_Position = projectionMatrix * mvPosition;
          }
        `}
        fragmentShader={`
          varying float vAlpha;

          void main() {
            float dist = length(gl_PointCoord - vec2(0.5));
            if (dist > 0.5) discard;

            float strength = 1.0 - smoothstep(0.0, 0.5, dist);

            gl_FragColor = vec4(vec3(1.0), strength * vAlpha);
          }
        `}
      />
    </points>
  )
}
