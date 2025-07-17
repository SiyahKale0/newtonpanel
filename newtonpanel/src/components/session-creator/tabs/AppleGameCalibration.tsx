// src/components/session-creator/tabs/AppleGameCalibrationTab.tsx
import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, TransformControls, Grid } from '@react-three/drei';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Apple } from '@/components/scene/Apple';
import { Basket } from '@/components/scene/Basket';
import type { SceneObject } from '@/types/firebase';
import { v4 as uuidv4 } from 'uuid';
import { Apple as AppleIcon, ShoppingBasket, Trash2, BoxSelect } from 'lucide-react';

interface AppleGameCalibrationTabProps {
    initialObjects: SceneObject[];
    onObjectsChange: (objects: SceneObject[]) => void;
}

// Wrapper for objects to attach TransformControls
const SceneObjectWrapper = ({ obj, onSelect, onUpdate, isSelected }: any) => {
    const [target, setTarget] = useState(null);

    const commonProps = {
        position: obj.position,
        onClick: () => onSelect(obj.id, target),
        isSelected: isSelected,
    };

    return (
        <TransformControls
            object={isSelected ? target : undefined}
            onMouseUp={(e) => {
                // @ts-ignore
                if (e.target.object) {
                    // @ts-ignore
                    const { x, y, z } = e.target.object.position;
                    onUpdate(obj.id, [x, y, z]);
                }
            }}
        >
            {/* @ts-ignore */}
            <group ref={setTarget}>
                {obj.type === 'apple' ? <Apple {...commonProps} /> : <Basket {...commonProps} />}
            </group>
        </TransformControls>
    );
};


export function AppleGameCalibrationTab({ initialObjects, onObjectsChange }: AppleGameCalibrationTabProps) {
    const [objects, setObjects] = useState<SceneObject[]>(initialObjects);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const addObject = (type: 'apple' | 'basket') => {
        const newObject: SceneObject = {
            id: uuidv4(),
            type: type,
            position: [Math.random() * 4 - 2, type === 'apple' ? 1 : 0.2, Math.random() * 4 - 2],
        };
        const updatedObjects = [...objects, newObject];
        setObjects(updatedObjects);
        onObjectsChange(updatedObjects);
    };

    const removeObject = (id: string) => {
        const updatedObjects = objects.filter(obj => obj.id !== id);
        setObjects(updatedObjects);
        onObjectsChange(updatedObjects);
        setSelectedId(null);
    };

    const updatePosition = (id: string, newPosition: [number, number, number]) => {
        const updatedObjects = objects.map(obj =>
            obj.id === id ? { ...obj, position: newPosition } : obj
        );
        setObjects(updatedObjects);
        onObjectsChange(updatedObjects);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><BoxSelect/> Sahne Düzenleyici</CardTitle>
                <CardDescription>
                    Oyun alanına elma ve sepetleri ekleyin. Objeleri seçip sürükleyerek yerlerini değiştirebilirsiniz.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-4 mb-4">
                    <Button onClick={() => addObject('apple')}><AppleIcon className="mr-2 h-4 w-4" /> Elma Ekle</Button>
                    <Button onClick={() => addObject('basket')}><ShoppingBasket className="mr-2 h-4 w-4"/> Sepet Ekle</Button>
                    {selectedId && <Button variant="destructive" onClick={() => removeObject(selectedId)}><Trash2 className="mr-2 h-4 w-4"/> Seçili Objeyi Sil</Button>}
                </div>
                <div className="w-full h-[50vh] rounded-lg overflow-hidden border bg-slate-100 dark:bg-slate-800">
                    <Canvas camera={{ position: [0, 5, 10], fov: 50 }} onClick={() => setSelectedId(null)}>
                        <Suspense fallback={null}>
                            <ambientLight intensity={1.5} />
                            <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
                            <Grid position={[0, -0.01, 0]} args={[10, 10]} infiniteGrid fadeDistance={25} fadeStrength={4} />

                            {objects.map((obj) => (
                                <SceneObjectWrapper
                                    key={obj.id}
                                    obj={obj}
                                    onSelect={(id: string, target: any) => setSelectedId(id)}
                                    onUpdate={updatePosition}
                                    isSelected={selectedId === obj.id}
                                />
                            ))}

                            <OrbitControls makeDefault minDistance={3} maxDistance={20} />
                        </Suspense>
                    </Canvas>
                </div>
            </CardContent>
        </Card>
    );
}