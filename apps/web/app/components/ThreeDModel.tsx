"use client";

import React, { Suspense, useRef, useEffect } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { FBXLoader } from "three-stdlib";
import { OrbitControls, Center } from "@react-three/drei";
import type { Group } from "three";

const Model = () => {
  const fbx = useLoader(FBXLoader, "/Stoic3D.fbx");
  const modelRef = useRef<Group | null>(null);
  const [modelScale, setModelScale] = React.useState(0.04); // Increased base scale
  const [modelPosition, setModelPosition] = React.useState<[number, number, number]>([0, -0.5, 0]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setModelScale(0.045); // Larger on mobile
        setModelPosition([0, 0, 0]);
      } else {
        setModelScale(0.04); // Larger on desktop
        setModelPosition([0, 0, 0]);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (modelRef.current) {
      modelRef.current.position.set(...modelPosition);
    }
  }, [fbx, modelPosition]);

  return (
    <Center>
      <primitive
        ref={modelRef}
        object={fbx}
        scale={modelScale}
        position={modelPosition}
      />
    </Center>
  );
};

export default function ThreeDModel() {
  const [cameraPosition] = React.useState<[number, number, number]>([0, 2, 6.5]); // Moved camera closer
  const [fov, setFov] = React.useState(50);

  useEffect(() => {
    setFov(window.innerWidth < 768 ? 75 : 65); // Increased FOV for better view

    const handleResize = () => {
      setFov(window.innerWidth < 768 ? 75 : 65);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="w-full h-full">
      <Canvas
        shadows
        className="w-full h-full max-h-full"
        camera={{
          position: cameraPosition,
          fov: fov,
          near: 0.1,
          far: 1000,
        }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={0.9}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight position={[-5, -5, -5]} intensity={0.5} />

        <Suspense fallback={<LoadingFallback />}>
          <Model />
        </Suspense>

        <OrbitControls
          enablePan={false}
          enableZoom={false}
          enableRotate={true}
          minPolarAngle={Math.PI / 2.5}
          maxPolarAngle={Math.PI / 1.8}
          minAzimuthAngle={-Math.PI / 2}
          maxAzimuthAngle={Math.PI / 2}
          minDistance={9}
          maxDistance={9}
          target={[0, 0, 0]}
          dampingFactor={0.1}
        />
      </Canvas>
    </div>
  );
}

const LoadingFallback = () => {
  return (
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[0, 0, 0]} />
      <meshStandardMaterial color="gray" wireframe />
    </mesh>
  );
};
