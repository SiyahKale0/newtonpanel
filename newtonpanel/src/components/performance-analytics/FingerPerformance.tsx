"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PerformanceMetrics } from '@/lib/analytics';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Activity } from 'lucide-react';

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

export const FingerPerformance = ({ metrics }: FingerHeatmapProps) => {
  // Veriyi daha kolay erişim için bir haritaya dönüştürelim
  const fingerData = new Map(metrics.fingerPerformance.map(f => [f.finger, f.accuracy]));

  const renderHand = (hand: 'left' | 'right') => {
    const fingerOrder = FINGER_LAYOUT[hand];
    // İstenen sıralama için displayOrder'ı doğrudan fingerOrder olarak ayarlıyoruz.
    const displayOrder = fingerOrder;

    return (
      <div className="flex flex-col items-center">
        <h4 className="font-semibold mb-3 text-base md:text-lg">{hand === 'left' ? 'Sol El' : 'Sağ El'}</h4>
        <div className="flex items-end gap-1.5 sm:gap-2 h-40">
          {displayOrder.map((fingerName) => {
            const accuracy = fingerData.get(fingerName);
            const color = getAccuracyColor(accuracy);
            
            // Parmakların göreceli yüksekliklerini daha gerçekçi olacak şekilde ayarlayalım
            const heightClass = {
                "Başparmak": 'h-20',
                "İşaret Parmağı": 'h-28',
                "Orta Parmak": 'h-32',
                "Yüzük Parmağı": 'h-28',
                "Serçe Parmağı": 'h-24'
            }[fingerName.split(' ').slice(1).join(' ')] || 'h-28';


            return (
              <TooltipProvider key={fingerName}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col items-center gap-1.5">
                      <div
                        className={`w-7 sm:w-8 rounded-md ${color} ${heightClass} transition-all duration-300 flex items-center justify-center text-white font-bold text-xs shadow-md hover:shadow-lg`}
                      >
                        {accuracy !== undefined ? `${accuracy}%` : 'N/A'}
                      </div>
                      <span className="text-xs text-center font-medium text-muted-foreground w-10 truncate">{fingerName.split(' ')[1]}</span>
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
        <CardTitle className="flex items-center gap-2"><Activity className="w-5 h-5" /> Parmak Performansı Isı Haritası</CardTitle>
        <CardDescription>Her bir parmağın doğruluk oranını renk kodlarıyla görün.</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex flex-col lg:flex-row justify-around items-center gap-10">
          {renderHand('left')}
          {renderHand('right')}
        </div>
        <div className="flex justify-center flex-wrap mt-6 gap-x-4 gap-y-2 items-center text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-red-600 rounded-sm"></div> Düşük (&lt;50)</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-orange-500 rounded-sm"></div> Orta (50-69)</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-yellow-500 rounded-sm"></div> İyi (70-89)</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-green-600 rounded-sm"></div> Mükemmel (90+)</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-gray-300 rounded-sm"></div> Veri Yok</div>
        </div>
      </CardContent>
    </Card>
  );
};
