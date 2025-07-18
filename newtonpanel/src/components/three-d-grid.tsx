// src/components/three-d-grid.tsx
"use client"

import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { Grid, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import type { SceneObject } from '@/types/firebase';

const GRID_SIZE = { x: 8, y: 5, z: 5 };
const CELL_SIZE = 1; // Her bir grid hücresinin boyutu

// Geometry args tipleri
type SphereArgs = [radius: number, widthSegments: number, heightSegments: number];
type CylinderArgs = [
  radiusTop: number,
  radiusBottom: number,
  height: number,
  radialSegments: number
];

// Nesneleri temsil eden bileşen
const StaticObject = React.memo(({ object }: { object: SceneObject }) => {
  const { geometryType, geometryArgs, colorHex } = useMemo(() => {
    switch (object.type) {
      case 'apple_fresh':
        return {
          geometryType: 'sphere',
          geometryArgs: [0.2, 32, 32] as SphereArgs,
          colorHex: '#ff0000',
        };
      case 'apple_rotten':
        return {
          geometryType: 'sphere',
          geometryArgs: [0.2, 32, 32] as SphereArgs,
          colorHex: '#9400d3',
        };
      case 'basket':
        return {
          geometryType: 'cylinder',
          geometryArgs: [0.3, 0.4, 0.5, 16] as CylinderArgs,
          colorHex: '#ffd700',
        };
      default:
        return {
          geometryType: 'sphere',
          geometryArgs: [0.2, 32, 32] as SphereArgs,
          colorHex: '#808080',
        };
    }
  }, [object.type]);

  return (
    <mesh position={object.position} castShadow userData={{ id: object.id, type: object.type }}>
      {geometryType === 'sphere' && <sphereGeometry args={geometryArgs} />}
      {geometryType === 'cylinder' && <cylinderGeometry args={geometryArgs} />}
      <meshStandardMaterial color={colorHex} />
    </mesh>
  );
});
StaticObject.displayName = 'StaticObject';

interface ThreeDGridProps {
  objects: SceneObject[];
  onObjectsChange: (objects: SceneObject[]) => void;
}

// Grid sınırlarını ve kurallarını hesaplayan yardımcı fonksiyon
export const getClampedPosition = (
  position: THREE.Vector3 | [number, number, number],
  type: SceneObject['type']
): [number, number, number] => {
  const pos = Array.isArray(position) ? new THREE.Vector3(...position) : position;

  const snappedX = Math.round(pos.x / CELL_SIZE) * CELL_SIZE;
  const snappedY = Math.round(pos.y / CELL_SIZE) * CELL_SIZE;
  const snappedZ = Math.round(pos.z / CELL_SIZE) * CELL_SIZE;

  const clampedX = THREE.MathUtils.clamp(snappedX, 0, GRID_SIZE.x - 1);
  const clampedZ = THREE.MathUtils.clamp(snappedZ, 0, GRID_SIZE.z - 1);
  const clampedY = type === 'basket'
    ? 0
    : THREE.MathUtils.clamp(snappedY, 0, GRID_SIZE.y - 1);

  return [clampedX, clampedY, clampedZ];
};

export function ThreeDGrid({ objects }: ThreeDGridProps) {
  const sceneItems = useMemo(
    () => objects.map((obj) => <StaticObject key={obj.id} object={obj} />),
    [objects]
  );

  return (
    <Canvas shadows camera={{ position: [10, 8, 10], fov: 50 }}>
      <ambientLight intensity={1.5} />
      <directionalLight
        castShadow
        position={[10, 15, 10]}
        intensity={2.0}
        color="#ffffff"
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <directionalLight
        position={[-10, 10, -10]}
        intensity={1.0}
        color="#ffffff"
      />
      <pointLight position={[5, 5, 5]} intensity={1.0} color="#ffffff" />
      <pointLight position={[-5, 5, -5]} intensity={0.8} color="#ffffff" />
      <pointLight position={[0, 10, 0]} intensity={0.5} color="#ffffff" />

      <axesHelper args={[Math.max(GRID_SIZE.x, GRID_SIZE.y, GRID_SIZE.z) / 2]} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[GRID_SIZE.x / 2 - 0.5, -0.01, GRID_SIZE.z / 2 - 0.5]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <shadowMaterial opacity={0.3} />
      </mesh>

      <Grid
        position={[GRID_SIZE.x / 2 - 0.5, 0, GRID_SIZE.z / 2 - 0.5]}
        args={[GRID_SIZE.x * CELL_SIZE, GRID_SIZE.z * CELL_SIZE]}
        cellSize={CELL_SIZE}
        cellColor="#999"
        sectionColor="#444"
        fadeDistance={40}
        infiniteGrid={false}
      />

      {sceneItems}

      <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2.2} />
    </Canvas>
  );
}
