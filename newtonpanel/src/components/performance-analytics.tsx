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

import React, { useState, useEffect, useMemo } from 'react';
import { DateRange } from "react-day-picker"
import { addDays, format } from "date-fns"
import { Patient, Session, GameConfig, GameResult as GameResultType, Rom, SessionResult } from '@/types/firebase';
import {
  getAllPatients,
  getSessionsByPatientId,
  getGameConfigsByIds,
  getGameResultsByIds,
  getAllRoms
} from '@/services/firebaseServices';
import {
  calculatePerformanceMetrics,
  generateImprovementSuggestions,
  PerformanceMetrics,
} from '@/lib/analytics';

import { OverviewCards } from './performance-analytics/OverviewCards';
import { ProgressChart } from './performance-analytics/ProgressChart';
import { GamePreferenceChart } from './performance-analytics/GamePreferenceChart';
import { FingerPerformance } from './performance-analytics/FingerPerformance';
import { DifficultyAnalysis } from './performance-analytics/DifficultyAnalysis';
import { SessionDetails } from './performance-analytics/SessionDetails';
import { RomAnalysis } from './performance-analytics/RomAnalysis';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { PatientHeader } from '../components/patient-profile/PatientHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  User,
  BarChart3,
  AlertTriangle,
  History,
  Gamepad2,
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  Activity,
  Award,
  Calendar as CalendarIcon,
  Zap
} from 'lucide-react';

// Recharts bileşenleri
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  AreaChart,
  Area
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

// Grafik renkleri
const CHART_COLORS = {
  primary: '#3B82F6',
  secondary: '#10B981',
  accent: '#F59E0B',
  danger: '#EF4444',
  success: '#22C55E',
  warning: '#F97316'
};

