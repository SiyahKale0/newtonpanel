// src/components/finger-selection.tsx
"use client"

import * as React from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card"
import { Button } from "./ui/button"
import { CheckSquare, Square } from "lucide-react"
import { Hand } from "./3d-models/Hand"

const ALL_FINGER_NAMES = [
    "Sol Başparmak", "Sol İşaret Parmağı", "Sol Orta Parmak", "Sol Yüzük Parmağı", "Sol Serçe Parmağı",
    "Sağ Başparmak", "Sağ İşaret Parmağı", "Sağ Orta Parmak", "Sağ Yüzük Parmağı", "Sağ Serçe Parmağı"
];

const FINGER_ORDER = ["Başparmak", "İşaret Parmağı", "Orta Parmak", "Yüzük Parmağı", "Serçe Parmağı"];

export function FingerSelection() {
    const [selectedFingers, setSelectedFingers] = React.useState<string[]>([]);

    const toggleFinger = React.useCallback((fingerName: string) => {
        setSelectedFingers((prev) =>
            prev.includes(fingerName) ? prev.filter((name) => name !== fingerName) : [...prev, fingerName]
        );
    }, []);

    const selectAll = () => setSelectedFingers(ALL_FINGER_NAMES);
    const deselectAll = () => setSelectedFingers([]);

    const sortedSelectedFingers = React.useMemo(() => {
        return [...selectedFingers].sort((a, b) => {
            if (a.startsWith('Sol') && b.startsWith('Sağ')) return -1;
            if (a.startsWith('Sağ') && b.startsWith('Sol')) return 1;
            const nameA = a.split(' ')[1] + " " + (a.split(' ')[2] || "");
            const nameB = b.split(' ')[1] + " " + (b.split(' ')[2] || "");
            return FINGER_ORDER.indexOf(nameA.trim()) - FINGER_ORDER.indexOf(nameB.trim());
        });
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
                    <Canvas camera={{ position: [0, 1, 6], fov: 50 }} shadows>
                        <ambientLight intensity={1.5} />
                        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
                        <hemisphereLight intensity={0.5} groundColor="gray" />

                        <Hand position={[-1.2, 0, 0]} isRightHand={false} selectedFingers={selectedFingers} onFingerClick={toggleFinger} />
                        <Hand position={[1.2, 0, 0]} isRightHand={true} selectedFingers={selectedFingers} onFingerClick={toggleFinger} />

                        <OrbitControls minPolarAngle={Math.PI / 4} maxPolarAngle={3 * Math.PI / 4} minDistance={3} maxDistance={10}/>
                    </Canvas>
                </div>
                <div className="flex flex-col items-center justify-between gap-4 rounded-lg border p-4 sm:flex-row">
                    <div className="flex-1">
                        <h4 className="font-semibold">Seçilen Parmaklar ({selectedFingers.length})</h4>
                        <p className="text-sm text-muted-foreground min-h-[40px] sm:min-h-0">
                            {sortedSelectedFingers.length > 0 ? sortedSelectedFingers.join(", ") : "Henüz parmak seçilmedi."}
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