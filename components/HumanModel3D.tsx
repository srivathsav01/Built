"use client";

import { useRef, Suspense, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { useLoading } from '@/lib/context/LoadingContext';

// Loading Progress Component
function LoadingProgress({ progress }: { progress: number }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-transparent">
      <div className="text-center">
        <div className="relative w-32 h-32 mx-auto mb-4">
          {/* Circular Progress */}
          <svg className="transform -rotate-90 w-32 h-32">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-slate-700"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={351.86}
              strokeDashoffset={351.86 - (351.86 * progress) / 100}
              className="text-blue-500 transition-all duration-300"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl font-bold text-white">{Math.round(progress)}%</span>
          </div>
        </div>
        <p className="text-slate-300 text-sm">Loading 3D Model...</p>
      </div>
    </div>
  );
}

// Component to load and display the GLTF model
function HumanModel({ 
  modelPath, 
  onProgress 
}: { 
  modelPath: string;
  onProgress: (progress: number) => void;
}) {
  const { scene } = useGLTF(modelPath, true, true, (loader) => {
    loader.manager.onProgress = (url, itemsLoaded, itemsTotal) => {
      const progress = (itemsLoaded / itemsTotal) * 100;
      onProgress(progress);
    };
  });
  const groupRef = useRef<THREE.Group>(null);

  // Clone and center the model once
  const clonedScene = useMemo(() => {
    const cloned = scene.clone();
    
    // Calculate bounding box to center the model
    const box = new THREE.Box3().setFromObject(cloned);
    const center = box.getCenter(new THREE.Vector3());
    
    // Center the model at origin
    cloned.position.x = -center.x;
    cloned.position.y = -center.y;
    cloned.position.z = -center.z;
    
    // Enable shadows
    cloned.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    
    return cloned;
  }, [scene]);

  return (
    <group ref={groupRef}>
      <primitive 
        object={clonedScene} 
        scale={1.8} 
        position={[0, -1.5, 0]}
      />
    </group>
  );
}

export default function HumanModel3D() {
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isLoadingModal, setIsLoadingModal] = useState(true);
  const {setIsLoading} = useLoading();
  const modelPath = '/human-model (2).glb';

  const handleProgress = (progress: number) => {
    setLoadingProgress(progress);
    if (progress >= 100) {
      // Add a small delay before hiding loader for smooth transition
      setTimeout(() => setIsLoadingModal(false), 100);
      setIsLoading(false)
    }
  };

  return (
    <div className="flex items-center justify-center w-full h-full relative">
      {isLoadingModal && <LoadingProgress progress={loadingProgress} />}
      
      <div className="w-[500px] h-[450px] max-w-full max-h-[70vh] overflow-hidden">
        <Canvas
          shadows
          gl={{ antialias: true }}
          style={{ background: 'transparent', width: '100%', height: '100%' }}
          camera={{ position: [-4, 0.3, 2.5], fov: 45 }}
        >
          <PerspectiveCamera makeDefault position={[-4, 0.3, 2.5]} fov={45} />
          
          {/* Lighting */}
          <directionalLight
            position={[5, 5, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <directionalLight position={[-5, 3, -5]} intensity={0.4} />
          <pointLight position={[0, 5, 0]} intensity={10} />
          
          {/* Environment for better lighting */}
          <Environment preset="sunset" />

          {/* Human Model with Suspense for loading */}
          <Suspense fallback={null}>
            <HumanModel modelPath={modelPath} onProgress={handleProgress} />
          </Suspense>

          {/* Orbit Controls - Y-axis rotation only (circular) */}
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            enableRotate={true}
            minDistance={2}
            maxDistance={6}
            autoRotate={false}
            minPolarAngle={Math.PI / 2}
            maxPolarAngle={Math.PI / 2}
            rotateSpeed={1}
          />
        </Canvas>
      </div>
    </div>
  );
}