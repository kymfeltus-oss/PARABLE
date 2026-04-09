'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGlobalPulsePosts } from '@/hooks/useGlobalPulsePosts';

function PulseSphere({ burst }: { burst: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [emissive, setEmissive] = useState(0.35);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.35;
      meshRef.current.rotation.x = Math.sin(meshRef.current.rotation.y * 0.5) * 0.08;
    }
  });

  useEffect(() => {
    if (burst <= 0) return;
    setEmissive(1.15);
    const t = window.setTimeout(() => setEmissive(0.35), 520);
    return () => window.clearTimeout(t);
  }, [burst]);

  return (
    <mesh ref={meshRef} scale={0.92}>
      <sphereGeometry args={[1, 48, 48]} />
      <meshStandardMaterial
        color="#050508"
        metalness={0.55}
        roughness={0.35}
        emissive="#00f2ff"
        emissiveIntensity={emissive}
      />
    </mesh>
  );
}

function GlorySparks({ burst }: { burst: number }) {
  const group = useRef<THREE.Group>(null);
  const particles = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i < 32; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const r = 1.05 + Math.random() * 0.35;
      pts.push(
        new THREE.Vector3(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi)
        )
      );
    }
    return pts;
  }, [burst]);

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.8;
  });

  if (burst === 0) return null;

  return (
    <group ref={group}>
      {particles.map((p, i) => (
        <mesh key={`${burst}-${i}`} position={p}>
          <sphereGeometry args={[0.04 + (i % 3) * 0.015, 6, 6]} />
          <meshBasicMaterial color={i % 2 === 0 ? '#fbbf24' : '#22d3ee'} transparent opacity={0.92} />
        </mesh>
      ))}
    </group>
  );
}

function Scene() {
  const { sparkCount } = useGlobalPulsePosts();
  const [burstFlash, setBurstFlash] = useState(0);

  useEffect(() => {
    if (sparkCount === 0) return;
    setBurstFlash(sparkCount);
    const t = window.setTimeout(() => setBurstFlash(0), 850);
    return () => window.clearTimeout(t);
  }, [sparkCount]);

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[3, 2, 4]} intensity={1.4} color="#00f2ff" />
      <pointLight position={[-2, -1, 3]} intensity={0.5} color="#fbbf24" />
      <PulseSphere burst={sparkCount} />
      {burstFlash > 0 ? <GlorySparks burst={burstFlash} /> : null}
    </>
  );
}

export default function GlobalPulseGlobeInner() {
  return (
    <Canvas
      gl={{ antialias: true, alpha: true }}
      style={{ height: '100%', width: '100%' }}
      camera={{ position: [0, 0, 2.65], fov: 42 }}
    >
      <Scene />
    </Canvas>
  );
}
