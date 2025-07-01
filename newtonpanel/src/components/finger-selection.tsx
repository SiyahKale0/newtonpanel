// src/components/finger-selection.tsx

"use client"

import * as React from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Text, RoundedBox, Sphere } from "@react-three/drei"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "./ui/card"
import { Button } from "./ui/button"
import { CheckSquare, Square } from "lucide-react"
import * as THREE from 'three';

// Malzeme ve Renk Tanımlamaları
const skinMaterial = new THREE.MeshStandardMaterial({
    color: "#e6bfab", // Doğal bir ten rengi
    roughness: 0.6,
    metalness: 0.1,
});

const selectedMaterial = new THREE.MeshStandardMaterial({
    color: "#ff6347", // Seçim rengi (Domates Rengi)
    roughness: 0.5,
    metalness: 0.1,
    emissive: "#300000" // Seçiliyken hafif bir ışıma
});


// Her parmağı, boğumları olan daha gerçekçi bir yapı olarak tasarlıyoruz.
function Finger({ basePosition, segments, rotation, name, selected, onClick }: any) {
    return (
        <group
            position={basePosition}
            rotation={rotation}
            onClick={(e) => { e.stopPropagation(); onClick(name); }}
            onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer' }}
            onPointerOut={() => { document.body.style.cursor = 'auto' }}
        >
            {segments.map((seg: any, index: number) => (
                <group key={index} position={seg.pos} rotation={seg.rot}>
                    <RoundedBox args={seg.args} radius={0.04} smoothness={4} material={selected ? selectedMaterial : skinMaterial} castShadow />
                </group>
            ))}
        </group>
    )
}

// Nihai El Mo
function Hand({ position, isRightHand = false, selectedFingers, onFingerClick }: any) {
    const side = isRightHand ? 1 : -1;
    const handSideName = isRightHand ? 'Sağ' : 'Sol';

    const fingerDefinitions = {
        "Başparmak": {
            basePos: [-0.5 * side, 0.1, 0.1],
            baseRot: [0, 0, 0.9 * side],
            segments: [
                { pos: [0, 0.2, 0], rot: [0, 0, 0], args: [0.2, 0.4, 0.2] },
                { pos: [0, 0.45, 0], rot: [0, 0, 0.2 * side], args: [0.18, 0.3, 0.18] },
            ],
        },
        "İşaret Parmağı": {
            basePos: [-0.25 * side, 0.6, 0],
            baseRot: [0, 0, 0.05 * side],
            segments: [
                { pos: [0, 0, 0], rot: [0, 0, 0], args: [0.2, 0.4, 0.2] },
                { pos: [0, 0.3, 0], rot: [0, 0, 0], args: [0.18, 0.35, 0.18] },
                { pos: [0, 0.57, 0], rot: [0, 0, 0], args: [0.16, 0.25, 0.16] },
            ],
        },
        "Orta Parmak": {
            basePos: [0.05 * side, 0.65, 0],
            baseRot: [0, 0, 0],
            segments: [
                { pos: [0, 0, 0], rot: [0, 0, 0], args: [0.2, 0.45, 0.2] },
                { pos: [0, 0.35, 0], rot: [0, 0, 0], args: [0.18, 0.4, 0.18] },
                { pos: [0, 0.67, 0], rot: [0, 0, 0], args: [0.16, 0.3, 0.16] },
            ],
        },
        "Yüzük Parmağı": {
            basePos: [0.35 * side, 0.6, 0],
            baseRot: [0, 0, -0.05 * side],
            segments: [
                { pos: [0, 0, 0], rot: [0, 0, 0], args: [0.2, 0.4, 0.2] },
                { pos: [0, 0.3, 0], rot: [0, 0, 0], args: [0.18, 0.35, 0.18] },
                { pos: [0, 0.57, 0], rot: [0, 0, 0], args: [0.16, 0.25, 0.16] },
            ],
        },
        "Serçe Parmağı": {
            basePos: [0.6 * side, 0.5, 0],
            baseRot: [0, 0, -0.15 * side],
            segments: [
                { pos: [0, 0, 0], rot: [0, 0, 0], args: [0.18, 0.3, 0.18] },
                { pos: [0, 0.22, 0], rot: [0, 0, 0], args: [0.16, 0.25, 0.16] },
                { pos: [0, 0.42, 0], rot: [0, 0, 0], args: [0.14, 0.2, 0.14] },
            ],
        }
    };


    return (
        <group position={position}>
            {/* Avuç içi */}
            <group position={[0, -0.2, 0]} rotation={[-0.1, 0, 0]}>
                <RoundedBox args={[1, 1.2, 0.3]} radius={0.15} material={skinMaterial} receiveShadow castShadow />
                <Sphere args={[0.3, 16, 16]} position={[0, -0.4, -0.1]} material={skinMaterial} receiveShadow castShadow/>
            </group>

            {/* Parmaklar */}
            {Object.entries(fingerDefinitions).map(([name, data]) => {
                const fullName = `${handSideName} ${name}`;
                return (
                    <Finger
                        key={fullName}
                        name={fullName}
                        basePosition={data.basePos}
                        rotation={data.baseRot}
                        segments={data.segments}
                        selected={selectedFingers.includes(fullName)}
                        onClick={onFingerClick}
                    />
                )
            })}
            <Text position={[0, -1.2, 0]} fontSize={0.3} color="#444">{handSideName} El</Text>
        </group>
    )
}

