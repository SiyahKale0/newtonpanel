// src/components/performance-analytics/SessionDetailView.tsx
"use client";

import React from 'react';
import { Session, GameResult, Rom } from '@/types/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { AreaChart, GitBranch, Trophy, CheckCircle, XCircle, Gamepad2, Target } from 'lucide-react';

// Alt Bileşenler
import ArmMeasurementCard from './ArmMeasurementCard';
import FingerProgressTable from './FingerProgressTable';

interface SessionDetailViewProps {
  session: Session | null;
  gameResult: GameResult | null;
  romData: Rom | null;
  onShowStats: () => void;
}

export function SessionDetailView({ session, gameResult, romData, onShowStats }: SessionDetailViewProps) {

  if (!session) {
    return <Card><CardContent><p className="text-center p-8">Seans bulunamadı.</p></CardContent></Card>;
  }

  const getGameName = (gameType: string | undefined) => {
    if (gameType === 'appleGame') return { name: 'Elma Toplama', icon: Target };
    if (gameType === 'fingerDance') return { name: 'Piyano Oyunu', icon: Gamepad2 };
    return { name: 'Bilinmeyen Oyun', icon: Gamepad2 };
  };

  const GameSummary = () => {
      if (!gameResult) return <p className="text-sm text-muted-foreground">Bu seans için oyun sonucu verisi bulunamadı.</p>;

      const { name, icon: GameIcon } = getGameName(gameResult.gameType);

      let details;
      if (gameResult.gameType === 'appleGame' && 'apples' in gameResult) {
          const correct = gameResult.apples?.filter(a => a.status === 'picked').length || 0;
          const missed = gameResult.apples?.filter(a => a.status === 'missed').length || 0;
          const dropped = gameResult.apples?.filter(a => a.status === 'dropped').length || 0;
          details = (
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2 text-sm">
                  <p className="flex items-center gap-1.5"><strong><CheckCircle className="w-4 h-4 text-green-500"/>Doğru:</strong> {correct}</p>
                  <p className="flex items-center gap-1.5"><strong><XCircle className="w-4 h-4 text-red-500"/>Kaçırılan:</strong> {missed}</p>
                  <p className="flex items-center gap-1.5"><strong><GitBranch className="w-4 h-4 text-yellow-500"/>Yanlış:</strong> {dropped}</p>
                  <p className="flex items-center gap-1.5"><strong><Trophy className="w-4 h-4 text-purple-500"/>Başarı:</strong> %{gameResult.successRate?.toFixed(0) || 0}</p>
              </div>
          );
      } else if (gameResult.gameType === 'fingerDance' && 'notes' in gameResult) {
          const correct = gameResult.notes?.filter(n => n.hit).length || 0;
          const mistakes = gameResult.mistakes || 0;
          details = (
               <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2 text-sm">
                  <p className="flex items-center gap-1.5"><strong><CheckCircle className="w-4 h-4 text-green-500"/>Doğru Nota:</strong> {correct}</p>
                  <p className="flex items-center gap-1.5"><strong><XCircle className="w-4 h-4 text-red-500"/>Hatalı Nota:</strong> {mistakes}</p>
                  <p className="flex items-center gap-1.5"><strong><GitBranch className="w-4 h-4 text-yellow-500"/>Maks. Kombo:</strong> {gameResult.combo || 0}</p>
                  <p className="flex items-center gap-1.5"><strong><Trophy className="w-4 h-4 text-purple-500"/>Skor:</strong> {gameResult.score || 0}</p>
              </div>
          );
      }

      return (
          <Card>
              <CardHeader>
                  <CardTitle className="flex items-center gap-2"><GameIcon /> Oyun Sonucu Özeti</CardTitle>
                  <CardDescription>Oynanan '{name}' oyununun temel istatistikleri.</CardDescription>
              </CardHeader>
              <CardContent>
                  {details}
                  <Button size="sm" variant="outline" onClick={onShowStats} className="mt-4 w-full">
                      <AreaChart className="w-4 h-4 mr-2"/>
                      Detaylı Oyun İstatistiklerini Görüntüle
                  </Button>
              </CardContent>
          </Card>
      );
  }

  return (
    <div className="space-y-6 animate-in fade-in-50">
        <GameSummary />

        {romData ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {romData.arm && <ArmMeasurementCard leftSpace={romData.arm.leftSpace} rightSpace={romData.arm.rightSpace} />}
                {romData.finger && <FingerProgressTable fingers={
                    Array.isArray(romData.finger)
                    ? romData.finger.map((f, i) => ({ 
                        name: `Parmak ${i + 1}`,
                        min: (Number(f.min) < 2 ? (Number(f.min) * 100).toFixed(0) : Number(f.min).toFixed(1)),
                        max: (Number(f.max) < 2 ? (Number(f.max) * 100).toFixed(0) : Number(f.max).toFixed(1))
                      }))
                    : [
                        ...(romData.finger.leftFingers || []).map((f, i) => ({ name: `Sol Parmak ${i + 1}`, min: f.min.toFixed(1), max: f.max.toFixed(1) })),
                        ...(romData.finger.rightFingers || []).map((f, i) => ({ name: `Sağ Parmak ${i + 1}`, min: f.min.toFixed(1), max: f.max.toFixed(1) }))
                      ]
                } />}
            </div>
        ) : (
            <Card><CardContent><p className="text-center text-muted-foreground p-8">Bu seans için ROM verisi bulunamadı.</p></CardContent></Card>
        )}
    </div>
  );
}