// src/components/performance-analytics/OverviewCards.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { PerformanceMetrics } from '@/lib/analytics';
import { Calendar, Target, Award, TrendingUp, TrendingDown } from 'lucide-react';

interface OverviewCardsProps {
  metrics: PerformanceMetrics;
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({ metrics }) => {
  const cards = [
    {
      title: "Toplam Seans",
      value: metrics.totalSessions,
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Ortalama Başarı",
      value: `${metrics.averageScore}%`,
      icon: Target,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "En Yüksek Skor",
      value: `${metrics.bestScore}%`,
      icon: Award,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50"
    },
    {
      title: "Gelişim Trendi",
      value: `${metrics.improvementTrend > 0 ? '+' : ''}${metrics.improvementTrend}%`,
      icon: metrics.improvementTrend >= 0 ? TrendingUp : TrendingDown,
      color: metrics.improvementTrend >= 0 ? "text-green-600" : "text-red-600",
      bgColor: metrics.improvementTrend >= 0 ? "bg-green-50" : "bg-red-50"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, index) => (
        <Card key={index}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className={`${card.bgColor} ${card.color} p-2 rounded-lg`}>
                <card.icon className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                <p className="text-2xl font-bold">{card.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};