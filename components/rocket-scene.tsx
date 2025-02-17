"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { PerspectiveCamera, Environment } from "@react-three/drei"
import type * as THREE from "three"

export function RocketScene() {
  const rocketRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (rocketRef.current) {
      rocketRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.2
      rocketRef.current.position.y = Math.sin(state.clock.elapsedTime) * 0.2
    }
  })

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 10]} />
      <Environment preset="sunset" />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <group ref={rocketRef} position={[0, 0, 0]}>
        {/* Rocket body */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.5, 1, 3, 32]} />
          <meshStandardMaterial color="#4A90E2" />
        </mesh>
        {/* Rocket nose */}
        <mesh position={[0, 1.75, 0]}>
          <coneGeometry args={[0.5, 1, 32]} />
          <meshStandardMaterial color="#4A90E2" />
        </mesh>
        {/* Windows */}
        <mesh position={[0, 0.5, 0.52]}>
          <sphereGeometry args={[0.2, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
        {/* Flames */}
        <group position={[0, -1.5, 0]}>
          <mesh>
            <coneGeometry args={[0.4, 1, 32]} />
            <meshStandardMaterial color="#FF6B6B" emissive="#FF6B6B" emissiveIntensity={0.5} />
          </mesh>
        </group>
        {/* Kid 1 */}
        <group position={[-0.3, 0.2, 0.6]}>
          <mesh>
            <sphereGeometry args={[0.2, 32, 32]} />
            <meshStandardMaterial color="#FFD166" />
          </mesh>
        </group>
        {/* Kid 2 */}
        <group position={[0.3, 0.2, 0.6]}>
          <mesh>
            <sphereGeometry args={[0.2, 32, 32]} />
            <meshStandardMaterial color="#06D6A0" />
          </mesh>
        </group>
      </group>
    </>
  )
}

