// src/components/session-creator/tabs/AppleGameCalibration.tsx
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ThreeDGrid } from '@/components/three-d-grid';
import { Trash2, Apple, ShoppingBasket } from 'lucide-react';
import type { SceneObject } from '@/types/firebase';

interface AppleGameCalibrationTabProps {
    initialObjects?: SceneObject[];
    onObjectsChange: (objects: SceneObject[]) => void;
}

export function AppleGameCalibrationTab({ initialObjects = [], onObjectsChange }: AppleGameCalibrationTabProps) {
    const [objects, setObjects] = useState<SceneObject[]>(initialObjects);

    // Nesne listesini güncelleyen ve üst bileşene bildiren merkezi fonksiyon
    const updateObjects = (newObjects: SceneObject[]) => {
        setObjects(newObjects);
        onObjectsChange(newObjects);
    };

    // Sahneye yeni bir nesne (elma veya sepet) ekler
    const addObject = (type: 'apple' | 'basket') => {
        const newObject: SceneObject = {
            id: `${type}_${Date.now()}`,
            type: type,
            // Izgara üzerinde rastgele bir başlangıç konumu
            position: [Math.random() * 4 - 2, 0.5, Math.random() * 4 - 2],
            rotation: [0, 0, 0],
            scale: [1, 1, 1]
        };
        updateObjects([...objects, newObject]);
    };

    // Sahnedeki tüm nesneleri temizler
    const clearAll = () => {
        updateObjects([]);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Elma ve Sepetleri Yerleştir</CardTitle>
                <CardDescription>
                    3D alanda elma ve sepetleri sürükleyerek oyun alanını oluşturun. Nesneleri taşımak için üzerlerine tıklayıp sürükleyin, kamerayı kontrol etmek için sahne üzerinde gezinin.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-4 mb-4">
                    <Button onClick={() => addObject('apple')}>
                        <Apple className="mr-2 h-4 w-4" /> Elma Ekle
                    </Button>
                    <Button onClick={() => addObject('basket')}>
                        <ShoppingBasket className="mr-2 h-4 w-4" /> Sepet Ekle
                    </Button>
                    <Button variant="destructive" onClick={clearAll} disabled={objects.length === 0}>
                        <Trash2 className="mr-2 h-4 w-4" /> Tümünü Temizle
                    </Button>
                </div>
                <div className="h-[500px] w-full rounded-lg border bg-card-foreground/5">
                    <ThreeDGrid objects={objects} onObjectsChange={updateObjects} />
                </div>
            </CardContent>
        </Card>
    );
}