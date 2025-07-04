// src/services/patientProgressService.ts

import { Session } from '@/types/firebase';
import { getPatientSessions, getPatientSessionStatistics } from './sessionAnalysisService';
import { getRomMeasurementsByPatient, compareRomMeasurements, calculateRomScore } from './romAnalysisService';
import { getFingerDanceResultsByPatient } from './fingerDanceService';

export interface PatientProgressReport {
    patientInfo: {
        id: string;
        name: string;
        age: number;
        diagnosis: string;
        totalSessions: number;
    };
    sessionProgress: {
        totalSessions: number;
        averageAccuracy: number;
        averageMotivation: number;
        averageDuration: number;
        improvementTrend: number;
        gameTypeDistribution: { [key: string]: number };
        recentPerformance: {
            lastWeek: number;
            lastMonth: number;
            trend: 'improving' | 'stable' | 'declining';
        };
    };
    romProgress: {
        latestScore: number;
        improvementFromBaseline: number;
        measurementCount: number;
        keyImprovements: string[];
        areasNeedingWork: string[];
    };
    fingerDanceProgress?: {
        totalGamesPlayed: number;
        averageAccuracy: number;
        bestScore: number;
        favoriteFingers: string[];
        weakFingers: string[];
        songPreferences: { [song: string]: number };
    };
    recommendations: string[];
    alerts: string[];
}

/**
 * Generate comprehensive patient progress report
 */
export const generatePatientProgressReport = async (patientId: string): Promise<PatientProgressReport | null> => {
    // Get patient data (would need to import patient service)
    // For now, we'll use a placeholder
    const patientInfo = {
        id: patientId,
        name: 'Patient', // Would get from patient service
        age: 0,
        diagnosis: '',
        totalSessions: 0
    };

    // Get session statistics
    const sessionStats = await getPatientSessionStatistics(patientId);
    
    // Get ROM progress
    const romMeasurements = await getRomMeasurementsByPatient(patientId);
    const latestRom = romMeasurements[0];
    const baselineRom = romMeasurements[romMeasurements.length - 1];
    
    const romProgress = {
        latestScore: 0,
        improvementFromBaseline: 0,
        measurementCount: romMeasurements.length,
        keyImprovements: [] as string[],
        areasNeedingWork: [] as string[]
    };

    if (latestRom) {
        romProgress.latestScore = calculateRomScore(latestRom);
        
        if (baselineRom && baselineRom.id !== latestRom.id) {
            const comparison = compareRomMeasurements(baselineRom, latestRom);
            romProgress.improvementFromBaseline = comparison.overallImprovement;
            
            // Identify key improvements
            Object.entries(comparison.fingerRanges).forEach(([finger, ranges]) => {
                Object.entries(ranges).forEach(([movement, improvement]) => {
                    if (improvement > 5) {
                        romProgress.keyImprovements.push(`${finger} ${movement} (+${improvement.toFixed(1)}°)`);
                    } else if (improvement < -5) {
                        romProgress.areasNeedingWork.push(`${finger} ${movement} (${improvement.toFixed(1)}°)`);
                    }
                });
            });
        }
    }

    // Get FingerDance specific progress
    let fingerDanceProgress;
    const fingerDanceResults = await getFingerDanceResultsByPatient(patientId);
    
    if (fingerDanceResults.length > 0) {
        const fingerAccuracies = { finger1: [], finger2: [], finger3: [], finger4: [], finger5: [] } as { 
            [key: string]: number[] 
        };
        const songCounts: { [song: string]: number } = {};
        let totalAccuracy = 0;
        let bestScore = 0;

        fingerDanceResults.forEach(result => {
            totalAccuracy += result.accuracy;
            bestScore = Math.max(bestScore, result.score);
            
            // Track song preferences
            songCounts[result.songName] = (songCounts[result.songName] || 0) + 1;
            
            // Track finger performance
            Object.entries(result.fingerPerformance).forEach(([finger, performance]) => {
                fingerAccuracies[finger].push(performance.accuracy);
            });
        });

        // Calculate finger strengths and weaknesses
        const fingerAverages = Object.entries(fingerAccuracies).map(([finger, accuracies]) => ({
            finger,
            average: accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length
        }));

        const favoriteFingers = fingerAverages
            .filter(f => f.average > 0.8)
            .map(f => f.finger);
        
        const weakFingers = fingerAverages
            .filter(f => f.average < 0.6)
            .map(f => f.finger);

        fingerDanceProgress = {
            totalGamesPlayed: fingerDanceResults.length,
            averageAccuracy: totalAccuracy / fingerDanceResults.length,
            bestScore,
            favoriteFingers,
            weakFingers,
            songPreferences: songCounts
        };
    }

    // Calculate recent performance trend
    const sessions = await getPatientSessions(patientId);
    const recentPerformance = calculateRecentPerformance(sessions);

    // Generate recommendations and alerts
    const recommendations = generateRecommendations(sessionStats, romProgress, fingerDanceProgress);
    const alerts = generateAlerts(sessionStats, romProgress, recentPerformance);

    return {
        patientInfo: {
            ...patientInfo,
            totalSessions: sessionStats.totalSessions
        },
        sessionProgress: {
            ...sessionStats,
            recentPerformance
        },
        romProgress,
        fingerDanceProgress,
        recommendations,
        alerts
    };
};

/**
 * Calculate recent performance trends
 */