export default function PerformanceAnalysis() {
  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [gameConfigs, setGameConfigs] = useState<Record<string, GameConfig>>({});
  const [gameResults, setGameResults] = useState<Record<string, SessionResult>>({});
  const [roms, setRoms] = useState<Record<string, Rom>>({});
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  const [loading, setLoading] = useState(true);
  const [loadingPatientData, setLoadingPatientData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // Başlangıçta tüm hastaları yükle
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const patients = await getAllPatients();
        setAllPatients(patients);
      } catch (err) {
        console.error("Hastalar yüklenemedi:", err);
        setError('Hastalar yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Filtrelenmiş verileri hesapla
  const filteredData = useMemo(() => {
    if (!sessions.length) return { filteredSessions: [], filteredResults: {}, filteredConfigs: {}, filteredRoms: {} };

    const filteredSessions = sessions.filter(session => {
        const sessionDate = new Date(session.date);
        if (date?.from && sessionDate < date.from) return false;
        if (date?.to && sessionDate > date.to) return false;
        return true;
    });

    const filteredSessionIds = new Set(filteredSessions.map(s => s.id));
    const filteredResults: Record<string, SessionResult> = {};
    const filteredConfigs: Record<string, GameConfig> = {};
    const filteredRoms: Record<string, Rom> = {};

    for (const key in gameResults) {
        const parts = key.split('_');
        if (parts.length < 3) continue;

        const sessionNumber = parts[parts.length - 1];
        const patientId = key.substring(0, key.indexOf(`_result`));
        
        const sessionId = `${patientId}_session_${sessionNumber}`;

        if (filteredSessionIds.has(sessionId)) {
            filteredResults[key] = gameResults[key];
        }
    }
    
    for (const key in gameConfigs) {
        filteredConfigs[key] = gameConfigs[key];
    }

    for (const key in roms) {
        filteredRoms[key] = roms[key];
    }

    return { filteredSessions, filteredResults, filteredConfigs, filteredRoms };
  }, [sessions, gameResults, gameConfigs, roms, date]);

  // Metrikleri filtrelenmiş veriye göre hesapla
  useEffect(() => {
    if (filteredData.filteredSessions.length > 0) {
        const metrics = calculatePerformanceMetrics(
            filteredData.filteredSessions,
            filteredData.filteredResults,
            filteredData.filteredConfigs,
            filteredData.filteredRoms
        );
        setPerformanceMetrics(metrics);
    } else {
        setPerformanceMetrics(null);
    }
  }, [filteredData]);

  // Seçili hasta değiştiğinde verileri yükle
  useEffect(() => {
    const loadPatientSpecificData = async () => {
      if (!selectedPatientId) return;

      setLoadingPatientData(true);
      setError(null);
      setSessions([]);
      setGameConfigs({});
      setGameResults({});
      setRoms({});
      setPerformanceMetrics(null);

      try {
        const sessionData = await getSessionsByPatientId(selectedPatientId);
        setSessions(sessionData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

        if (sessionData.length > 0) {
          const configIds = sessionData.map(s => s.gameConfigID).filter(Boolean) as string[];
          const resultIds = sessionData.flatMap(s => {
            const sessionNumber = s.id.split('_').pop();
            if (!sessionNumber) return [];
            return [
              `${s.patientID}_result_${sessionNumber}`,
              `${s.patientID}_results_${sessionNumber}`
            ];
          });

          const [configData, resultData, romData] = await Promise.all([
            getGameConfigsByIds(configIds),
            getGameResultsByIds(resultIds),
            getAllRoms()
          ]);

          setGameConfigs(configData);
          setGameResults(resultData as Record<string, SessionResult>);
          setRoms(romData);
        }
      } catch (err: any) {
        console.error("Hasta verileri yüklenemedi:", err);
        setError(err.message || 'Hastanın seans verileri yüklenirken bir hata oluştu.');
      } finally {
        setLoadingPatientData(false);
      }
    };

    loadPatientSpecificData();
  }, [selectedPatientId]);

  const selectedPatient = useMemo(() => 
    allPatients.find(p => p.id === selectedPatientId), 
    [selectedPatientId, allPatients]
  );

// Render fonksiyonları



  return (
    <div className="space-y-6 p-4 md:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Başlık ve Hasta Seçimi */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Gelişmiş Performans Analizi
          </CardTitle>
          <CardDescription>
            Hasta seçerek detaylı performans analizini ve grafiklerini görüntüleyin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Hastalar yükleniyor...
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <User className="text-muted-foreground" />
                <Select value={selectedPatientId || ""} onValueChange={setSelectedPatientId}>
                  <SelectTrigger className="w-full md:w-[280px]">
                    <SelectValue placeholder="Analiz için bir hasta seçin..." />
                  </SelectTrigger>
                  <SelectContent>
                    {allPatients.map(patient => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant={"outline"}
                      className="w-full md:w-[300px] justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date?.from ? (
                        date.to ? (
                          <>
                            {format(date.from, "LLL dd, y")} -{" "}
                            {format(date.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(date.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Tarih aralığı seçin</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={date?.from}
                      selected={date}
                      onSelect={setDate}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Hata Mesajı */}
      {error && (
        <Card className="bg-destructive/10 border-destructive/20">
          <CardContent className="p-4 text-center text-destructive">
            <AlertTriangle className="mx-auto mb-2 h-5 w-5" />
            {error}
          </CardContent>
        </Card>
      )}

      {/* Yükleniyor (İskelet Arayüzü) */}
      {loadingPatientData && (
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
      )}

      {/* Ana İçerik */}
      {selectedPatientId && !loadingPatientData && selectedPatient && (
        <div className="animate-in fade-in-50 space-y-6">
          {/* Hasta Bilgileri */}
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
                {performanceMetrics && <OverviewCards metrics={performanceMetrics} />}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {performanceMetrics && <ProgressChart metrics={performanceMetrics} />}
                  {performanceMetrics && <GamePreferenceChart metrics={performanceMetrics} />}
                </div>
              </TabsContent>

              <TabsContent value="performance" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {performanceMetrics && <FingerPerformance metrics={performanceMetrics} />}
                  {performanceMetrics && <DifficultyAnalysis metrics={performanceMetrics} />}
                </div>
              </TabsContent>

              <TabsContent value="rom" className="space-y-6">
                {performanceMetrics && <RomAnalysis metrics={performanceMetrics} />}
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
            <Card>
              <CardContent className="p-10 text-center">
                <History className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Veri Bulunmuyor</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Seçilen hasta için henüz kaydedilmiş seans verisi bulunmamaktadır.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}