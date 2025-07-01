// src/components/session-creator/tabs/ObjectPlacementTab.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThreeDGrid } from "@/components/three-d-grid";
import { Trash2, Apple, ShoppingBasket } from "lucide-react";
import type { DashboardApple, DashboardBasket } from "@/types/dashboard";

interface ObjectPlacementTabProps {
    apples: DashboardApple[];
    baskets: DashboardBasket[];
    romLimit: number;
    onAddObject: (type: 'fresh' | 'rotten' | 'basket') => void;
    onRemoveObject: (id: number, type: 'apple' | 'basket') => void;
}

export function ObjectPlacementTab({ apples, baskets, romLimit, onAddObject, onRemoveObject }: ObjectPlacementTabProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
            {/* 3D Görselleştirme */}
            <div className="lg:col-span-2 h-full">
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle>3D Yerleşim Alanı</CardTitle>
                        <CardDescription>Nesneleri hastanın ROM limiti içinde görüntüleyin.</CardDescription>
                    </CardHeader>
                    <CardContent className="h-[calc(100%-80px)]">
                        <ThreeDGrid apples={apples} baskets={baskets} romLimit={romLimit} />
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
                            <h4 className="font-semibold text-sm mb-2">Rastgele Nesne Ekle</h4>
                            <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => onAddObject('fresh')}><Apple className="h-4 w-4 mr-2 text-green-600"/> Sağlam Elma</Button>
                            <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => onAddObject('rotten')}><Apple className="h-4 w-4 mr-2 text-yellow-800"/> Çürük Elma</Button>
                            <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => onAddObject('basket')}><ShoppingBasket className="h-4 w-4 mr-2"/> Sepet</Button>
                        </div>

                        <div className="space-y-3 pt-2">
                            <h4 className="font-semibold text-sm">Sahnedeki Nesneler ({apples.length + baskets.length})</h4>
                            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
                                {apples.map(apple => (
                                    <div key={apple.id} className="flex items-center justify-between p-2 text-xs border rounded-md">
                                        <Badge className={apple.type === 'fresh' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>{apple.type === 'fresh' ? 'Sağlam' : 'Çürük'}</Badge>
                                        <code className="text-muted-foreground">X:{apple.position.x} Y:{apple.position.y} Z:{apple.position.z}</code>
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onRemoveObject(apple.id, 'apple')}><Trash2 className="h-3 w-3"/></Button>
                                    </div>
                                ))}
                                {baskets.map(basket => (
                                    <div key={basket.id} className="flex items-center justify-between p-2 text-xs border rounded-md">
                                        <Badge variant="secondary">Sepet</Badge>
                                        <code className="text-muted-foreground">X:{basket.position.x} Y:{basket.position.y} Z:{basket.position.z}</code>
                                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onRemoveObject(basket.id, 'basket')}><Trash2 className="h-3 w-3"/></Button>
                                    </div>
                                ))}
                                {(apples.length + baskets.length) === 0 && <p className="text-center text-xs text-muted-foreground pt-4">Sahneye nesne ekleyin.</p>}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}