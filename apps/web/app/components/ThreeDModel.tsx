'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { useLoader } from '@react-three/fiber';
import { FBXLoader } from 'three-stdlib';
import { Suspense, useRef } from 'react';
import { OrbitControls, Center } from '@react-three/drei';
import type { Group } from 'three';

const Model = () => {
  const fbx = useLoader(FBXLoader, '/Stoic3D.fbx');
  const modelRef = useRef<Group | null>(null);

  // Optional: animate model rotation
  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.rotation.y += 0.002;
    }
  });

  return (
    <Center>
      <primitive 
        ref={modelRef} 
        object={fbx} 
        scale={0.05} 
        position={[0, 0, 0]} // Adjusted position to be centered
      />
    </Center>
  );
};

export default function ThreeDModel() {
  return (
    <div style={{ height: "500px" }}>
      <Canvas 
        shadows 
        camera={{ position: [0, 2, 10], fov: 50 }}  // Adjusted camera position
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.7} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1} 
          castShadow 
        />
        <Suspense fallback={null}>
          <Model />
        </Suspense>
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={20}  // Increased max distance
        />
      </Canvas>
    </div>
  );
}