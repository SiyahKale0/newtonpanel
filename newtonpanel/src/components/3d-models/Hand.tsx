// src/components/3d-models/Hand.tsx
import * as React from 'react';
import { RoundedBox, Sphere, Text } from "@react-three/drei";
import { Finger } from './Finger';
import { skinMaterial } from './materials';
import * as THREE from 'three'; // THREE'yi import et

// --- TİP TANIMLAMALARI ---
interface FingerSegment {
    pos: [number, number, number];
    rot: [number, number, number];
    args: [number, number, number];
}

interface FingerDefinition {
    basePos: [number, number, number];
    baseRot: [number, number, number];
    segments: FingerSegment[];
}

// --- HandProps GÜNCELLEMESİ ---
interface HandProps extends React.ComponentPropsWithoutRef<'group'> {
    isRightHand?: boolean;
    selectedFingers: string[];
    onFingerClick: (name: string) => void;
    // YENİ PROP EKLENDİ
    fingerColors?: { [key: string]: THREE.Color | string };
}

export function Hand({ isRightHand = false, selectedFingers, onFingerClick, fingerColors = {}, ...props }: HandProps) {
    const side = isRightHand ? 1 : -1;
    const handSideName = isRightHand ? 'Sağ' : 'Sol';

    const fingerDefinitions: Record<string, FingerDefinition> = {
        "Başparmak": { basePos: [-0.5 * side, 0.1, 0.1], baseRot: [0, 0, 0.9 * side], segments: [{ pos: [0, 0.2, 0], rot: [0, 0, 0], args: [0.2, 0.4, 0.2] }, { pos: [0, 0.45, 0], rot: [0, 0, 0.2 * side], args: [0.18, 0.3, 0.18] }] },
        "İşaret Parmağı": { basePos: [-0.25 * side, 0.6, 0], baseRot: [0, 0, 0.05 * side], segments: [{ pos: [0, 0, 0], rot: [0, 0, 0], args: [0.2, 0.4, 0.2] }, { pos: [0, 0.3, 0], rot: [0, 0, 0], args: [0.18, 0.35, 0.18] }, { pos: [0, 0.57, 0], rot: [0, 0, 0], args: [0.16, 0.25, 0.16] }] },
        "Orta Parmak": { basePos: [0.05 * side, 0.65, 0], baseRot: [0, 0, 0], segments: [{ pos: [0, 0, 0], rot: [0, 0, 0], args: [0.2, 0.45, 0.2] }, { pos: [0, 0.35, 0], rot: [0, 0, 0], args: [0.18, 0.4, 0.18] }, { pos: [0, 0.67, 0], rot: [0, 0, 0], args: [0.16, 0.3, 0.16] }] },
        "Yüzük Parmağı": { basePos: [0.35 * side, 0.6, 0], baseRot: [0, 0, -0.05 * side], segments: [{ pos: [0, 0, 0], rot: [0, 0, 0], args: [0.2, 0.4, 0.2] }, { pos: [0, 0.3, 0], rot: [0, 0, 0], args: [0.18, 0.35, 0.18] }, { pos: [0, 0.57, 0], rot: [0, 0, 0], args: [0.16, 0.25, 0.16] }] },
        "Serçe Parmağı": { basePos: [0.6 * side, 0.5, 0], baseRot: [0, 0, -0.15 * side], segments: [{ pos: [0, 0, 0], rot: [0, 0, 0], args: [0.18, 0.3, 0.18] }, { pos: [0, 0.22, 0], rot: [0, 0, 0], args: [0.16, 0.25, 0.16] }, { pos: [0, 0.42, 0], rot: [0, 0, 0], args: [0.14, 0.2, 0.14] }] }
    };

    return (
        <group {...props}>
            <group position={[0, -0.2, 0]} rotation={[-0.1, 0, 0]}>
                <RoundedBox args={[1, 1.2, 0.3]} radius={0.15} material={skinMaterial} receiveShadow castShadow />
                <Sphere args={[0.3, 16, 16]} position={[0, -0.4, -0.1]} material={skinMaterial} receiveShadow castShadow/>
            </group>

            {Object.entries(fingerDefinitions).map(([name, data]) => {
                const fullName = `${handSideName} ${name}`;
                return (
                    <group key={fullName} position={data.basePos} rotation={data.baseRot}>
                        <Finger
                            name={fullName}
                            segments={data.segments}
                            selected={selectedFingers.includes(fullName)}
                            onClick={onFingerClick}
                            // YENİ RENK PROP'U BURADAN GÖNDERİLİYOR
                            color={fingerColors[fullName]}
                        />
                    </group>
                )
            })}
            <Text position={[0, -1.2, 0]} fontSize={0.3} color="#444" anchorX="center">{handSideName} El</Text>
        </group>
    )
}