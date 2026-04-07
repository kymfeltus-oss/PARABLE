'use client';

import { useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { useRef } from 'react';
import type { Group } from 'three';

/** Minimal PBR-forward lab scene: directional sun + shadowed floor + physical sphere. */
export default function ParableEngineScene() {
  const group = useRef<Group>(null);
  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.15;
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[2.8, 1.9, 3.6]} fov={50} />
      <OrbitControls enableDamping dampingFactor={0.06} maxPolarAngle={Math.PI / 2 - 0.08} />

      <color attach="background" args={['#030306']} />
      <ambientLight intensity={0.18} />
      <directionalLight
        castShadow
        position={[6, 10, 4]}
        intensity={1.35}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={40}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
      />

      <mesh rotation-x={-Math.PI / 2} position={[0, -0.55, 0]} receiveShadow>
        <planeGeometry args={[24, 24]} />
        <meshStandardMaterial color="#0b1220" roughness={0.92} metalness={0.08} />
      </mesh>

      <group ref={group} position={[0, 0.15, 0]}>
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[0.55, 64, 64]} />
          <meshPhysicalMaterial
            color="#2dd4bf"
            emissive="#083344"
            emissiveIntensity={0.15}
            metalness={0.65}
            roughness={0.28}
            clearcoat={0.45}
            clearcoatRoughness={0.2}
          />
        </mesh>
      </group>
    </>
  );
}
