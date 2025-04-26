"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useLoader } from "@react-three/fiber";
import { FBXLoader } from "three-stdlib";
import { Suspense, useRef, useEffect } from "react";
import { OrbitControls, Center, PerspectiveCamera } from "@react-three/drei";
import type { Group } from "three";

const Model = () => {
  const fbx = useLoader(FBXLoader, "/Stoic3D.fbx");
  const modelRef = useRef<Group | null>(null);
  
  useEffect(() => {
    if (modelRef.current) {
      // Reset position and apply proper scale
      modelRef.current.position.set(0, 0, 0);
      modelRef.current.rotation.set(0, 0, 0);
    }
  }, [fbx]);

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
        scale={0.04} // Reduced scale slightly
        position={[0, -0.5, 0]} // Adjusted to be more visible
      />
    </Center>
  );
};

export default function ThreeDModel() {
  return (
    <div className="w-full h-screen max-h-screen">
      <Canvas
        shadows
        className="w-full h-full border border-gray-300 rounded-md"
      >
        {/* Custom camera with adjusted position */}
        <PerspectiveCamera makeDefault position={[0, 1, 8]} fov={60} />
        
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
        <directionalLight position={[-10, -10, -5]} intensity={0.5} />
        
        <Suspense fallback={<LoadingFallback />}>
          <Model />
        </Suspense>
        
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={20}
          target={[0, 0, 0]} // Focus on center
        />
      </Canvas>
    </div>
  );
}

// Simple loading fallback
const LoadingFallback = () => {
  return (
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="gray" wireframe />
    </mesh>
  );
}