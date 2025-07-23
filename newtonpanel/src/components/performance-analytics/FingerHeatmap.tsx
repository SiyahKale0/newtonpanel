"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PerformanceMetrics } from '@/lib/analytics';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface FingerHeatmapProps {
  metrics: PerformanceMetrics;
}

// Parmakların fiziksel düzene daha yakın bir sıralaması
const FINGER_LAYOUT = {
  left: ["Sol Serçe", "Sol Yüzük", "Sol Orta", "Sol İşaret", "Sol Başparmak"],
  right: ["Sağ Başparmak", "Sağ İşaret", "Sağ Orta", "Sağ Yüzük", "Sağ Serçe"]
};

// Doğruluk yüzdesine göre renk döndüren fonksiyon
const getAccuracyColor = (accuracy: number | undefined): string => {
  if (accuracy === undefined) return 'bg-gray-300 dark:bg-gray-700';
  if (accuracy >= 90) return 'bg-green-600';
  if (accuracy >= 80) return 'bg-green-500';
  if (accuracy >= 70) return 'bg-yellow-500';
  if (accuracy >= 60) return 'bg-yellow-400';
  if (accuracy >= 50) return 'bg-orange-500';
  return 'bg-red-600';
};

export const FingerHeatmap = ({ metrics }: FingerHeatmapProps) => {
  // Veriyi daha kolay erişim için bir haritaya dönüştürelim
  const fingerData = new Map(metrics.fingerPerformance.map(f => [f.finger, f.accuracy]));

  const renderHand = (hand: 'left' | 'right') => {
    return (
      <div className="flex flex-col items-center">
        <h4 className="font-semibold mb-3 text-lg">{hand === 'left' ? 'Sol El' : 'Sağ El'}</h4>
        <div className="flex items-end gap-3 h-48">
          {FINGER_LAYOUT[hand].map((fingerName, index) => {
            const accuracy = fingerData.get(fingerName);
            const color = getAccuracyColor(accuracy);
            // Başparmakları diğerlerinden biraz daha kısa ve farklı konumda gösterelim
            const isThumb = fingerName.includes("Başparmak");
            const height = isThumb ? 'h-24' : `h-32`; // Simplified for now

            return (
              <TooltipProvider key={fingerName}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col items-center gap-2">
                      <div
                        className={`w-10 ${height} rounded-md ${color} transition-all duration-300 flex items-center justify-center text-white font-bold text-sm shadow-md hover:shadow-lg`}
                      >
                        {accuracy !== undefined ? `${accuracy}%` : 'N/A'}
                      </div>
                      <span className="text-xs text-center font-medium text-muted-foreground">{fingerName.split(' ')[1]}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{fingerName}: {accuracy !== undefined ? `%${accuracy} başarı` : 'Veri yok'}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Parmak Performansı Isı Haritası</CardTitle>
        <CardDescription>Her bir parmağın doğruluk oranını renk kodlarıyla görün.</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex flex-col md:flex-row justify-around items-center gap-12">
          {renderHand('left')}
          {renderHand('right')}
        </div>
        <div className="flex justify-center mt-8 gap-4 items-center text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-red-600 rounded-sm"></div> Düşük</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-orange-500 rounded-sm"></div> Orta</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-yellow-500 rounded-sm"></div> İyi</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-green-600 rounded-sm"></div> Mükemmel</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-gray-300 rounded-sm"></div> Veri Yok</div>
        </div>
      </CardContent>
    </Card>
  );
};