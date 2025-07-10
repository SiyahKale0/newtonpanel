// src/components/session-creator/tabs/CalibrationTab.tsx
"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

// Hatanın çözümü için arayüzü güncelliyoruz
interface CalibrationTabProps {
    minRomCalibre: boolean;
    maxRomCalibre: boolean;
    onToggle: (type: 'min' | 'max') => Promise<void>;
    // ↓↓↓ DEĞİŞİKLİK BURADA: 'string' yerine 'string | null' tipini kabul et
    currentSessionId: string | null;
}

export function CalibrationTab({ minRomCalibre, maxRomCalibre, onToggle, currentSessionId }: CalibrationTabProps) {
    const [isMinLoading, setIsMinLoading] = useState(false);
    const [isMaxLoading, setIsMaxLoading] = useState(false);

    const handleToggle = async (type: 'min' | 'max') => {
        // currentSessionId'nin null olup olmadığını kontrol ediyoruz,
        // bu sayede uygulama kırılmaz.
        if (!currentSessionId) {
            console.warn("Kalibrasyon işlemi için seans ID'si bekleniyor.");
            return;
        }

        if (type === 'min') {
            setIsMinLoading(true);
            await onToggle('min');
            setIsMinLoading(false);
        } else {
            setIsMaxLoading(true);
            await onToggle('max');
            setIsMaxLoading(false);
        }
    };

    // Butonların 'disabled' durumu, currentSessionId'nin varlığını kontrol eder.
    const isButtonDisabled = !currentSessionId;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Minimum ROM Kalibrasyon Kartı */}
            <Card>
                <CardHeader>
                    <CardTitle>Minimum ROM Kalibrasyonu</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-start gap-4">
                    <p className="text-sm text-muted-foreground">
                        Lütfen elinizi en kapalı (yumruk) pozisyona getirin ve butona tıklayarak kalibrasyonu başlatın.
                    </p>
                    <Button
                        onClick={() => handleToggle('min')}
                        variant={minRomCalibre ? "secondary" : "default"}
                        className="w-full"
                        disabled={isMinLoading || isButtonDisabled}
                    >
                        {isMinLoading ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Güncelleniyor...</>
                        ) : (
                            minRomCalibre ? 'Kalibrasyon Aktif' : 'Pasif'
                        )}
                    </Button>
                </CardContent>
            </Card>

            {/* Maksimum ROM Kalibrasyon Kartı */}
            <Card>
                <CardHeader>
                    <CardTitle>Maksimum ROM Kalibrasyonu</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-start gap-4">
                    <p className="text-sm text-muted-foreground">
                        Lütfen elinizi en açık pozisyona getirin ve butona tıklayarak kalibrasyonu başlatın.
                    </p>
                    <Button
                        onClick={() => handleToggle('max')}
                        variant={maxRomCalibre ? "secondary" : "default"}
                        className="w-full"
                        disabled={isMaxLoading || isButtonDisabled}
                    >
                        {isMaxLoading ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Güncelleniyor...</>
                        ) : (
                            maxRomCalibre ? 'Kalibrasyon Aktif' : 'Pasif'
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}