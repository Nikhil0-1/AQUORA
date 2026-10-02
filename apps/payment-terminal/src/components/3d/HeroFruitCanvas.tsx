import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

function LiquidSanitizerOrb({ position, color, scale = 1 }: { position: [number, number, number]; color: string; scale?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.4;
      meshRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 0.3) * 0.15;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.8} floatIntensity={1.5} position={position}>
      <mesh ref={meshRef} scale={scale}>
        <sphereGeometry args={[1, 32, 32]} />
        <MeshDistortMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.2}
          roughness={0.1}
          metalness={0.1}
          distort={0.3}
          speed={2}
        />
      </mesh>
    </Float>
  );
}

function FloatingLiquidDroplet({ position, scale = 0.25 }: { position: [number, number, number]; scale?: number }) {
  return (
    <Float speed={4} rotationIntensity={2} floatIntensity={3} position={position}>
      <mesh scale={scale}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshPhysicalMaterial
          color="#06b6d4"
          transmission={0.9}
          opacity={0.9}
          transparent
          roughness={0.05}
          ior={1.33} // Water/sanitizer refraction index
        />
      </mesh>
    </Float>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight position={[10, 15, 10]} intensity={1.8} color="#e0f2fe" />
      <directionalLight position={[-10, -5, -5]} intensity={0.6} color="#0891b2" />
      <pointLight position={[0, 2, 4]} intensity={1.2} color="#ffffff" />

      {/* Floating 5 Signature Sanitizer Fluid Orbs */}
      <LiquidSanitizerOrb position={[-2.4, 0.4, 0]} color="#06b6d4" scale={1.1} />
      <LiquidSanitizerOrb position={[2.5, 0.8, -0.5]} color="#38bdf8" scale={1.0} />
      <LiquidSanitizerOrb position={[-1.2, -1.3, 0.5]} color="#10b981" scale={0.9} />
      <LiquidSanitizerOrb position={[1.4, -1.1, -0.8]} color="#6366f1" scale={0.85} />
      <LiquidSanitizerOrb position={[0.2, 1.8, -0.3]} color="#0284c7" scale={0.7} />

      {/* Aqua Sanitizer droplets */}
      <FloatingLiquidDroplet position={[-0.8, 0.6, 1.2]} scale={0.3} />
      <FloatingLiquidDroplet position={[1.8, 1.5, 0.5]} scale={0.25} />
      <FloatingLiquidDroplet position={[-1.9, -0.8, 0.8]} scale={0.2} />

      {/* Soft Aqua particles */}
      <Sparkles count={55} scale={8} size={2.5} speed={0.4} opacity={0.6} color="#38bdf8" />
    </>
  );
}

export const HeroFruitCanvas: React.FC = () => {
  return (
    <div className="w-full h-full min-h-[380px] lg:min-h-[520px] relative pointer-events-none select-none">
      <Canvas
        camera={{ position: [0, 0, 6.2], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Scene />
      </Canvas>
    </div>
  );
};
