"use client";

import { useRef, Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, useGLTF, Environment } from '@react-three/drei';
import * as THREE from 'three';

function HumanModel({ modelPath }: { modelPath: string }) {
  const { scene } = useGLTF(modelPath);
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

  // Auto-rotate the model
  // useFrame((state, delta) => {
  //   if (groupRef.current) {
  //     groupRef.current.rotation.y += delta * 0.5; // Rotate at 0.5 radians per second
  //   }
  // });

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

function ModelLoader() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  );
}

export default function HumanModel3D() {
  const modelPath = '/human-model.glb';
  if (typeof window !== 'undefined') {
    try {
      useGLTF.preload(modelPath);
    } catch (e) {
    }
  }

  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="w-[500px] h-[450px] max-w-full max-h-[70vh] overflow-hidden">
        <Canvas
          shadows
          gl={{ antialias: true }}
          style={{ background: 'transparent', width: '100%', height: '100%' }}
          camera={{ position: [-4, 0.3, 2.5], fov: 45 }}
        >
        <PerspectiveCamera makeDefault position={[-4, 0.3, 2.5]} fov={45} />
        
        <directionalLight
          position={[5, 5, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <directionalLight position={[-5, 3, -5]} intensity={0.4} />
        <pointLight position={[0, 5, 0]} intensity={10} />
        
        <Environment preset="sunset" />

        <Suspense fallback={<ModelLoader />}>
          <HumanModel modelPath={modelPath} />
          {/* <ModelLoader /> */}
        </Suspense>

        
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