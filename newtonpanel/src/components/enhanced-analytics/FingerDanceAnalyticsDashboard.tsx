// src/components/enhanced-analytics/FingerDanceAnalyticsDashboard.tsx

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAnalysesByPatient, getProgressReportsByPatient } from '@/services/analyticsService';
import { getGameResultsByPatient, analyzeFingerDanceResult } from '@/services/gameResultService';
import { PerformanceAnalysis, PatientProgressReport, FingerDanceResult } from '@/types/firebase';

interface FingerDanceAnalyticsDashboardProps {
    patientId: string;
}

export function FingerDanceAnalyticsDashboard({ patientId }: FingerDanceAnalyticsDashboardProps) {
    const [analyses, setAnalyses] = useState<PerformanceAnalysis[]>([]);
    const [reports, setReports] = useState<PatientProgressReport[]>([]);
    const [gameResults, setGameResults] = useState<FingerDanceResult[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAnalyticsData();
    }, [patientId]);

    const loadAnalyticsData = async () => {
        try {
            setLoading(true);
            
            // Tüm analiz verilerini yükle
            const [analysesData, reportsData, gameResultsData] = await Promise.all([
                getAnalysesByPatient(patientId),
                getProgressReportsByPatient(patientId),
                getGameResultsByPatient(patientId)
            ]);

            setAnalyses(analysesData);
            setReports(reportsData);
            
            // Sadece FingerDance sonuçlarını filtrele
            const fingerDanceResults = gameResultsData.filter(
                result => result.gameType === 'fingerDance'
            ) as FingerDanceResult[];
            
            setGameResults(fingerDanceResults);
        } catch (error) {
            console.error('Analytics verisi yüklenirken hata:', error);
        } finally {
            setLoading(false);
        }
    };

    const getLatestAnalysis = () => {
        return analyses.length > 0 ? analyses[0] : null;
    };

    const getLatestReport = () => {
        return reports.length > 0 ? reports[0] : null;
    };

    const getFingerPerformanceStats = () => {
        if (gameResults.length === 0) return null;

        const latestResult = gameResults[0];
        return analyzeFingerDanceResult(latestResult);
    };

    const calculateAverageAccuracy = () => {
        if (gameResults.length === 0) return 0;
        
        const totalAccuracy = gameResults.reduce((sum, result) => sum + result.performance.accuracy, 0);
        return Math.round(totalAccuracy / gameResults.length);
    };

    const calculateImprovementTrend = () => {
        if (gameResults.length < 2) return 'stable';
        
        const recent = gameResults.slice(0, 3);
        const older = gameResults.slice(3, 6);
        
        const recentAvg = recent.reduce((sum, r) => sum + r.score, 0) / recent.length;
        const olderAvg = older.length > 0 ? older.reduce((sum, r) => sum + r.score, 0) / older.length : recentAvg;
        
        if (recentAvg > olderAvg * 1.05) return 'improving';
        if (recentAvg < olderAvg * 0.95) return 'declining';
        return 'stable';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg">Analytics verileri yükleniyor...</div>
            </div>
        );
    }

    const latestAnalysis = getLatestAnalysis();
    const latestReport = getLatestReport();
    const fingerStats = getFingerPerformanceStats();
    const averageAccuracy = calculateAverageAccuracy();
    const improvementTrend = calculateImprovementTrend();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">FingerDance Analytics Dashboard</h2>
                <button 
                    onClick={loadAnalyticsData}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Yenile
                </button>
            </div>

            {/* Genel Performans Metrikleri */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Ortalama Doğruluk</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{averageAccuracy}%</div>
                        <p className="text-xs text-muted-foreground">
                            Son {gameResults.length} seansın ortalaması
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Toplam Seans</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{gameResults.length}</div>
                        <p className="text-xs text-muted-foreground">
                            FingerDance oyunu
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">İlerleme Trendi</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${
                            improvementTrend === 'improving' ? 'text-green-600' :
                            improvementTrend === 'declining' ? 'text-red-600' : 'text-yellow-600'
                        }`}>
                            {improvementTrend === 'improving' ? '↗️ Gelişiyor' :
                             improvementTrend === 'declining' ? '↘️ Düşüyor' : '→ Sabit'}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">En Yüksek Skor</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {gameResults.length > 0 ? Math.max(...gameResults.map(r => r.score)) : 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Şimdiye kadarki en iyi
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Parmak Performans Analizi */}
            {fingerStats && (
                <Card>
                    <CardHeader>
                        <CardTitle>Parmak Performans Analizi</CardTitle>
                        <CardDescription>Son seanstaki parmak bazında performans</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-5 gap-4">
                            {Object.entries(fingerStats.fingerEfficiency).map(([fingerId, efficiency]) => (
                                <div key={fingerId} className="text-center">
                                    <div className="text-sm font-medium mb-2">
                                        Parmak {fingerId}
                                    </div>
                                    <div className={`text-lg font-bold ${
                                        efficiency > 80 ? 'text-green-600' :
                                        efficiency > 60 ? 'text-yellow-600' : 'text-red-600'
                                    }`}>
                                        {Math.round(efficiency)}%
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Doğruluk İstatistikleri */}
            {fingerStats && (
                <Card>
                    <CardHeader>
                        <CardTitle>Doğruluk İstatistikleri</CardTitle>
                        <CardDescription>Son seanstaki vuruş kalitesi dağılımı</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-4 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">
                                    {fingerStats.accuracyStats.perfect}
                                </div>
                                <div className="text-sm text-muted-foreground">Mükemmel</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">
                                    {fingerStats.accuracyStats.good}
                                </div>
                                <div className="text-sm text-muted-foreground">İyi</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-yellow-600">
                                    {fingerStats.accuracyStats.poor}
                                </div>
                                <div className="text-sm text-muted-foreground">Zayıf</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-red-600">
                                    {fingerStats.accuracyStats.missed}
                                </div>
                                <div className="text-sm text-muted-foreground">Kaçırılan</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Son Analiz Özeti */}
            {latestAnalysis && (
                <Card>
                    <CardHeader>
                        <CardTitle>Son Analiz Özeti</CardTitle>
                        <CardDescription>
                            {new Date(latestAnalysis.analysisDate).toLocaleDateString('tr-TR')} tarihli analiz
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div>
                                <div className="text-sm text-muted-foreground">Toplam Skor</div>
                                <div className="text-lg font-semibold">
                                    {Math.round(latestAnalysis.overallMetrics.totalScore)}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Gelişim Oranı</div>
                                <div className="text-lg font-semibold">
                                    {latestAnalysis.overallMetrics.improvementRate}%
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Tutarlılık</div>
                                <div className="text-lg font-semibold">
                                    {Math.round(latestAnalysis.overallMetrics.consistencyScore)}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Dayanıklılık</div>
                                <div className="text-lg font-semibold">
                                    {Math.round(latestAnalysis.overallMetrics.enduranceScore)}
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-muted-foreground">Motivasyon</div>
                                <div className="text-lg font-semibold">
                                    {Math.round(latestAnalysis.overallMetrics.motivationScore)}
                                </div>
                            </div>
                        </div>

                        {/* Öneriler */}
                        <div className="border-t pt-4">
                            <h4 className="font-semibold mb-2">Öneriler</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Oyun Ayarları</div>
                                    <div className="text-sm">
                                        Zorluk: {latestAnalysis.recommendations.gameSettings.difficulty}<br/>
                                        Süre: {latestAnalysis.recommendations.gameSettings.duration}<br/>
                                        Sıklık: {latestAnalysis.recommendations.gameSettings.frequency}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Terapi Odak Alanları</div>
                                    <ul className="text-sm">
                                        {latestAnalysis.recommendations.therapyFocus.map((focus, index) => (
                                            <li key={index}>• {focus}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-muted-foreground">Sonraki Hedefler</div>
                                    <ul className="text-sm">
                                        {latestAnalysis.recommendations.nextSessionGoals.map((goal, index) => (
                                            <li key={index}>• {goal}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Gelişim Alanları */}
            {fingerStats && fingerStats.improvementAreas.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Gelişim Alanları</CardTitle>
                        <CardDescription>Odaklanılması gereken konular</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {fingerStats.improvementAreas.map((area, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                    <span className="text-sm">{area}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Son Oyun Seansları */}
            <Card>
                <CardHeader>
                    <CardTitle>Son Oyun Seansları</CardTitle>
                    <CardDescription>Son 5 FingerDance seansının özeti</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {gameResults.slice(0, 5).map((result, index) => (
                            <div key={result.id} className="flex items-center justify-between p-3 border rounded">
                                <div className="flex items-center space-x-4">
                                    <div className="text-sm font-medium">#{index + 1}</div>
                                    <div>
                                        <div className="font-medium">Skor: {result.score}</div>
                                        <div className="text-sm text-muted-foreground">
                                            Doğruluk: {Math.round(result.performance.accuracy)}% | 
                                            Combo: {result.combo} | 
                                            Hata: {result.mistakes}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {new Date(result.timing.gameStartTime).toLocaleDateString('tr-TR')}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default FingerDanceAnalyticsDashboard;