// src/components/scene/Apple.tsx
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

interface AppleProps {
    position: [number, number, number];
    onClick: () => void;
    isSelected: boolean;
}

export function Apple({ position, onClick, isSelected }: AppleProps) {
    const meshRef = useRef<Mesh>(null!);

    // Tatlı bir animasyon efekti
    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.position.y = position[1] + Math.sin(state.clock.getElapsedTime() * 2) * 0.05;
        }
    });

    return (
        // @ts-ignore
        <mesh ref={meshRef} position={position} onClick={(e) => { e.stopPropagation(); onClick(); }} scale={0.25}>
            <sphereGeometry args={[1, 32, 32]} />
            <meshStandardMaterial color={isSelected ? 'yellow' : 'red'} emissive={isSelected ? 'yellow' : 'black'} emissiveIntensity={isSelected ? 0.5 : 0} />
        </mesh>
    );
}