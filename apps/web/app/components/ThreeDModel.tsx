"use client";

import React, { Suspense, useRef, useEffect } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { FBXLoader } from "three-stdlib";
import { OrbitControls, Center } from "@react-three/drei";
import type { Group } from "three";

const Model = () => {
  const fbx = useLoader(FBXLoader, "/Stoic3D.fbx");
  const modelRef = useRef<Group | null>(null);
  const [modelScale, setModelScale] = React.useState(0.028);
  const [modelPosition, setModelPosition] = React.useState<
    [number, number, number]
  >([0, -1, 0]);
  const [cameraPosition, setCameraPosition] = React.useState<
    [number, number, number]
  >([0, 2, 8]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setModelScale(0.032); // even smaller on mobile
        setModelPosition([0, -1.5, 0]); // lower model
        setCameraPosition([0, 1.8, 10.5]); // zoom out camera more
      } else {
        setModelScale(0.019); // smaller on desktop too
        setModelPosition([0, 0, 0]); // lower model
        setCameraPosition([0, 2.2, 9.5]); // zoom out camera
      }
    };
  
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  
  
  

  useEffect(() => {
    if (modelRef.current) {
      modelRef.current.position.set(...modelPosition);
      modelRef.current.rotation.set(0, 0, 0);
    }
  }, [fbx, modelPosition]);

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
        scale={modelScale}
        position={modelPosition}
      />
    </Center>
  );
};

export default function ThreeDModel() {
  const [cameraPosition] = React.useState<[number, number, number]>([0, 2, 8]);
  const [fov, setFov] = React.useState(50); // Default FOV

  useEffect(() => {
    // Update FOV based on window width only on client side
    setFov(window.innerWidth < 768 ? 60 : 50);

    const handleResize = () => {
      setFov(window.innerWidth < 768 ? 60 : 50);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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
