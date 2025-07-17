// src/components/scene/Basket.tsx
import React from 'react';

interface BasketProps {
    position: [number, number, number];
    onClick: () => void;
    isSelected: boolean;
}

export function Basket({ position, onClick, isSelected }: BasketProps) {
    return (
        // @ts-ignore
        <mesh position={position} onClick={(e) => { e.stopPropagation(); onClick(); }} scale={[0.6, 0.4, 0.6]}>
            <cylinderGeometry args={[1, 1, 1, 16]} />
            <meshStandardMaterial color={isSelected ? 'yellow' : '#8B4513'} emissive={isSelected ? 'yellow' : 'black'} emissiveIntensity={isSelected ? 0.5 : 0} />
        </mesh>
    );
}