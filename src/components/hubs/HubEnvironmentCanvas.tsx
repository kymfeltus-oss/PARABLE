'use client';

import { Suspense, useLayoutEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { HUB_DEFINITIONS, type HubId } from '@/lib/hub-registry';

function HubFogSync({ hubId }: { hubId: HubId }) {
  const { scene } = useThree();
  useLayoutEffect(() => {
    const c = new THREE.Color(HUB_DEFINITIONS[hubId].accent);
    scene.fog = new THREE.FogExp2(c, 0.048);
  }, [hubId, scene]);
  return null;
}

function SmoothCamera({ hubId }: { hubId: HubId }) {
  const { camera } = useThree();
  const goal = useMemo(() => {
    const t = HUB_DEFINITIONS[hubId].cameraTarget;
    return new THREE.Vector3(t[0], t[1], t[2]);
  }, [hubId]);

  useFrame((_, delta) => {
    const k = 1 - Math.exp(-3.2 * Math.min(delta, 0.1));
    camera.position.lerp(goal, k);
    camera.lookAt(0, 0.35, 0);
  });

  return null;
}

function HubScene({ hubId }: { hubId: HubId }) {
  const accent = HUB_DEFINITIONS[hubId].accent;
  const col = useMemo(() => new THREE.Color(accent), [accent]);

  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[6, 10, 4]} intensity={0.85} color="#ffffff" />
      <pointLight position={[0, 2.2, 2]} intensity={1.4} color={col} distance={14} decay={2} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[24, 24]} />
        <meshStandardMaterial color="#0a0a0c" metalness={0.2} roughness={0.92} />
      </mesh>

      <mesh position={[0, 0.55, 0]}>
        <torusKnotGeometry args={[0.85, 0.22, 180, 24]} />
        <meshStandardMaterial color={col} emissive={col} emissiveIntensity={0.22} metalness={0.45} roughness={0.35} />
      </mesh>

      <mesh position={[-2.2, 0.25, -1.2]}>
        <boxGeometry args={[0.7, 1.1, 0.7]} />
        <meshStandardMaterial color="#1a1a22" metalness={0.5} roughness={0.4} />
      </mesh>

      <mesh position={[2.1, 0.4, -0.8]}>
        <cylinderGeometry args={[0.35, 0.45, 1.2, 20]} />
        <meshStandardMaterial color="#12121a" metalness={0.35} roughness={0.55} />
      </mesh>
    </>
  );
}

export default function HubEnvironmentCanvas({ hubId }: { hubId: HubId }) {
  return (
    <div className="h-full w-full min-h-[200px] rounded-2xl border border-white/10 bg-black overflow-hidden">
      <Canvas dpr={[1, 2]} gl={{ antialias: true, alpha: false }}>
        <color attach="background" args={['#050508']} />
        <PerspectiveCamera makeDefault position={[4, 2.5, 7]} fov={48} near={0.1} far={80} />
        <HubFogSync hubId={hubId} />
        <SmoothCamera hubId={hubId} />
        <Suspense fallback={null}>
          <HubScene hubId={hubId} />
        </Suspense>
      </Canvas>
    </div>
  );
}
