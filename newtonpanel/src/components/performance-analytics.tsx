/**
 * @file src/components/performance-analytics.tsx
 * @description
 * This component provides a comprehensive dashboard for analyzing patient performance data.
 * It allows users to select a patient and a date range to view various metrics,
 * including overview stats, weekly progress, game preferences, finger performance,
 * and difficulty analysis. The component is structured with tabs for easy navigation
 * between different analytical views. It fetches data from Firebase and uses
 * Recharts for data visualization.
 */
"use client";

import React from 'react';
import { usePerformanceAnalytics } from '@/hooks/use-performance-analytics';
import { generateImprovementSuggestions } from '@/lib/analytics';

import { AnalyticsHeader } from './performance-analytics/AnalyticsHeader';
import { OverviewCards } from './performance-analytics/OverviewCards';
import { ProgressChart } from './performance-analytics/ProgressChart';
import { GamePreferenceChart } from './performance-analytics/GamePreferenceChart';
import { FingerPerformance } from './performance-analytics/FingerPerformance';
import { DifficultyAnalysis } from './performance-analytics/DifficultyAnalysis';
import { SessionDetails } from './performance-analytics/SessionDetails';
import { RomAnalysis } from './performance-analytics/RomAnalysis';
import { PatientHeader } from '../components/patient-profile/PatientHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, History } from 'lucide-react';

const LoadingSkeleton = () => (
  <div className="space-y-6">
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-gray-200 rounded-md animate-pulse"></div>
          <div className="h-4 w-64 bg-gray-200 rounded-md animate-pulse"></div>
        </div>
        <div className="h-10 w-24 bg-gray-200 rounded-md animate-pulse"></div>
      </CardHeader>
    </Card>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {[...Array(4)].map((_, i) => (
        <Card key={i}><CardContent className="p-6 h-28 bg-gray-200 rounded-lg animate-pulse"></CardContent></Card>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card><CardContent className="p-6 h-80 bg-gray-200 rounded-lg animate-pulse"></CardContent></Card>
      <Card><CardContent className="p-6 h-80 bg-gray-200 rounded-lg animate-pulse"></CardContent></Card>
    </div>
  </div>
);

const NoData = () => (
  <Card>
    <CardContent className="p-10 text-center">
      <History className="mx-auto h-12 w-12 text-muted-foreground" />
      <h3 className="mt-4 text-lg font-semibold">Veri Bulunmuyor</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Seçilen hasta için henüz kaydedilmiş seans verisi bulunmamaktadır.
      </p>
    </CardContent>
  </Card>
);

const ErrorDisplay = ({ error }: { error: string }) => (
  <Card className="bg-destructive/10 border-destructive/20">
    <CardContent className="p-4 text-center text-destructive">
      <AlertTriangle className="mx-auto mb-2 h-5 w-5" />
      {error}
    </CardContent>
  </Card>
);

export default function PerformanceAnalysis() {
  const {
    allPatients,
    selectedPatient,
    selectedPatientId,
    setSelectedPatientId,
    date,
    setDate,
    loading,
    loadingPatientData,
    error,
    filteredData,
    performanceMetrics,
  } = usePerformanceAnalytics();

  return (
    <div className="space-y-6 p-4 md:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <AnalyticsHeader
        loading={loading}
        allPatients={allPatients}
        selectedPatientId={selectedPatientId}
        onPatientChange={setSelectedPatientId}
        date={date}
        onDateChange={setDate}
      />

      {error && <ErrorDisplay error={error} />}

      {loadingPatientData && <LoadingSkeleton />}

      {selectedPatientId && !loadingPatientData && selectedPatient && (
        <div className="animate-in fade-in-50 space-y-6">
          <PatientHeader patient={selectedPatient} sessionCount={filteredData.filteredSessions.length} />

          {filteredData.filteredSessions.length > 0 && performanceMetrics ? (
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
                <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
                <TabsTrigger value="performance">Performans</TabsTrigger>
                <TabsTrigger value="rom">ROM Analizi</TabsTrigger>
                <TabsTrigger value="analysis">Detaylı Analiz</TabsTrigger>
                <TabsTrigger value="history">Geçmiş</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <OverviewCards metrics={performanceMetrics} />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ProgressChart metrics={performanceMetrics} />
                  <GamePreferenceChart metrics={performanceMetrics} />
                </div>
              </TabsContent>

              <TabsContent value="performance" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <FingerPerformance metrics={performanceMetrics} />
                  <DifficultyAnalysis metrics={performanceMetrics} />
                </div>
              </TabsContent>

              <TabsContent value="rom" className="space-y-6">
                <RomAnalysis metrics={performanceMetrics} />
              </TabsContent>

              <TabsContent value="analysis" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Tutarlılık Skoru</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {Math.round(performanceMetrics.sessionConsistency)}%
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Seanslar arası düzenlilik
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">En Aktif Oyun</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-lg font-bold text-blue-600 truncate">
                        {Object.keys(performanceMetrics.gamePreference).length > 0
                          ? (Object.entries(performanceMetrics.gamePreference).reduce((a, b) => a[1] > b[1] ? a : b)[0] === 'fingerDance' ? 'Parmak Dansı' : 'Elma Oyunu')
                          : 'N/A'}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        En çok tercih edilen aktivite
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Ortalama Süre</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-purple-600">
                        {performanceMetrics.averageSessionDuration}dk
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Seans başına ortalama
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>İyileşme Önerileri</CardTitle>
                    <CardDescription>Analiz sonuçlarına dayalı kişiselleştirilmiş tavsiyeler.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4 text-sm">
                      {generateImprovementSuggestions(performanceMetrics).map((suggestion, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            <suggestion.icon className={`h-5 w-5 ${suggestion.color} mt-0.5`} />
                          </div>
                          <span className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: suggestion.text }} />
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="history" className="space-y-6">
                <SessionDetails sessions={filteredData.filteredSessions} gameResults={filteredData.filteredResults} />
              </TabsContent>

            </Tabs>
          ) : (
            <NoData />
          )}
        </div>
      )}
    </div>
  );
}