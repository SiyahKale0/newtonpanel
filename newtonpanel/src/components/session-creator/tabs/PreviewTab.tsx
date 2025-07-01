// src/components/session-creator/tabs/PreviewTab.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardPatient, DashboardApple, DashboardBasket } from "@/types/dashboard";

interface PreviewTabProps {
    selectedPatient: DashboardPatient | null;
    selectedGame: 'apple' | 'piano' | null;
    apples: DashboardApple[];
    baskets: DashboardBasket[];
}

export function PreviewTab({ selectedPatient, selectedGame, apples, baskets }: PreviewTabProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Seans Önizleme</CardTitle>
                <CardDescription>Seans ayarlarını son kez kontrol edip kaydedin ve başlatın.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="p-4 border rounded-lg space-y-2">
                        <h4 className="font-semibold">Hasta Bilgileri</h4>
                        <p><span className="text-muted-foreground">Adı:</span> {selectedPatient?.name ?? 'Bilinmiyor'}</p>
                        <p><span className="text-muted-foreground">ROM Limiti:</span> {selectedPatient?.romLimit ?? 0} cm</p>
                    </div>
                    <div className="p-4 border rounded-lg space-y-2">
                        <h4 className="font-semibold">Oyun Bilgileri</h4>
                        <p><span className="text-muted-foreground">Seçilen Oyun:</span> {selectedGame === 'apple' ? 'Elma Toplama Oyunu' : 'Piyano Oyunu'}</p>
                        {selectedGame === 'apple' && (
                            <p><span className="text-muted-foreground">Nesne Sayısı:</span> {apples.length} Elma, {baskets.length} Sepet</p>
                        )}
                        {selectedGame === 'piano' && (
                            <p className="text-muted-foreground">Parmak seçimi bu ekranda gösterilebilir.</p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}