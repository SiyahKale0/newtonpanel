// src/components/statistics/PianoStatistics.tsx
"use client"

import { useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Hand } from '../3d-models/Hand';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { FingerDanceResult, Rom } from '@/types/firebase';
import * as THREE from 'three';

// --- Helper Constants ---
const FINGER_MAP: { [key: number]: string } = {
    0: 'Serçe Parmağı', 1: 'Yüzük Parmağı', 2: 'Orta Parmak', 3: 'İşaret Parmağı', 4: 'Başparmak',
    5: 'Başparmak', 6: 'İşaret Parmağı', 7: 'Orta Parmak', 8: 'Yüzük Parmağı', 9: 'Serçe Parmağı'
};

const FINGER_ORDER = ["Başparmak", "İşaret Parmağı", "Orta Parmak", "Yüzük Parmağı", "Serçe Parmağı"];

// --- Component Definition ---
export function PianoStatistics({ gameResult, romData }: { gameResult: FingerDanceResult, romData: Rom | null }) {

    const [selectedFinger, setSelectedFinger] = useState<string | null>(null);

    // Her parmak için kullanım istatistiklerini (doğru vuruş, toplam) hesapla
    const fingerUsage = useMemo(() => {
        const usage: { [key: string]: { hits: number; total: number } } = {};
        FINGER_ORDER.forEach(finger => {
            usage[`Sağ ${finger}`] = { hits: 0, total: 0 };
            usage[`Sol ${finger}`] = { hits: 0, total: 0 };
        });

        gameResult.notes?.forEach(note => {
            const fingerName = FINGER_MAP[note.finger];
            if (fingerName) {
                // YENİ: Artık gelen verideki el bilgisine göre işlem yapılıyor
                const handSide = note.finger < 5 ? 'Sol' : 'Sağ';
                const fullName = `${handSide} ${fingerName}`;
                if (usage[fullName]) {
                    usage[fullName].total++;
                    if (note.hit) {
                        usage[fullName].hits++;
                    }
                }
            }
        });
        return usage;
    }, [gameResult]);

    const maxUsage = useMemo(() => Math.max(...Object.values(fingerUsage).map(u => u.total), 1), [fingerUsage]);

    const selectedFingerRom = useMemo(() => {
        if (!selectedFinger || !romData?.finger) return null;
        const parts = selectedFinger.split(' ');
        const side = parts[0];
        const fingerName = parts.slice(1).join(' ');
        const fingerIndex = FINGER_ORDER.indexOf(fingerName);
        if (fingerIndex === -1) return null;
        // Firebase'deki yeni ROM yapısına göre veriyi çek
        const romArray = side === 'Sağ' ? romData.finger.rightFingers : romData.finger.leftFingers;
        return romArray?.[fingerIndex] || null;
    }, [selectedFinger, romData]);

    const getFingerColor = (fingerName: string) => {
        const usage = fingerUsage[fingerName];
        if (!usage || usage.total === 0) return new THREE.Color("#dc2626");
        const ratio = usage.total / maxUsage;
        return new THREE.Color().setHSL(0.6 - (ratio * 0.6), 0.9, 0.6);
    };

    const selectedFingerData = selectedFinger ? fingerUsage[selectedFinger] : null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
            <div className="md:col-span-2 bg-gray-100 dark:bg-gray-900/50 rounded-lg h-full min-h-[400px]">
                <Canvas camera={{ position: [0, 1.5, 6], fov: 50 }} shadows>
                    <ambientLight intensity={1.2} />
                    <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={2} />
                    <Hand
                        position={[-1.2, 0, 0]}
                        isRightHand={false}
                        selectedFingers={selectedFinger ? [selectedFinger] : []}
                        onFingerClick={(name) => setSelectedFinger(name)}
                        fingerColors={Object.fromEntries(FINGER_ORDER.map(f => [`Sol ${f}`, getFingerColor(`Sol ${f}`)]))}
                    />
                    <Hand
                        position={[1.2, 0, 0]}
                        isRightHand={true}
                        selectedFingers={selectedFinger ? [selectedFinger] : []}
                        onFingerClick={(name) => setSelectedFinger(name)}
                        fingerColors={Object.fromEntries(FINGER_ORDER.map(f => [`Sağ ${f}`, getFingerColor(`Sağ ${f}`)]))}
                    />
                    <OrbitControls minPolarAngle={Math.PI / 4} maxPolarAngle={3 * Math.PI / 4} minDistance={3} maxDistance={10}/>
                </Canvas>
            </div>
            <div className="md:col-span-1">
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle>Parmak İstatistikleri</CardTitle>
                        <CardDescription>
                            {selectedFinger ? `"${selectedFinger}" için detaylar:` : "Detayları görmek için modelden bir parmak seçin."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {selectedFinger && selectedFingerData ? (
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold text-primary">Tuşlama İstatistikleri</h4>
                                    <ul className="mt-2 text-sm space-y-2">
                                        <li><strong>Doğru Tuşlama:</strong> {selectedFingerData.hits}</li>
                                        <li><strong>Hatalı Tuşlama:</strong> {selectedFingerData.total - selectedFingerData.hits}</li>
                                        <li className="font-bold pt-1">Başarı: {((selectedFingerData.hits / selectedFingerData.total) * 100 || 0).toFixed(0)}%</li>
                                    </ul>
                                </div>
                                <div className="border-t pt-4">
                                    <h4 className="font-semibold text-primary">ROM Bilgisi</h4>
                                    {selectedFingerRom ? (
                                        <ul className="mt-2 text-sm space-y-2">
                                            <li><strong>Minimum ROM:</strong> {selectedFingerRom.min.toFixed(2)}</li>
                                            <li><strong>Maksimum ROM:</strong> {selectedFingerRom.max.toFixed(2)}</li>
                                        </ul>
                                    ) : (
                                        <p className="text-muted-foreground text-sm mt-2">Bu parmak için ROM verisi bulunamadı.</p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            selectedFinger && <p className="text-muted-foreground mt-2">Bu parmak için tuşlama verisi bulunamadı.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
