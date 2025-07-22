// src/components/performance-analytics/RomAnalysis.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PerformanceMetrics } from '@/lib/analytics';
import { GitBranch } from 'lucide-react';
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

interface RomAnalysisProps {
  metrics: PerformanceMetrics;
}

const CHART_COLORS = {
  primary: '#3B82F6',
};

export const RomAnalysis: React.FC<RomAnalysisProps> = ({ metrics }) => {
  if (!metrics.romAnalysis.length) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GitBranch className="h-5 w-5" />
          Eklemlerin Hareket Genişliği (ROM) Analizi
        </CardTitle>
        <CardDescription>Her parmağın ortalama hareket genişliği.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metrics.romAnalysis} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis dataKey="finger" type="category" width={100} />
              <Tooltip formatter={(value: number) => [`${value}%`, 'ROM']} />
              <Legend />
              <Bar 
                dataKey="rom" 
                name="Hareket Genişliği"
                fill={CHART_COLORS.primary}
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};