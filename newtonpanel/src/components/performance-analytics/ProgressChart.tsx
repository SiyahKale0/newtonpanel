// src/components/performance-analytics/ProgressChart.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PerformanceMetrics } from '@/lib/analytics';
import { TrendingUp } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ProgressChartProps {
  metrics: PerformanceMetrics;
}

const CHART_COLORS = {
  primary: '#3B82F6',
  secondary: '#10B981',
};

export const ProgressChart: React.FC<ProgressChartProps> = ({ metrics }) => {
  if (!metrics.weeklyProgress.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Haftalık İlerleme
        </CardTitle>
        <CardDescription>Zaman içindeki performans gelişimi</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={metrics.weeklyProgress}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis yAxisId="left" orientation="left" stroke={CHART_COLORS.primary} />
              <YAxis yAxisId="right" orientation="right" stroke={CHART_COLORS.secondary} />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  `${value}${name === 'averageScore' ? '%' : ''}`,
                  name === 'averageScore' ? 'Ortalama Skor' : 'Seans Sayısı'
                ]}
              />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="averageScore" 
                name="Ortalama Skor"
                stroke={CHART_COLORS.primary} 
                strokeWidth={3}
                dot={{ fill: CHART_COLORS.primary, strokeWidth: 2, r: 4 }}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="sessions" 
                name="Seans Sayısı"
                stroke={CHART_COLORS.secondary} 
                strokeWidth={2}
                dot={{ fill: CHART_COLORS.secondary, strokeWidth: 2, r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};