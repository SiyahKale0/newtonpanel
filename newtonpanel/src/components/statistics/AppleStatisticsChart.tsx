// src/components/statistics/AppleStatisticsChart.tsx
"use client"

import { useState, useEffect, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Line, Sphere, Text } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { AppleGameResult, Rom } from '@/types/firebase';
import * as THREE from 'three';
import { Loader2 } from 'lucide-react';

interface AppleStatisticsChartProps {
    gameResult: AppleGameResult;
    romData: Rom | null;
}

// String koordinatı vektöre çevir
const parseCoords = (coordStr: string): THREE.Vector3 => {
    const [x, y, z] = coordStr.replace(/[()]/g, '').split(', ').map(Number);
    return new THREE.Vector3(x, y, z);
};

export function AppleStatisticsChart({ romData }: AppleStatisticsChartProps) {
    const [trajectories, setTrajectories] = useState<{ toApple: THREE.Vector3[]; toBasket: THREE.Vector3[]; }[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Bileşen yüklendiğinde JSON verisini fetch ile çek
    useEffect(() => {
        const fetchLogData = async () => {
            setIsLoading(true);
            try {
                // public klasöründeki dosyaya doğrudan fetch atıyoruz
                const response = await fetch('/position_log.json');
                if (!response.ok) {
                    throw new Error('Pozisyon verisi yüklenemedi.');
                }
                const data = await response.json();

                const parsedData = data.map((log: any) => ({
                    toApple: log.to_apple.map(parseCoords),
                    toBasket: log.to_basket.map(parseCoords),
                }));
                setTrajectories(parsedData);

            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLogData();
    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="w-8 h-8 animate-spin" />
                <p className="ml-2">Grafik verisi yükleniyor...</p>
            </div>
        );
    }

    if (trajectories.length === 0) {
        return <p className="text-muted-foreground">Grafik için pozisyon verisi bulunamadı.</p>
    }

    return (
        <div className="grid grid-cols-3 gap-4 h-full">
            <div className="col-span-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <Canvas camera={{ position: [0, 2, 4], fov: 50 }}>
                    <ambientLight intensity={0.8} />
                    <directionalLight position={[5, 5, 5]} intensity={1} />
                    <gridHelper args={[10, 10]} />

                    {/* Örnek bir elma ve sepet pozisyonu */}
                    <Sphere position={trajectories[0].toApple.slice(-1)[0]} args={[0.05]}>
                        <meshStandardMaterial color="red" />
                    </Sphere>
                    <Text position={trajectories[0].toApple.slice(-1)[0]} fontSize={0.1} color="black" anchorY="bottom">Elma</Text>
                    <Sphere position={trajectories[0].toBasket.slice(-1)[0]} args={[0.05]}>
                        <meshStandardMaterial color="green" />
                    </Sphere>
                    <Text position={trajectories[0].toBasket.slice(-1)[0]} fontSize={0.1} color="black" anchorY="bottom">Sepet</Text>

                    {/* Hareket yollarını çiz */}
                    {trajectories.map((traj, index) => (
                        <group key={index}>
                            <Line points={traj.toApple} color="blue" lineWidth={2} />
                            <Line points={traj.toBasket} color="orange" lineWidth={2} />
                        </group>
                    ))}

                    <OrbitControls />
                </Canvas>
            </div>
            <div className="col-span-1">
                <Card>
                    <CardHeader><CardTitle>Kol ROM Ölçümleri</CardTitle></CardHeader>
                    <CardContent>
                        {romData ? (
                            <ul className="text-sm space-y-2">
                                <li><strong>Sol Kol Menzili:</strong> {romData.arm.leftSpace} cm</li>
                                <li><strong>Sağ Kol Menzili:</strong> {romData.arm.rightSpace} cm</li>
                            </ul>
                        ) : (
                            <p className="text-muted-foreground">Bu seans için ROM verisi bulunamadı.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}