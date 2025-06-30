// src/components/finger-selection.tsx

"use client"

import * as React from "react"
import { Canvas, useThree } from "@react-three/fiber"
import { OrbitControls, Text, Box } from "@react-three/drei"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card"
import { Button } from "./ui/button"
import { CheckSquare, Square } from "lucide-react"

// Parmak için basit bir model
function Finger({ position, name, selected, onClick }: any) {
    return (
        <Box
            args={[0.3, 1, 0.3]} // Parmak boyutları
            position={position}
            onClick={() => onClick(name)}
        >
            <meshStandardMaterial color={selected ? "tomato" : "grey"} />
        </Box>
    )
}

// El modeli
function Hand({ position, isRightHand = false, selectedFingers, onFingerClick }: any) {
    const fingerPositions = [
        { name: 'thumb', pos: [-0.6, 0, 0] },
        { name: 'index', pos: [-0.2, 0, 0] },
        { name: 'middle', pos: [0.2, 0, 0] },
        { name: 'ring', pos: [0.6, 0, 0] },
        { name: 'pinky', pos: [1.0, 0, 0] }
    ];

    return (
        <group position={position}>
            {/* Elin avuç içi */}
            <Box args={[2.5, 0.2, 1.5]} position={[0.2, -0.6, 0]}>
                <meshStandardMaterial color="burlywood" />
            </Box>
            {/* Parmaklar */}
            {fingerPositions.map(finger => (
                <Finger
                    key={finger.name}
                    name={`${isRightHand ? 'right' : 'left'}-${finger.name}`}
                    position={finger.pos}
                    selected={selectedFingers.includes(`${isRightHand ? 'right' : 'left'}-${finger.name}`)}
                    onClick={onFingerClick}
                />
            ))}
        </group>
    )
}


export function FingerSelection() {
    const [selectedFingers, setSelectedFingers] = React.useState<string[]>([]);

    const toggleFinger = (name: string) => {
        setSelectedFingers(prev =>
            prev.includes(name) ? prev.filter(f => f !== name) : [...prev, name]
        );
    };

    const selectAll = () => {
        const allFingers = [
            'left-thumb', 'left-index', 'left-middle', 'left-ring', 'left-pinky',
            'right-thumb', 'right-index', 'right-middle', 'right-ring', 'right-pinky'
        ];
        setSelectedFingers(allFingers);
    };

    const deselectAll = () => {
        setSelectedFingers([]);
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Parmak Seçimi</CardTitle>
                <CardDescription>Ölçüm yapılacak parmakları 3D model üzerinden seçin.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="h-[400px] w-full rounded-lg bg-gray-100 dark:bg-gray-800">
                    <Canvas camera={{ position: [0, 5, 5], fov: 50 }}>
                        <ambientLight intensity={1.5} />
                        <directionalLight position={[5, 10, 7.5]} />

                        <Text position={[0, 2.5, 0]} fontSize={0.5} color="black">Parmak Seçimi</Text>

                        {/* Sol El */}
                        <Hand
                            position={[-2, 0, 0]}
                            isRightHand={false}
                            selectedFingers={selectedFingers}
                            onFingerClick={toggleFinger}
                        />

                        {/* Sağ El */}
                        <Hand
                            position={[2, 0, 0]}
                            isRightHand={true}
                            selectedFingers={selectedFingers}
                            onFingerClick={toggleFinger}
                        />

                        <OrbitControls />
                    </Canvas>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                        <h4 className="font-semibold">Seçilen Parmaklar</h4>
                        <p className="text-sm text-muted-foreground">{selectedFingers.length > 0 ? selectedFingers.join(', ') : 'Henüz parmak seçilmedi.'}</p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={deselectAll}><Square className="mr-2 h-4 w-4" />Tümünü Kaldır</Button>
                        <Button onClick={selectAll}><CheckSquare className="mr-2 h-4 w-4" />Hepsini Seç</Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}