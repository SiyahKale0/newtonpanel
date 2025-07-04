// src/components/statistics/GameStatisticsModal.tsx
"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, HelpCircle } from 'lucide-react';
import { Session, GameResult, Rom, AppleGameResult, FingerDanceResult } from '@/types/firebase';
import { PianoStatistics } from './PianoStatistics';
import { AppleStatisticsChart } from './AppleStatisticsChart';

interface GameStatisticsModalProps {
    isOpen: boolean;
    onClose: () => void;
    sessionData: {
        session: Session;
        gameResult: GameResult;
        rom: Rom | null;
    };
}

export function GameStatisticsModal({ isOpen, onClose, sessionData }: GameStatisticsModalProps) {
    const { session, gameResult, rom } = sessionData;

    // ==========================================================
    //      ↓↓↓ DÜZELTİLMİŞ RENDER MANTIĞI BURADA ↓↓↓
    // ==========================================================
    const renderStatistics = () => {
        // gameResult'ın gameType özelliğine göre hangi bileşenin render edileceğini belirliyoruz.
        // Bu, en güvenilir yöntemdir.
        switch (gameResult.gameType) {
            case 'fingerDance':
                // Eğer oyun tipi 'fingerDance' ise, PianoStatistics'i render et.
                return <PianoStatistics gameResult={gameResult as FingerDanceResult} romData={rom} />;

            case 'appleGame':
                // Eğer oyun tipi 'appleGame' ise, AppleStatisticsChart'ı render et.
                return <AppleStatisticsChart gameResult={gameResult as AppleGameResult} romData={rom} />;

            default:
                // Beklenmedik bir durum olursa veya gameType tanımsızsa, bir uyarı göster.
                return (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <HelpCircle className="w-12 h-12 mb-4" />
                        <h3 className="text-lg font-semibold">İstatistik Görüntülenemiyor</h3>
                        <p>Bu oyun türü için bir istatistik sayfası bulunamadı.</p>
                    </div>
                );
        }
    };

    const getGameTitle = () => {
        if (gameResult.gameType === 'fingerDance') return "Piyano Oyunu İstatistikleri";
        if (gameResult.gameType === 'appleGame') return "Elma Toplama İstatistikleri";
        return "Oyun İstatistikleri";
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                showCloseButton={false}
                className="max-w-7xl w-full h-[90vh] flex flex-col p-0"
            >
                <DialogHeader className="p-4 border-b flex-shrink-0">
                    <div className="flex justify-between items-center">
                        <div>
                            <DialogTitle className="text-xl">{getGameTitle()}</DialogTitle>
                            <DialogDescription>Seans Tarihi: {session.date} | Başlangıç: {session.startTime}</DialogDescription>
                        </div>
                        <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
                    </div>
                </DialogHeader>

                <div className="flex-grow overflow-hidden p-4">
                    {/* Düzeltilmiş render fonksiyonunu burada çağırıyoruz */}
                    {renderStatistics()}
                </div>
            </DialogContent>
        </Dialog>
    );
}