// src/components/performance-analytics/FingerPerformance.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PerformanceMetrics } from '@/lib/analytics';
import { Activity } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface FingerPerformanceProps {
  metrics: PerformanceMetrics;
}

const CHART_COLORS = {
  accent: '#F59E0B',
};

export const FingerPerformance: React.FC<FingerPerformanceProps> = ({ metrics }) => {
  if (!metrics.fingerPerformance.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Parmak Performansı
        </CardTitle>
        <CardDescription>Her parmağın bireysel başarı oranı</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metrics.fingerPerformance} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis dataKey="finger" type="category" width={100} />
              <Tooltip formatter={(value: number) => [`${value}%`, 'Başarı Oranı']} />
              <Legend />
              <Bar 
                dataKey="accuracy" 
                name="Başarı"
                fill={CHART_COLORS.accent}
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};