export function FingerSelection() {
    const [selectedFingers, setSelectedFingers] = React.useState<string[]>([])

    const toggleFinger = (fingerName: string) => {
        setSelectedFingers((prev) =>
            prev.includes(fingerName) ? prev.filter((name) => name !== fingerName) : [...prev, fingerName]
        )
    }

    const selectAll = () => {
        const allFingerNames = [
            "Sol Başparmak", "Sol İşaret Parmağı", "Sol Orta Parmak", "Sol Yüzük Parmağı", "Sol Serçe Parmağı",
            "Sağ Başparmak", "Sağ İşaret Parmağı", "Sağ Orta Parmak", "Sağ Yüzük Parmağı", "Sağ Serçe Parmağı"
        ]
        setSelectedFingers(allFingerNames);
    };

    const deselectAll = () => {
        setSelectedFingers([]);
    };

    const sortedSelectedFingers = React.useMemo(() => {
        return [...selectedFingers].sort((a, b) => {
            const order = ["Başparmak", "İşaret Parmağı", "Orta Parmak", "Yüzük Parmağı", "Serçe Parmağı"];
            if (a.startsWith('Sol') && b.startsWith('Sağ')) return -1;
            if (a.startsWith('Sağ') && b.startsWith('Sol')) return 1;
            const nameA = a.split(' ')[1];
            const nameB = b.split(' ')[1];
            return order.indexOf(nameA) - order.indexOf(nameB);
        })
    }, [selectedFingers]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Parmak Seçimi</CardTitle>
                <CardDescription>
                    Ölçüm yapılacak parmakları 3D model üzerinden seçin. Modeli
                    sürükleyerek döndürebilirsiniz.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="h-[450px] w-full rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
                    <Canvas camera={{ position: [0, 1.5, 5], fov: 60 }} shadows>
                        <ambientLight intensity={1.5} />
                        <spotLight
                            position={[10, 10, 10]}
                            angle={0.15}
                            penumbra={1}
                            intensity={2}
                            castShadow
                            shadow-mapSize-width={2048}
                            shadow-mapSize-height={2048}
                        />
                        <hemisphereLight intensity={0.5} groundColor="gray" />

                        <Hand
                            position={[-1.2, 0, 0]}
                            isRightHand={false}
                            selectedFingers={selectedFingers}
                            onFingerClick={toggleFinger}
                        />

                        <Hand
                            position={[1.2, 0, 0]}
                            isRightHand={true}
                            selectedFingers={selectedFingers}
                            onFingerClick={toggleFinger}
                        />

                        <OrbitControls minPolarAngle={Math.PI / 4} maxPolarAngle={3 * Math.PI / 4} minDistance={3} maxDistance={8}/>
                    </Canvas>
                </div>
                <div className="flex flex-col items-center justify-between gap-4 rounded-lg border p-4 sm:flex-row">
                    <div className="flex-1">
                        <h4 className="font-semibold">Seçilen Parmaklar ({selectedFingers.length})</h4>
                        <p className="text-sm text-muted-foreground">
                            {sortedSelectedFingers.length > 0
                                ? sortedSelectedFingers.join(", ")
                                : "Henüz parmak seçilmedi."}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={deselectAll}>
                            <Square className="mr-2 h-4 w-4" />
                            Tümünü Kaldır
                        </Button>
                        <Button onClick={selectAll}>
                            <CheckSquare className="mr-2 h-4 w-4" />
                            Hepsini Seç
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}