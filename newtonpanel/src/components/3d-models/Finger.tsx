// src/components/3d-models/Finger.tsx
import * as React from 'react';
import { RoundedBox } from "@react-three/drei";
import { selectedMaterial, skinMaterial } from './materials';
import * as THREE from 'three';

interface FingerProps {
    segments: { pos: [number, number, number]; rot: [number, number, number]; args: [number, number, number] }[];
    name: string;
    selected: boolean;
    onClick: (name: string) => void;
    color?: string; // New prop for custom color
}

export function Finger({ segments, name, selected, onClick, color }: FingerProps) {
    // Create custom material if color is provided
    const customMaterial = React.useMemo(() => {
        if (color) {
            return new THREE.MeshStandardMaterial({
                color: color,
                roughness: 0.6,
                metalness: 0.1,
            });
        }
        return null;
    }, [color]);

    const material = selected ? selectedMaterial : (customMaterial || skinMaterial);

    return (
        <group
            onClick={(e) => { e.stopPropagation(); onClick(name); }}
            onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer' }}
            onPointerOut={() => { document.body.style.cursor = 'auto' }}
        >
            {segments.map((seg, index) => (
                <group key={index} position={seg.pos} rotation={seg.rot}>
                    <RoundedBox
                        args={seg.args}
                        radius={0.04}
                        smoothness={4}
                        material={material}
                        castShadow
                    />
                </group>
            ))}
        </group>
    );
}