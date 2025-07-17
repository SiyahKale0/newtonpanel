// src/components/three-d-grid.tsx
"use client"

import React, { useMemo, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Grid, OrbitControls, DragControls, Sphere, Cylinder } from '@react-three/drei';
import * as THREE from 'three';
import type { SceneObject } from '@/types/firebase';

// Tek bir sürüklenebilir nesneyi temsil eden bileşen
const DraggableObject = React.memo(({ object }: { object: SceneObject }) => {
    const geometry = useMemo(() => {
        return object.type === 'apple'
            ? <Sphere args={[0.2, 32, 32]} />
            : <Cylinder args={[0.3, 0.4, 0.5, 16]} />; // Sepet için silindir
    }, [object.type]);

    const color = useMemo(() => {
        return object.type === 'apple' ? '#e74c3c' : '#8d6e63';
    }, [object.type]);

    return (
        <mesh position={object.position} castShadow userData={{ id: object.id }}>
            {geometry}
            <meshStandardMaterial color={color} />
        </mesh>
    );
});

DraggableObject.displayName = 'DraggableObject';

interface ThreeDGridProps {
    objects: SceneObject[];
    onObjectsChange: (objects: SceneObject[]) => void;
}

export function ThreeDGrid({ objects, onObjectsChange }: ThreeDGridProps) {
    const controlsRef = useRef<any>(null!);

    // Sürükleme bittiğinde tetiklenir ve nesnelerin son konumlarını kaydeder
    const handleDragEnd = () => {
        const controlledObjects = controlsRef.current?.objects;
        if (!controlledObjects) return;

        const positionMap = new Map<string, THREE.Vector3>();
        controlledObjects.forEach((obj: THREE.Mesh) => {
            if (obj.userData.id) {
                positionMap.set(obj.userData.id, obj.position.clone());
            }
        });

        const updatedObjects = objects.map(obj => {
            const newPos = positionMap.get(obj.id);
            if (newPos) {
                // Nesnelerin zeminin altına gitmesini engelle
                const y = Math.max(newPos.y, 0.1);
                return { ...obj, position: [newPos.x, y, newPos.z] as [number, number, number] };
            }
            return obj;
        });

        // Sadece bir değişiklik varsa durumu güncelle
        if (JSON.stringify(objects) !== JSON.stringify(updatedObjects)) {
            onObjectsChange(updatedObjects);
        }
    };

    // Nesneler değiştiğinde render edilecek elemanları hafızada tut
    const draggableItems = useMemo(() =>
        objects.map((obj) => <DraggableObject key={obj.id} object={obj} />),
    [objects]);

    return (
        <Canvas shadows camera={{ position: [-5, 5, 5], fov: 35 }}>
            <ambientLight intensity={1.2} />
            <directionalLight
                castShadow
                position={[10, 10, 5]}
                intensity={1.5}
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
            />
            {/* Gölgelerin düşeceği zemin */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
                <planeGeometry args={[100, 100]} />
                <shadowMaterial opacity={0.3} />
            </mesh>
            <Grid
                position={[0, 0.01, 0]}
                args={[10.5, 10.5]}
                cellColor="#999"
                sectionColor="#444"
                fadeDistance={30}
                infiniteGrid
            />
            {/* Sürüklenebilir nesneleri kontrol eden bileşen */}
            <DragControls ref={controlsRef} onDragEnd={handleDragEnd} autoTransform={true}>
                {draggableItems}
            </DragControls>
            {/* Kamera kontrolleri */}
            <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2.5} />
        </Canvas>
    );
}