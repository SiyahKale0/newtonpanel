// src/components/patient-management/GameStatisticsModal.tsx
"use client"

import { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { X, Activity, Target, Gamepad2, BarChart3 } from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

import { Session, GameResult, FingerDanceResult, AppleGameResult, Rom } from '@/types/firebase';
import { Hand } from '@/components/3d-models/Hand';

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface GameStatisticsModalProps {
    session: Session;
    gameResult: GameResult | undefined;
    romData: Rom | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

// Finger usage heat map color calculation
const getFingerHeatColor = (usageCount: number, maxUsage: number): string => {
    if (maxUsage === 0) return '#6b7280'; // Gray for no usage
    const intensity = usageCount / maxUsage;
    if (intensity === 0) return '#6b7280'; // Gray
    if (intensity < 0.25) return '#3b82f6'; // Blue
    if (intensity < 0.5) return '#10b981'; // Green
    if (intensity < 0.75) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red for high usage
};

// Calculate finger usage statistics
const calculateFingerUsage = (notes: FingerDanceResult['notes']) => {
    const fingerStats: Record<string, { correct: number; missed: number; total: number }> = {};
    
    notes.forEach(note => {
        const fingerName = getFingerName(note.finger);
        if (!fingerStats[fingerName]) {
            fingerStats[fingerName] = { correct: 0, missed: 0, total: 0 };
        }
        fingerStats[fingerName].total++;
        if (note.hit) {
            fingerStats[fingerName].correct++;
        } else {
            fingerStats[fingerName].missed++;
        }
    });
    
    return fingerStats;
};

// Convert finger number to finger name
const getFingerName = (fingerNumber: number): string => {
    const fingerMap: Record<number, string> = {
        0: 'Sol Başparmak',
        1: 'Sol İşaret Parmağı',
        2: 'Sol Orta Parmak',
        3: 'Sol Yüzük Parmağı',
        4: 'Sol Serçe Parmağı',
        5: 'Sağ Başparmak',
        6: 'Sağ İşaret Parmağı',
        7: 'Sağ Orta Parmak',
        8: 'Sağ Yüzük Parmağı',
        9: 'Sağ Serçe Parmağı'
    };
    return fingerMap[fingerNumber] || `Parmak ${fingerNumber}`;
};

export function GameStatisticsModal({ session, gameResult, romData, open, onOpenChange }: GameStatisticsModalProps) {
    const [selectedFinger, setSelectedFinger] = useState<string | null>(null);
    const [selectedFingers, setSelectedFingers] = useState<string[]>([]);

    useEffect(() => {
        if (open) {
            setSelectedFinger(null);
            setSelectedFingers([]);
        }
    }, [open]);

    const gameTypeName = useMemo(() => {
        if (session.gameType === 'appleGame') return 'Elma Toplama Oyunu';
        if (session.gameType === 'fingerDance') return 'Piyano Oyunu';
        return 'Bilinmeyen Oyun';
    }, [session.gameType]);

    const gameIcon = useMemo(() => {
        if (session.gameType === 'appleGame') return Target;
        if (session.gameType === 'fingerDance') return Gamepad2;
        return BarChart3;
    }, [session.gameType]);

    // FingerDance Statistics Component
    const FingerDanceStats = () => {
        if (!gameResult || gameResult.gameType !== 'fingerDance') return null;
        
        const fingerDanceResult = gameResult as FingerDanceResult;
        const fingerUsage = calculateFingerUsage(fingerDanceResult.notes);
        const maxUsage = Math.max(...Object.values(fingerUsage).map(stat => stat.total));

        const handleFingerClick = (fingerName: string) => {
            setSelectedFinger(fingerName);
            setSelectedFingers([fingerName]);
        };

        const getFingerROM = (fingerName: string) => {
            if (!romData) return { min: 0, max: 0 };
            
            // Parse finger name to determine hand and finger index
            const isLeft = fingerName.includes('Sol');
            const fingerIndex = ['Başparmak', 'İşaret', 'Orta', 'Yüzük', 'Serçe'].findIndex(f => fingerName.includes(f));
            
            if (fingerIndex === -1) return { min: 0, max: 0 };
            
            const fingers = isLeft ? romData.finger.leftFingers : romData.finger.rightFingers;
            return fingers[fingerIndex] || { min: 0, max: 0 };
        };

        // Generate heat map colors for fingers
        const fingerColors: Record<string, string> = {};
        Object.entries(fingerUsage).forEach(([fingerName, stats]) => {
            fingerColors[fingerName] = getFingerHeatColor(stats.total, maxUsage);
        });

        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                {/* 3D Hand Model */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">El Modeli - Isı Haritası</h3>
                    <div className="h-96 border rounded-lg overflow-hidden bg-gradient-to-b from-blue-50 to-white">
                        <Canvas shadows>
                            <PerspectiveCamera makeDefault position={[0, 0, 8]} />
                            <OrbitControls enableZoom={true} enablePan={true} />
                            <ambientLight intensity={0.6} />
                            <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
                            <group position={[0, 0, 0]}>
                                <Hand
                                    isRightHand={false}
                                    selectedFingers={selectedFingers}
                                    onFingerClick={handleFingerClick}
                                    fingerColors={fingerColors}
                                    position={[-2, 0, 0]}
                                />
                                <Hand
                                    isRightHand={true}
                                    selectedFingers={selectedFingers}
                                    onFingerClick={handleFingerClick}
                                    fingerColors={fingerColors}
                                    position={[2, 0, 0]}
                                />
                            </group>
                        </Canvas>
                    </div>
                    
                    {/* Heat Map Legend */}
                    <div className="flex items-center justify-center space-x-4 text-sm">
                        <span className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-gray-500"></div>
                            Kullanılmadı
                        </span>
                        <span className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-blue-500"></div>
                            Az
                        </span>
                        <span className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-green-500"></div>
                            Orta
                        </span>
                        <span className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-yellow-500"></div>
                            Çok
                        </span>
                        <span className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded bg-red-500"></div>
                            En Çok
                        </span>
                    </div>
                </div>

                {/* Statistics Panel */}
                <div className="space-y-4 overflow-y-auto">
                    <h3 className="text-lg font-semibold">Parmak İstatistikleri</h3>
                    
                    {selectedFinger ? (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">{selectedFinger}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {fingerUsage[selectedFinger] && (
                                    <>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="font-medium text-green-600">Doğru Nota</p>
                                                <p className="text-2xl font-bold">{fingerUsage[selectedFinger].correct}</p>
                                            </div>
                                            <div>
                                                <p className="font-medium text-red-600">Kaçırılan Nota</p>
                                                <p className="text-2xl font-bold">{fingerUsage[selectedFinger].missed}</p>
                                            </div>
                                        </div>
                                        <div className="pt-2 border-t">
                                            <p className="text-sm font-medium mb-2">ROM Değerleri</p>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <p className="text-muted-foreground">Min ROM</p>
                                                    <p className="font-semibold">{getFingerROM(selectedFinger).min}°</p>
                                                </div>
                                                <div>
                                                    <p className="text-muted-foreground">Max ROM</p>
                                                    <p className="font-semibold">{getFingerROM(selectedFinger).max}°</p>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="border-dashed">
                            <CardContent className="p-6 text-center text-muted-foreground">
                                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p>Detayları görmek için bir parmağa tıklayın</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Overall Statistics */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Genel İstatistikler</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span>Toplam Nota:</span>
                                <span className="font-semibold">{fingerDanceResult.notes.length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Doğru Nota:</span>
                                <span className="font-semibold text-green-600">{fingerDanceResult.notes.filter(n => n.hit).length}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Hatalı Nota:</span>
                                <span className="font-semibold text-red-600">{fingerDanceResult.mistakes}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Max Kombo:</span>
                                <span className="font-semibold text-purple-600">{fingerDanceResult.combo}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    };

    // AppleGame Statistics Component
    const AppleGameStats = () => {
        if (!gameResult || gameResult.gameType !== 'appleGame') return null;
        
        const appleGameResult = gameResult as AppleGameResult;

        // Mock position data for demonstration (in real app, this would come from position_log.json)
        const generateMockPositionData = () => {
            const timePoints = Array.from({ length: 50 }, (_, i) => i * 2); // Every 2 seconds
            const leftArmData = timePoints.map(t => Math.sin(t / 10) * 30 + Math.random() * 10);
            const rightArmData = timePoints.map(t => Math.cos(t / 8) * 25 + Math.random() * 8);
            
            return {
                labels: timePoints.map(t => `${t}s`),
                datasets: [
                    {
                        label: 'Sol Kol Pozisyonu',
                        data: leftArmData,
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.3,
                    },
                    {
                        label: 'Sağ Kol Pozisyonu',
                        data: rightArmData,
                        borderColor: 'rgb(239, 68, 68)',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        tension: 0.3,
                    },
                ],
            };
        };

        const chartOptions = {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top' as const,
                },
                title: {
                    display: true,
                    text: 'Hareket Grafiği',
                },
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Pozisyon (derece)',
                    },
                },
                x: {
                    title: {
                        display: true,
                        text: 'Zaman',
                    },
                },
            },
        };

        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                {/* ROM Statistics */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">ROM İstatistikleri</h3>
                    
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Sol Kol</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Min ROM</p>
                                    <p className="text-xl font-bold text-blue-600">
                                        {romData?.arm.leftSpace ? Math.round(romData.arm.leftSpace * 0.8) : 45}°
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Max ROM</p>
                                    <p className="text-xl font-bold text-blue-600">
                                        {romData?.arm.leftSpace || 180}°
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Sağ Kol</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-muted-foreground">Min ROM</p>
                                    <p className="text-xl font-bold text-red-600">
                                        {romData?.arm.rightSpace ? Math.round(romData.arm.rightSpace * 0.8) : 50}°
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Max ROM</p>
                                    <p className="text-xl font-bold text-red-600">
                                        {romData?.arm.rightSpace || 175}°
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Game Statistics */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Oyun İstatistikleri</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span>Toplanan Elma:</span>
                                <span className="font-semibold text-green-600">
                                    {appleGameResult.apples.filter(a => a.status === 'picked').length}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Kaçırılan Elma:</span>
                                <span className="font-semibold text-red-600">
                                    {appleGameResult.apples.filter(a => a.status === 'missed').length}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Düşürülen Elma:</span>
                                <span className="font-semibold text-yellow-600">
                                    {appleGameResult.apples.filter(a => a.status === 'dropped').length}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span>Başarı Oranı:</span>
                                <span className="font-semibold text-purple-600">
                                    %{Math.round(appleGameResult.successRate)}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Movement Chart */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Hareket Analizi</h3>
                    <Card>
                        <CardContent className="p-4">
                            <Line data={generateMockPositionData()} options={chartOptions} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    };

    if (!gameResult) return null;

    const GameIcon = gameIcon;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                showCloseButton={false}
                className="h-[90vh] flex flex-col p-0 max-w-7xl"
            >
                <DialogHeader className="p-6 flex-shrink-0 border-b">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                            <GameIcon className="w-6 h-6 text-primary" />
                            <div>
                                <DialogTitle className="text-2xl font-bold">{gameTypeName} - İstatistikler</DialogTitle>
                                <p className="text-sm text-muted-foreground mt-1">
                                    {session.date} • Skor: {gameResult.score} • Süre: {session.startTime}-{session.endTime}
                                </p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </DialogHeader>

                <div className="flex-grow overflow-hidden p-6">
                    {session.gameType === 'fingerDance' && <FingerDanceStats />}
                    {session.gameType === 'appleGame' && <AppleGameStats />}
                </div>
            </DialogContent>
        </Dialog>
    );
}