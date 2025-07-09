"use client"

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

/**
 * Apple position data from position_log.json
 */
export interface ApplePositionData {
  timestamp: number;
  appleId: number;
  position: {
    x: number;
    y: number;
    z: number;
  };
  status: 'spawned' | 'grabbed' | 'dropped' | 'collected';
  type: 'fresh' | 'rotten';
}

/**
 * Apple session statistics
 */
export interface AppleSessionStats {
  sessionId: string;
  patientId: string;
  date: string;
  totalApples: number;
  applesCollected: number;
  successRate: number;
  averageTime: number;
  positionData: ApplePositionData[];
}

/**
 * Props for the AppleStatisticsChart component
 */
export interface AppleStatisticsChartProps {
  /** Session statistics data */
  sessionStats: AppleSessionStats[];
  /** Chart title */
  title?: string;
  /** Chart description */
  description?: string;
  /** Chart height */
  height?: number;
  /** Show different chart types in tabs */
  showTabs?: boolean;
}

/**
 * Apple Statistics Chart Component
 * 
 * Displays Apple Game statistics using Chart.js with react-chartjs-2.
 * Shows success rates over time, apple collection performance, and position tracking data.
 * 
 * @example
 * ```tsx
 * import { AppleStatisticsChart } from '@/components/statistics/AppleStatisticsChart';
 * 
 * const sessionData = [
 *   {
 *     sessionId: "session_1",
 *     patientId: "patient_1", 
 *     date: "2024-01-15",
 *     totalApples: 10,
 *     applesCollected: 8,
 *     successRate: 80,
 *     averageTime: 12.5,
 *     positionData: []
 *   }
 * ];
 * 
 * <AppleStatisticsChart 
 *   sessionStats={sessionData}
 *   title="Elma Oyunu İstatistikleri"
 *   showTabs={true}
 * />
 * ```
 */
export function AppleStatisticsChart({ 
  sessionStats, 
  title = "Elma Oyunu İstatistikleri",
  description = "Apple Game performans verileri ve başarı oranları",
  height = 400,
  showTabs = true
}: AppleStatisticsChartProps) {

  // Prepare data for success rate line chart
  const successRateData = {
    labels: sessionStats.map(stat => new Date(stat.date).toLocaleDateString('tr-TR')),
    datasets: [
      {
        label: 'Başarı Oranı (%)',
        data: sessionStats.map(stat => stat.successRate),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Prepare data for apple collection bar chart
  const appleCollectionData = {
    labels: sessionStats.map(stat => new Date(stat.date).toLocaleDateString('tr-TR')),
    datasets: [
      {
        label: 'Toplanan Elmalar',
        data: sessionStats.map(stat => stat.applesCollected),
        backgroundColor: 'rgba(34, 197, 94, 0.6)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
      },
      {
        label: 'Toplam Elmalar',
        data: sessionStats.map(stat => stat.totalApples),
        backgroundColor: 'rgba(156, 163, 175, 0.6)',
        borderColor: 'rgb(156, 163, 175)',
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for performance breakdown (doughnut chart)
  const totalCollected = sessionStats.reduce((sum, stat) => sum + stat.applesCollected, 0);
  const totalApples = sessionStats.reduce((sum, stat) => sum + stat.totalApples, 0);
  const missed = totalApples - totalCollected;

  const performanceBreakdownData = {
    labels: ['Başarılı', 'Kaçırılan'],
    datasets: [
      {
        data: [totalCollected, missed],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 2,
      },
    ],
  };

  // Chart options
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value: string | number) {
            return value + '%';
          },
        },
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
  };

  if (!showTabs) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ height: `${height}px` }}>
            <Line data={successRateData} options={lineChartOptions} />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="success-rate" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="success-rate">Başarı Oranı</TabsTrigger>
            <TabsTrigger value="collection">Elma Toplama</TabsTrigger>
            <TabsTrigger value="breakdown">Genel Durum</TabsTrigger>
          </TabsList>
          
          <TabsContent value="success-rate">
            <div style={{ height: `${height}px` }}>
              <Line data={successRateData} options={lineChartOptions} />
            </div>
          </TabsContent>
          
          <TabsContent value="collection">
            <div style={{ height: `${height}px` }}>
              <Bar data={appleCollectionData} options={barChartOptions} />
            </div>
          </TabsContent>
          
          <TabsContent value="breakdown">
            <div style={{ height: `${height}px` }} className="flex items-center justify-center">
              <div style={{ width: '60%', height: '100%' }}>
                <Doughnut data={performanceBreakdownData} options={doughnutChartOptions} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// Example data for testing and documentation
export const sampleAppleSessionStats: AppleSessionStats[] = [
  {
    sessionId: "session_1",
    patientId: "patient_1",
    date: "2024-01-15",
    totalApples: 10,
    applesCollected: 8,
    successRate: 80,
    averageTime: 12.5,
    positionData: [
      {
        timestamp: 1642291200000,
        appleId: 1,
        position: { x: 1.2, y: 0.5, z: 2.1 },
        status: 'collected',
        type: 'fresh'
      },
      {
        timestamp: 1642291205000,
        appleId: 2,
        position: { x: -0.8, y: 1.1, z: 1.8 },
        status: 'collected',
        type: 'fresh'
      }
    ]
  },
  {
    sessionId: "session_2",
    patientId: "patient_1",
    date: "2024-01-16",
    totalApples: 12,
    applesCollected: 10,
    successRate: 83.3,
    averageTime: 11.2,
    positionData: []
  },
  {
    sessionId: "session_3",
    patientId: "patient_1",
    date: "2024-01-17",
    totalApples: 15,
    applesCollected: 13,
    successRate: 86.7,
    averageTime: 10.8,
    positionData: []
  },
  {
    sessionId: "session_4",
    patientId: "patient_1",
    date: "2024-01-18",
    totalApples: 10,
    applesCollected: 9,
    successRate: 90,
    averageTime: 9.5,
    positionData: []
  }
];