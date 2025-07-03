"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PerformanceFilter } from "./performance-analytics/PerformanceFilter";
import { PerformanceSummaryCards } from "./performance-analytics/PerformanceSummaryCards";
import { PatientPerformanceTable } from "./performance-analytics/PatientPerformanceTable";
import { TimeAnalysisChart } from "./performance-analytics/TimeAnalysisChart";
import { LevelSuccessRateChart } from "./performance-analytics/LevelSuccessRateChart";
import { WeeklyProgressChart } from "./performance-analytics/WeeklyProgressChart";

export function PerformanceAnalytics({ selectedPatientId }: { selectedPatientId: string | null }) {
  return (
      <div className="space-y-6">
        <PerformanceFilter selectedPatientId={selectedPatientId} />

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
            <TabsTrigger value="detailed">Detaylı Analiz</TabsTrigger>
            <TabsTrigger value="progress">İlerleme Takibi</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <PerformanceSummaryCards />
            <PatientPerformanceTable />
          </TabsContent>

          <TabsContent value="detailed" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TimeAnalysisChart />
              <LevelSuccessRateChart />
            </div>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <WeeklyProgressChart />
          </TabsContent>
        </Tabs>
      </div>
  )
}