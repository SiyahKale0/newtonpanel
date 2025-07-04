// src/components/3d-models/Finger.tsx
"use client"

import * as React from 'react';
import { RoundedBox } from "@react-three/drei";
import { selectedMaterial, skinMaterial } from './materials';
import * as THREE from 'three';

interface FingerProps {
    segments: { pos: [number, number, number]; rot: [number, number, number]; args: [number, number, number] }[];
    name: string;
    selected: boolean;
    onClick: (name: string) => void;
    color?: THREE.Color | string;
}

export function Finger({ segments, name, selected, color, onClick }: FingerProps) {
    // Renge karar veriyoruz. Öncelik sırası:
    // 1. Dışarıdan gelen özel renk (ısı haritası için)
    // 2. Seçim rengi (kullanıcı tıkladığında)
    // 3. Varsayılan ten rengi
    const finalColor = color ? color : (selected ? selectedMaterial.color : skinMaterial.color);

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
                        castShadow
                    >
                        {/* Materyali ve rengini doğrudan burada, deklaratif olarak ayarlıyoruz. */}
                        <meshStandardMaterial
                            color={finalColor}
                            roughness={0.6}
                            metalness={0.1}
                        />
                    </RoundedBox>
                </group>
            ))}
        </group>
    );
}