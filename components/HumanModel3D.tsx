"use client";

import { useRef, Suspense, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, useGLTF, Environment, Html } from '@react-three/drei';
import * as THREE from 'three';

type MetricProps = {
  label: string;
  value: string;
  position: [number, number, number];
  rotationSpeed: number;
};

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

function RotatingMetric({ label, value, position, rotationSpeed, angleOffset }: MetricProps & { angleOffset: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.getElapsedTime() * rotationSpeed;
      const radius = 2.5; // Fixed radius to keep within frame
      const angle = time + angleOffset;
      
      groupRef.current.position.x = Math.cos(angle) * radius;
      groupRef.current.position.z = Math.sin(angle) * radius;
      groupRef.current.position.y = position[1];
      
      // Hide when behind the model (when z is negative from camera perspective)
      const isVisible = groupRef.current.position.z > -0.5;
      groupRef.current.visible = isVisible;
    }
  });

  return (
    <group ref={groupRef}>
      <Html
        center
        distanceFactor={4}
        zIndexRange={[0, 0]}
        occlude
        style={{
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        <div className="flex flex-col items-center gap-1 animate-fade-in">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest whitespace-nowrap">
            {label}
          </p>
          <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-primary via-purple-400 to-pink-400 whitespace-nowrap">
            {value}
          </p>
        </div>
      </Html>
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

export default function HumanModel3D({ metrics }: { metrics?: Array<{ label: string; value: string }> }) {
  const modelPath = '/human-model.glb';
  const [showHint, setShowHint] = useState(true);
  const canvasRef = useRef<HTMLDivElement>(null);
  const interactionTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    interactionTimeoutRef.current = setTimeout(() => {
      setShowHint(false);
    }, 8000);

    return () => {
      if (interactionTimeoutRef.current) {
        clearTimeout(interactionTimeoutRef.current);
      }
    };
  }, []);

  const handleCanvasInteraction = () => {
    setShowHint(false);
    if (interactionTimeoutRef.current) {
      clearTimeout(interactionTimeoutRef.current);
    }
  };

  if (typeof window !== 'undefined') {
    try {
      useGLTF.preload(modelPath);
    } catch (e) {
    }
  }

  return (
    <div className="relative flex items-center justify-center w-full h-full">
      <div className="w-[500px] h-[450px] max-w-full max-h-[70vh] overflow-hidden relative" ref={canvasRef}>
        <Canvas
          shadows
          gl={{ antialias: true }}
          style={{ background: 'transparent', width: '100%', height: '100%' }}
          camera={{ position: [-4, 0.3, 2.5], fov: 45 }}
          onPointerDown={handleCanvasInteraction}
          onPointerMove={handleCanvasInteraction}
          onWheel={handleCanvasInteraction}
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

        {metrics && metrics.length === 3 && (
          <>            
            <RotatingMetric 
              label={metrics[0].label} 
              value={metrics[0].value} 
              position={[2.5, 0.5, 0]} 
              rotationSpeed={0.3}
              angleOffset={0}
            />
            <RotatingMetric 
              label={metrics[1].label} 
              value={metrics[1].value} 
              position={[2.5, 0.5, 0]} 
              rotationSpeed={0.3}
              angleOffset={(Math.PI * 2) / 3}
            />
            <RotatingMetric 
              label={metrics[2].label} 
              value={metrics[2].value} 
              position={[2.5, 0.5, 0]} 
              rotationSpeed={0.3}
              angleOffset={(Math.PI * 4) / 3}
            />
          </>
        )}
        
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

      {showHint && (
        <div 
          className={`absolute bottom-6 left-1/2 transform -translate-x-1/2 transition-all duration-500 ${
            showHint ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
        >
          <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 border border-purple-400/30 rounded-full backdrop-blur-md shadow-lg hover:shadow-xl transition-shadow duration-300">
            <svg 
              className="w-5 h-5 text-purple-400 animate-spin" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            
            <span className="text-sm font-medium text-transparent bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text whitespace-nowrap animate-pulse">
              Drag to explore →
            </span>
          </div>
        </div>
      )}
    </div>
  );
}