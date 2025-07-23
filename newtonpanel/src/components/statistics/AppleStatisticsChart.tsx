// src/components/statistics/AppleStatisticsChart.tsx
"use client"

import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Line, Sphere, Text } from '@react-three/drei';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { AppleGameResult, Rom, Trajectory, Vector3Data } from '@/types/firebase';
import * as THREE from 'three';

interface AppleStatisticsChartProps {
    gameResult: AppleGameResult;
    romData: Rom | null;
}

// Veri yapımızdan THREE.Vector3'e dönüştüren yardımcı fonksiyon
const toVector3 = (v: Vector3Data) => new THREE.Vector3(v.x, v.y, v.z);

export function AppleStatisticsChart({ gameResult, romData }: AppleStatisticsChartProps) {
    
    // Prop olarak gelen trajectory verisini kullan
    const trajectories = useMemo(() => {
        if (!gameResult.trajectories) return [];
        return gameResult.trajectories.map(traj => ({
            toApple: traj.toApple.map(toVector3),
            toBasket: traj.toBasket.map(toVector3)
        }));
    }, [gameResult.trajectories]);

    if (!trajectories || trajectories.length === 0) {
        return (
            <div className="flex justify-center items-center h-full">
                <p className="text-muted-foreground">Bu seans için hareket yörüngesi verisi bulunamadı.</p>
            </div>
        );
    }

    // İlk yörüngenin son noktalarını alarak elma ve sepet pozisyonlarını belirle
    const firstTrajectory = trajectories[0];
    const applePosition = firstTrajectory.toApple[firstTrajectory.toApple.length - 1];
    const basketPosition = firstTrajectory.toBasket[firstTrajectory.toBasket.length - 1];

    return (
        <div className="grid grid-cols-3 gap-4 h-full">
            <div className="col-span-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <Canvas camera={{ position: [0, 2, 4], fov: 50 }}>
                    <ambientLight intensity={0.8} />
                    <directionalLight position={[5, 5, 5]} intensity={1} />
                    <gridHelper args={[10, 10]} />

                    {/* Elma ve sepet pozisyonları artık dinamik */}
                    {applePosition && (
                        <>
                            <Sphere position={applePosition} args={[0.05]}>
                                <meshStandardMaterial color="red" />
                            </Sphere>
                            <Text position={applePosition} fontSize={0.1} color="black" anchorY="bottom">Elma</Text>
                        </>
                    )}
                    {basketPosition && (
                         <>
                            <Sphere position={basketPosition} args={[0.05]}>
                                <meshStandardMaterial color="green" />
                            </Sphere>
                            <Text position={basketPosition} fontSize={0.1} color="black" anchorY="bottom">Sepet</Text>
                        </>
                    )}

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
