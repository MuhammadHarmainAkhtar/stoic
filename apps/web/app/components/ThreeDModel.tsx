"use client";

import React, { Suspense, useRef, useEffect } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { FBXLoader } from "three-stdlib";
import { OrbitControls, Center} from "@react-three/drei";
import type { Group } from "three";

const Model = () => {
  const fbx = useLoader(FBXLoader, "/Stoic3D.fbx");
  const modelRef = useRef<Group | null>(null);

  useEffect(() => {
    if (modelRef.current) {
      modelRef.current.position.set(0, -1, 0);
      modelRef.current.rotation.set(0, 0, 0);
    }
  }, [fbx]);

  useFrame(() => {
    if (modelRef.current) {
      modelRef.current.rotation.y += 0.003;
    }
  });

  return (
    <Center>
      <primitive
        ref={modelRef}
        object={fbx}
        scale={0.028}
        position={[0, -1, 0]}
      />
    </Center>
  );
};

export default function ThreeDModel() {
  return (
    <div className="w-full h-full">
      <Canvas
        shadows
        className="w-full h-full"
        camera={{ position: [0, 2, 8], fov: 50 }}
      >
        {/* Enhanced lighting setup */}
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={0.8}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight position={[-5, -5, -5]} intensity={0.4} />

        <Suspense fallback={<LoadingFallback />}>
          <Model />
        </Suspense>

        <OrbitControls
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.5}
          minDistance={4}
          maxDistance={12}
          target={[0, 0, 0]}
          dampingFactor={0.05}
        />
      </Canvas>
    </div>
  );
}

const LoadingFallback = () => {
  return (
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="gray" wireframe />
    </mesh>
  );
};
