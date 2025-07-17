// src/components/session-creator/tabs/PreviewTab.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Gamepad2, Clock, PlayCircle, PauseCircle, CheckCircle } from "lucide-react";
import type { DashboardPatient } from "@/types/dashboard";

interface PreviewTabProps {
    selectedPatient: DashboardPatient | null;
    selectedGame: "appleGame" | "fingerDance" | null; // HATA BURADAYDI, DÜZELTİLDİ
    sessionState: "configuring" | "running" | "finished";
    timer: number;
}

const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
};

const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
}

export function PreviewTab({ selectedPatient, selectedGame, sessionState, timer }: PreviewTabProps) {
    const gameName = selectedGame === 'appleGame' ? 'Elma Toplama Oyunu' : 'Piyano Oyunu';
    const gameIcon = selectedGame ? <Gamepad2 className="w-5 h-5 text-muted-foreground" /> : null;

    const getStatusInfo = () => {
        switch (sessionState) {
            case "running":
                return { icon: <PauseCircle className="w-8 h-8 text-yellow-500" />, text: "Seans Sürüyor", color: "text-yellow-500" };
            case "finished":
                return { icon: <CheckCircle className="w-8 h-8 text-green-500" />, text: "Seans Tamamlandı", color: "text-green-500" };
            default: // "configuring"
                return { icon: <PlayCircle className="w-8 h-8 text-blue-500" />, text: "Başlamaya Hazır", color: "text-blue-500" };
        }
    };

    const statusInfo = getStatusInfo();

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Seans Önizlemesi</CardTitle>
                <CardDescription>
                    Seansı başlatmadan önce tüm ayarları kontrol edin.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    {/* Patient Info */}
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${selectedPatient?.name}`} alt={selectedPatient?.name} />
                            <AvatarFallback>{selectedPatient ? getInitials(selectedPatient.name) : 'H'}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <User className="w-5 h-5 text-muted-foreground" />
                                {selectedPatient?.name || 'Hasta Seçilmedi'}
                            </h3>
                            <p className="text-sm text-muted-foreground">{selectedPatient?.diagnosis}</p>
                        </div>
                    </div>

                    {/* Game Info */}
                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted">
                            {gameIcon}
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                {gameName || 'Oyun Seçilmedi'}
                            </h3>
                            <p className="text-sm text-muted-foreground">Seçilen rehabilitasyon oyunu</p>
                        </div>
                    </div>
                </div>

                {/* Status and Timer */}
                <div className="flex flex-col items-center justify-center gap-4 rounded-lg border bg-background p-8">
                    <div className={`flex items-center gap-3 font-bold text-2xl ${statusInfo.color}`}>
                        {statusInfo.icon}
                        <span>{statusInfo.text}</span>
                    </div>
                    <div className="flex items-center gap-2 text-6xl font-mono tracking-tighter">
                        <Clock className="w-12 h-12 text-muted-foreground" />
                        <span>{formatTime(timer)}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}