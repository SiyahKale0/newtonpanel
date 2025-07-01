// src/components/3d-models/Finger.tsx
import * as React from 'react';
import { RoundedBox } from "@react-three/drei";
import { selectedMaterial, skinMaterial } from './materials';

interface FingerProps {
    segments: { pos: [number, number, number]; rot: [number, number, number]; args: [number, number, number] }[];
    name: string;
    selected: boolean;
    onClick: (name: string) => void;
}

export function Finger({ segments, name, selected, onClick }: FingerProps) {
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
                        material={selected ? selectedMaterial : skinMaterial}
                        castShadow
                    />
                </group>
            ))}
        </group>
    );
}