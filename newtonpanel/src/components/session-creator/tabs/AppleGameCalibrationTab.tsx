// src/components/session-creator/tabs/AppleGameCalibrationTab.tsx
import React, { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThreeDGrid, getClampedPosition } from '@/components/three-d-grid';
import { Trash2, Apple, ShoppingBasket } from 'lucide-react';
import type { SceneObject } from '@/types/firebase';

const MAX_APPLES = 8 * 5 * 5; // x*y*z
const MAX_BASKETS = 8 * 5;   // x*z

interface AppleGameCalibrationTabProps {
    initialObjects?: SceneObject[];
    onObjectsChange: (objects: SceneObject[]) => void;
}

export function AppleGameCalibrationTab({ initialObjects = [], onObjectsChange }: AppleGameCalibrationTabProps) {
    const [objects, setObjects] = useState<SceneObject[]>(initialObjects);

    const updateObjects = (newObjects: SceneObject[]) => {
        setObjects(newObjects);
        onObjectsChange(newObjects);
    };

    const addObject = (type: 'apple_fresh' | 'apple_rotten' | 'basket') => {
        const appleCount = objects.filter(o => o.type.startsWith('apple')).length;
        const basketCount = objects.filter(o => o.type === 'basket').length;

        if (type.startsWith('apple') && appleCount >= MAX_APPLES) {
            alert(`Maksimum elma sayısına ulaşıldı (${MAX_APPLES}).`);
            return;
        }
        if (type === 'basket' && basketCount >= MAX_BASKETS) {
            alert(`Maksimum sepet sayısına ulaşıldı (${MAX_BASKETS}).`);
            return;
        }

        // Boş bir hücre bulana kadar rastgele pozisyon dene
        let newPosition: [number, number, number];
        let isOccupied = true;
        let attempts = 0;
        do {
            const randomPosition: [number, number, number] = [
                Math.floor(Math.random() * 8) - 4, // x (-4 to 3)
                type === 'basket' ? 0 : Math.floor(Math.random() * 5), // y (sepet için 0, elma için 0-4)
                Math.floor(Math.random() * 5) - 2  // z (-2 to 2)
            ];
            newPosition = getClampedPosition(randomPosition, type);
            isOccupied = objects.some(obj =>
                obj.position[0] === newPosition[0] &&
                obj.position[1] === newPosition[1] &&
                obj.position[2] === newPosition[2]
            );
            attempts++;
        } while (isOccupied && attempts < 50) // Sonsuz döngüden kaçın

        if (isOccupied) {
            alert("Boş bir hücre bulunamadı. Lütfen bazı nesneleri silin veya hareket ettirin.");
            return;
        }

        const newObject: SceneObject = {
            id: `${type}_${Date.now()}`,
            type: type,
            position: newPosition,
            rotation: [0, 0, 0],
            scale: [1, 1, 1]
        };
        updateObjects([...objects, newObject]);
    };

    const removeObject = (id: string) => {
        updateObjects(objects.filter(obj => obj.id !== id));
    };

    const handleCoordinateChange = useCallback((id: string, axis: 'x' | 'y' | 'z', value: string) => {
        const numValue = parseInt(value, 10);
        if (isNaN(numValue)) return; // Sayı değilse işlemi iptal et

        const targetObject = objects.find(obj => obj.id === id);
        if (!targetObject) return;

        const currentPosition = targetObject.position;
        const newPosition: [number, number, number] = [...currentPosition];
        const axisIndex = { x: 0, y: 1, z: 2 }[axis];
        newPosition[axisIndex] = numValue;

        // Yeni pozisyonu grid sınırlarına ve kurallarına göre düzelt
        const clampedPosition = getClampedPosition(newPosition, targetObject.type);

        // Başka bir nesne o konumda mı diye kontrol et
        const isOccupied = objects.some(obj =>
            obj.id !== id &&
            obj.position[0] === clampedPosition[0] &&
            obj.position[1] === clampedPosition[1] &&
            obj.position[2] === clampedPosition[2]
        );

        if (isOccupied) {
            console.warn(`Pozisyon [${clampedPosition.join(', ')}] dolu.`);
            // İsteğe bağlı: kullanıcıya uyarı gösterilebilir.
            // Şimdilik değişikliği uygulamıyoruz.
            return;
        }

        // Nesne listesini güncelle
        const updatedObjects = objects.map(obj =>
            obj.id === id ? { ...obj, position: clampedPosition } : obj
        );
        updateObjects(updatedObjects);

    }, [objects]);


    const clearAll = () => {
        updateObjects([]);
    };

    const getBadgeForType = (type: SceneObject['type']) => {
        if (type === 'apple_fresh') return <Badge className="bg-red-100 text-red-800">Sağlam Elma</Badge>;
        if (type === 'apple_rotten') return <Badge className="bg-purple-100 text-purple-800">Çürük Elma</Badge>;
        if (type === 'basket') return <Badge className="bg-yellow-100 text-yellow-800">Sepet</Badge>;
        return <Badge variant="outline">Bilinmeyen</Badge>;
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[650px]">
            {/* 3D Görselleştirme */}
            <div className="lg:col-span-2 h-full">
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle>Elma ve Sepetleri Yerleştir</CardTitle>
                        <CardDescription>
                            3D alanda nesneleri sürükleyerek veya koordinatlarını girerek oyun alanını oluşturun.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="h-[calc(100%-80px)]">
                        <div className="h-full w-full rounded-lg border bg-card-foreground/5">
                            <ThreeDGrid objects={objects} onObjectsChange={updateObjects} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Kontrol Paneli */}
            <div className="lg:col-span-1 h-full">
                <Card className="h-full flex flex-col">
                    <CardHeader>
                        <CardTitle>Kontrol Paneli</CardTitle>
                        <CardDescription>Nesne ekleyin ve listeyi yönetin.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-4 overflow-y-auto p-4">
                        <div className="space-y-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                            <h4 className="font-semibold text-sm mb-2">Nesne Ekle</h4>
                            <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => addObject('apple_fresh')}><Apple className="h-4 w-4 mr-2 text-red-600"/> Sağlam Elma</Button>
                            <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => addObject('apple_rotten')}><Apple className="h-4 w-4 mr-2 text-purple-600"/> Çürük Elma</Button>
                            <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => addObject('basket')}><ShoppingBasket className="h-4 w-4 mr-2 text-yellow-500"/> Sepet</Button>
                            <Button variant="destructive" size="sm" className="w-full justify-start mt-2" onClick={clearAll} disabled={objects.length === 0}>
                                <Trash2 className="mr-2 h-4 w-4" /> Tümünü Temizle
                            </Button>
                        </div>

                        <div className="space-y-3 pt-2">
                            <h4 className="font-semibold text-sm">Sahnedeki Nesneler ({objects.length})</h4>
                            <div className="max-h-[350px] overflow-y-auto space-y-3 pr-2">
                                {objects.map(obj => (
                                    <div key={obj.id} className="p-2 border rounded-md space-y-2">
                                        <div className="flex items-center justify-between">
                                            {getBadgeForType(obj.type)}
                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeObject(obj.id)}><Trash2 className="h-3 w-3"/></Button>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Label htmlFor={`x-${obj.id}`} className="text-xs">X:</Label>
                                            <Input id={`x-${obj.id}`} type="number" value={obj.position[0]} onChange={(e) => handleCoordinateChange(obj.id, 'x', e.target.value)} className="w-14 h-7 text-xs" />
                                            <Label htmlFor={`y-${obj.id}`} className="text-xs">Y:</Label>
                                            <Input id={`y-${obj.id}`} type="number" value={obj.position[1]} onChange={(e) => handleCoordinateChange(obj.id, 'y', e.target.value)} className="w-14 h-7 text-xs" disabled={obj.type === 'basket'} />
                                            <Label htmlFor={`z-${obj.id}`} className="text-xs">Z:</Label>
                                            <Input id={`z-${obj.id}`} type="number" value={obj.position[2]} onChange={(e) => handleCoordinateChange(obj.id, 'z', e.target.value)} className="w-14 h-7 text-xs" />
                                        </div>
                                    </div>
                                ))}
                                {objects.length === 0 && <p className="text-center text-xs text-muted-foreground pt-4">Sahneye nesne ekleyin.</p>}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
