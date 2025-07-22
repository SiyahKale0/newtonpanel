// src/components/performance-analytics/GamePreferenceChart.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PerformanceMetrics } from '@/lib/analytics';
import { Gamepad2 } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface GamePreferenceChartProps {
  metrics: PerformanceMetrics;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export const GamePreferenceChart: React.FC<GamePreferenceChartProps> = ({ metrics }) => {
  if (!metrics.gamePreference || Object.keys(metrics.gamePreference).length === 0) return null;

  const data = Object.entries(metrics.gamePreference).map(([game, count]) => ({
    name: game === 'fingerDance' ? 'Parmak Dansı' : game === 'appleGame' ? 'Elma Oyunu' : game,
    value: count
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gamepad2 className="h-5 w-5" />
          Oyun Tercihleri
        </CardTitle>
        <CardDescription>En çok oynanan oyun türleri</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number, name: string) => [value, data.find(d => d.name === name)?.name || name]}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};