const calculateRecentPerformance = (sessions: Session[]) => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const lastWeekSessions = sessions.filter(s => new Date(s.date) >= oneWeekAgo);
    const lastMonthSessions = sessions.filter(s => new Date(s.date) >= oneMonthAgo);

    const lastWeekAccuracy = lastWeekSessions.reduce((sum, s) => 
        sum + (s.performanceMetrics?.averageAccuracy || 0), 0) / (lastWeekSessions.length || 1);
    
    const lastMonthAccuracy = lastMonthSessions.reduce((sum, s) => 
        sum + (s.performanceMetrics?.averageAccuracy || 0), 0) / (lastMonthSessions.length || 1);

    // Determine trend
    let trend: 'improving' | 'stable' | 'declining' = 'stable';
    const difference = lastWeekAccuracy - lastMonthAccuracy;
    
    if (difference > 0.05) trend = 'improving';
    else if (difference < -0.05) trend = 'declining';

    return {
        lastWeek: lastWeekAccuracy,
        lastMonth: lastMonthAccuracy,
        trend
    };
};

interface FingerDanceProgressData {
    totalGamesPlayed: number;
    averageAccuracy: number;
    bestScore: number;
    favoriteFingers: string[];
    weakFingers: string[];
    songPreferences: { [song: string]: number };
}

interface RomProgressData {
    latestScore: number;
    improvementFromBaseline: number;
    areasNeedingWork: string[];
}

interface SessionStatsData {
    averageAccuracy: number;
    averageMotivation: number;
    improvementTrend: number;
    totalSessions: number;
}

/**
 * Generate recommendations based on progress data
 */
const generateRecommendations = (
    sessionStats: SessionStatsData,
    romProgress: RomProgressData,
    fingerDanceProgress: FingerDanceProgressData | undefined
): string[] => {
    const recommendations: string[] = [];

    // Session-based recommendations
    if (sessionStats.averageAccuracy < 0.6) {
        recommendations.push('Oyun zorluğu azaltılmalı ve temel egzersizler artırılmalı');
    } else if (sessionStats.averageAccuracy > 0.85) {
        recommendations.push('Mükemmel ilerleme! Zorluğu artırarak yeni hedefler belirlenebilir');
    }

    if (sessionStats.averageMotivation < 5) {
        recommendations.push('Motivasyon düşük - oyun çeşitliliği artırılmalı');
    }

    if (sessionStats.improvementTrend < 0) {
        recommendations.push('İlerleme durdu - program ve hedefler gözden geçirilmeli');
    }

    // ROM-based recommendations
    if (romProgress.latestScore < 50) {
        recommendations.push('ROM skoru düşük - yoğun fizyoterapi önerilir');
    } else if (romProgress.latestScore > 80) {
        recommendations.push('ROM skoru mükemmel - mevcut program sürdürülmeli');
    }

    if (romProgress.areasNeedingWork.length > 0) {
        recommendations.push(`Şu alanlarda çalışma gerekli: ${romProgress.areasNeedingWork.join(', ')}`);
    }

    // FingerDance-based recommendations
    if (fingerDanceProgress) {
        if (fingerDanceProgress.weakFingers.length > 0) {
            recommendations.push(`Zayıf parmaklar için özel egzersizler: ${fingerDanceProgress.weakFingers.join(', ')}`);
        }
        
        if (fingerDanceProgress.averageAccuracy > 0.9) {
            recommendations.push('FingerDance performansı mükemmel - daha karmaşık parçalar denenebilir');
        }
    }

    // Frequency recommendations
    if (sessionStats.totalSessions < 5) {
        recommendations.push('Daha sık seans yapmaya teşvik edilmeli');
    }

    return recommendations;
};

/**
 * Generate alerts for concerning patterns
 */
const generateAlerts = (
    sessionStats: SessionStatsData,
    romProgress: { improvementFromBaseline: number; measurementCount: number },
    recentPerformance: { trend: string; lastWeek: number }
): string[] => {
    const alerts: string[] = [];

    // Performance alerts
    if (recentPerformance.trend === 'declining') {
        alerts.push('⚠️ Son performansta düşüş gözlemleniyor');
    }

    if (sessionStats.averageAccuracy < 0.4) {
        alerts.push('🔴 Çok düşük başarı oranı - acil müdahale gerekli');
    }

    if (sessionStats.averageMotivation < 3) {
        alerts.push('⚠️ Motivasyon çok düşük - program değişikliği gerekli');
    }

    // ROM alerts
    if (romProgress.improvementFromBaseline < -10) {
        alerts.push('🔴 ROM ölçümlerinde ciddi regresyon');
    }

    if (romProgress.measurementCount === 0) {
        alerts.push('⚠️ ROM ölçümü yapılmamış');
    }

    // Activity alerts - removed unused oneWeekAgo variable
    if (recentPerformance.lastWeek === 0) {
        alerts.push('⚠️ Son bir haftada aktivite yok');
    }

    return alerts;
};

/**
 * Get patient progress summary for dashboard
 */
export const getPatientProgressSummary = async (patientId: string) => {
    const report = await generatePatientProgressReport(patientId);
    if (!report) return null;

    return {
        patientId,
        overallScore: Math.round(
            (report.sessionProgress.averageAccuracy * 40) +
            (report.romProgress.latestScore * 0.4) +
            (report.sessionProgress.averageMotivation * 2)
        ),
        trend: report.sessionProgress.recentPerformance.trend,
        alertCount: report.alerts.length,
        lastSessionDate: '', // Would get from latest session
        nextRecommendation: report.recommendations[0] || 'Düzenli takip sürdürülmeli'
    };
};

/**
 * Compare multiple patients for ranking/comparison
 */
export const comparePatientProgress = async (patientIds: string[]) => {
    const summaries = await Promise.all(
        patientIds.map(id => getPatientProgressSummary(id))
    );

    return summaries
        .filter(s => s !== null)
        .sort((a, b) => b!.overallScore - a!.overallScore);
};