// src/components/session-creator/tabs/PreviewTab.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardPatient } from "@/types/dashboard";
import { Clock } from "lucide-react";

interface PreviewTabProps {
    selectedPatient: DashboardPatient | null;
    selectedGame: 'apple' | 'piano' | null;
    sessionState: "configuring" | "running" | "finished";
    timer: number;
}

// Zamanı formatlamak için yardımcı fonksiyon
const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
};

export function PreviewTab({ selectedPatient, selectedGame, sessionState, timer }: PreviewTabProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Seans Önizleme ve Durum</CardTitle>
                <CardDescription>
                    {sessionState === "configuring" && "Seans ayarlarını son kez kontrol edip başlatın."}
                    {sessionState === "running" && "Seans şu anda aktif."}
                    {sessionState === "finished" && "Seans tamamlandı."}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {sessionState !== "configuring" && (
                        <div className="flex flex-col items-center justify-center p-6 border rounded-lg bg-gray-50 dark:bg-gray-800/50">
                            <Clock className="w-12 h-12 text-primary mb-2"/>
                            <p className="text-4xl font-bold font-mono tracking-widest">
                                {formatTime(timer)}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">SEANS SÜRESİ</p>
                        </div>
                    )}
                    <div className="p-4 border rounded-lg space-y-2">
                        <h4 className="font-semibold">Hasta Bilgileri</h4>
                        <p><span className="text-muted-foreground">Adı:</span> {selectedPatient?.name ?? 'Bilinmiyor'}</p>
                        <p><span className="text-muted-foreground">Teşhis:</span> {selectedPatient?.diagnosis ?? 'Belirtilmemiş'}</p>
                    </div>
                    <div className="p-4 border rounded-lg space-y-2">
                        <h4 className="font-semibold">Oyun Bilgileri</h4>
                        <p><span className="text-muted-foreground">Seçilen Oyun:</span> {selectedGame === 'apple' ? 'Elma Toplama Oyunu' : 'Piyano Oyunu'}</p>
                        {selectedGame === 'piano' && (
                            <p className="text-muted-foreground">Piyano oyunu ayarları ve parmak seçimi yapıldı.</p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}