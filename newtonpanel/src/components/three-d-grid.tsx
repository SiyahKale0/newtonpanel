// src/components/three-d-grid.tsx
"use client"

import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
// DÜZELTME: DragControls kaldırıldı.
import { Grid, OrbitControls, Sphere, Cylinder } from '@react-three/drei';
import * as THREE from 'three';
import type { SceneObject } from '@/types/firebase';

const GRID_SIZE = { x: 8, y: 5, z: 5 };
const CELL_SIZE = 1; // Her bir grid hücresinin boyutu

// Nesneleri temsil eden bileşen (Sürükleme kaldırıldı)
const StaticObject = React.memo(({ object }: { object: SceneObject }) => {
    // Nesne tipine göre geometri ve renk seçimi
    const { geometry, color } = useMemo(() => {
        switch (object.type) {
            case 'apple_fresh':
                return { geometry: <Sphere args={[0.2, 32, 32]} />, color: '#FF0000' }; // Sağlam Elma (Canlı Kırmızı)
            case 'apple_rotten':
                return { geometry: <Sphere args={[0.2, 32, 32]} />, color: '#9400D3' }; // Çürük Elma (Koyu Mor)
            case 'basket':
                return { geometry: <Cylinder args={[0.3, 0.4, 0.5, 16]} />, color: '#FFD700' }; // Sepet (Altın Sarısı)
            default:
                return { geometry: <Sphere args={[0.2, 32, 32]} />, color: 'grey' };
        }
    }, [object.type]);

    return (
        <mesh position={object.position} castShadow userData={{ id: object.id, type: object.type }}>
            {geometry}
            <meshStandardMaterial color={color} />
        </mesh>
    );
});
StaticObject.displayName = 'StaticObject';


interface ThreeDGridProps {
    objects: SceneObject[];
    // Sürükleme kaldırıldığı için onObjectsChange artık bu bileşende kullanılmıyor,
    // ama prop olarak kalabilir, ileride tıklama vb. için gerekebilir.
    onObjectsChange: (objects: SceneObject[]) => void;
}

// Grid sınırlarını ve kurallarını hesaplayan yardımcı fonksiyon
export const getClampedPosition = (position: THREE.Vector3 | [number, number, number], type: SceneObject['type']): [number, number, number] => {
    const pos = Array.isArray(position) ? new THREE.Vector3(...position) : position;

    // En yakın grid hücresinin merkezini bul
    const snappedX = Math.round(pos.x / CELL_SIZE) * CELL_SIZE;
    const snappedY = Math.round(pos.y / CELL_SIZE) * CELL_SIZE;
    const snappedZ = Math.round(pos.z / CELL_SIZE) * CELL_SIZE;

    // Grid sınırları içinde kalmasını sağla
    // X (8 birim): -4 ile 3 arası
    const clampedX = THREE.MathUtils.clamp(snappedX, -GRID_SIZE.x / 2, GRID_SIZE.x / 2 - 1);
    // Z (5 birim): -2 ile 2 arası
    const clampedZ = THREE.MathUtils.clamp(snappedZ, -Math.floor(GRID_SIZE.z / 2), Math.floor(GRID_SIZE.z / 2));
    // Y (5 birim): 0 ile 4 arası. Sepetler sadece zeminde (y=0) olabilir.
    const clampedY = type === 'basket'
        ? 0
        : THREE.MathUtils.clamp(snappedY, 0, GRID_SIZE.y - 1);

    return [clampedX, clampedY, clampedZ];
}


export function ThreeDGrid({ objects }: ThreeDGridProps) {
    // Sürükleme kaldırıldığı için handleDragEnd fonksiyonu ve ilgili hook'lar kaldırıldı.

    const sceneItems = useMemo(() =>
            objects.map((obj) => <StaticObject key={obj.id} object={obj} />),
        [objects]);

    return (
        <Canvas shadows camera={{ position: [-5, 8, 10], fov: 50 }}>
            <ambientLight intensity={1.2} />
            <directionalLight
                castShadow
                position={[10, 15, 5]}
                intensity={1.5}
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
            />
            {/* Eksenleri gösteren yardımcı. X: kırmızı, Y: yeşil, Z: mavi */}
            <axesHelper args={[Math.max(GRID_SIZE.x, GRID_SIZE.y, GRID_SIZE.z) / 2]} />

            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
                <planeGeometry args={[100, 100]} />
                <shadowMaterial opacity={0.3} />
            </mesh>
            <Grid
                position={[0, 0, 0]}
                args={[GRID_SIZE.x * CELL_SIZE, GRID_SIZE.z * CELL_SIZE]}
                cellSize={CELL_SIZE}
                cellColor="#999"
                sectionColor="#444"
                fadeDistance={40}
                infiniteGrid={false} // Grid'i sınırlı yap
            />
            {/* Sahnedeki nesneler */}
            {sceneItems}

            {/* Kamera kontrolleri hala aktif */}
            <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2.2} />
        </Canvas>
    );
}
