// src/components/performance-analytics/DifficultyAnalysis.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PerformanceMetrics } from '@/lib/analytics';
import { Zap } from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface DifficultyAnalysisProps {
  metrics: PerformanceMetrics;
}

const CHART_COLORS = {
  danger: '#EF4444',
};

export const DifficultyAnalysis: React.FC<DifficultyAnalysisProps> = ({ metrics }) => {
  if (!metrics.difficultyProgress.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Zorluk Seviyesi Analizi
        </CardTitle>
        <CardDescription>Her zorluk seviyesindeki başarı oranları</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={metrics.difficultyProgress}>
              <PolarGrid />
              <PolarAngleAxis dataKey="level" tickFormatter={(level) => `Seviye ${level}`} />
              <PolarRadiusAxis angle={30} domain={[0, 100]}/>
              <Radar name="Başarı Oranı" dataKey="successRate" stroke={CHART_COLORS.danger} fill={CHART_COLORS.danger} fillOpacity={0.6} />
              <Legend />
              <Tooltip formatter={(value: number) => [`${value}%`, 'Başarı Oranı']} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};