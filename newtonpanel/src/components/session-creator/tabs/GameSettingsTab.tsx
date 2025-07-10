// src/components/session-creator/tabs/GameSettingsTab.tsx
"use client"

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Gamepad2 } from 'lucide-react';

interface GameSettingsTabProps {
    duration: number;
    setDuration: (value: number) => void;
    speed: number;
    setSpeed: (value: number) => void;
    gameType: 'appleGame' | 'fingerDance' | string;
}

export function GameSettingsTab({ duration, setDuration, speed, setSpeed, gameType }: GameSettingsTabProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Gamepad2 className="h-5 w-5" />
                    Oyun Ayarları
                </CardTitle>
                <CardDescription>
                    Bu seansa özel oyun mekaniklerini yapılandırın. Bu ayarlar sadece mevcut seans için geçerli olacaktır.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 pt-4">
                {gameType === 'appleGame' && (
                     <div className="space-y-3">
                        <Label htmlFor="duration">Oyun Süresi (dakika)</Label>
                        <Input
                            id="duration"
                            type="number"
                            value={duration}
                            onChange={(e) => setDuration(Number(e.target.value))}
                            className="w-full"
                            min="1"
                            max="30"
                        />
                         <p className="text-sm text-muted-foreground">
                            Elma toplama oyununun toplam süresini belirtin.
                        </p>
                    </div>
                )}

                {gameType === 'fingerDance' && (
                    <>
                        <div className="space-y-3">
                            <Label htmlFor="speed">Nota Hızı: {speed.toFixed(1)}x</Label>
                            <Slider
                                id="speed"
                                min={0.5}
                                max={2.5}
                                step={0.1}
                                value={[speed]}
                                onValueChange={(value) => setSpeed(value[0])}
                            />
                            <p className="text-sm text-muted-foreground">
                                Notaların ekranda akma hızını ayarlayın. Düşük değerler daha yavaş, yüksek değerler daha hızlıdır.
                            </p>
                        </div>
                        <div className="space-y-3">
                            <Label htmlFor="song-select">Şarkı (Gelecek Özellik)</Label>
                             <Input id="song-select" value="Fur Elise (Varsayılan)" disabled />
                             <p className="text-sm text-muted-foreground">
                                Sonraki versiyonlarda farklı şarkılar seçilebilecektir.
                            </p>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}