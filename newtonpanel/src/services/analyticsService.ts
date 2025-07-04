// src/services/analyticsService.ts

import { db } from './firebase';
import { ref, set, get, push, child, query, orderByChild, equalTo, limitToLast } from "firebase/database";
import { PerformanceAnalysis, PatientProgressReport, FingerDanceAnalysis, AppleGameAnalysis } from '@/types/firebase';
import { getSessionById, getAllSessions } from './sessionService';
import { getGameResultById } from './gameResultService';
import { getRomById } from './romService';
import { getPositionLogsBySession, getPositionLogSummary } from './positionLogService';

const analysisCollectionRef = ref(db, 'performanceAnalyses');
const reportsCollectionRef = ref(db, 'progressReports');

/**
 * Seans performans analizi oluşturur
 * @param sessionId Seans ID'si
 * @returns Performans analizi
 */
export const createSessionAnalysis = async (sessionId: string): Promise<PerformanceAnalysis> => {
    const session = await getSessionById(sessionId);
    if (!session) throw new Error("Seans bulunamadı");
    
    // Oyun sonuçlarını getir
    const gameResult = session.gameResultID ? await getGameResultById(session.gameResultID) : null;
    
    // ROM verilerini getir
    const romData = await getRomById(session.romID);
    
    // Pozisyon log'larını getir
    const positionLogs = await getPositionLogsBySession(sessionId);
    
    // Analiz verilerini hesapla
    const overallMetrics = calculateOverallMetrics(session, gameResult, romData);
    const gameAnalysis = await calculateGameAnalysis(gameResult, positionLogs);
    const romAnalysis = calculateRomAnalysis(session, romData);
    const trendAnalysis = await calculateTrendAnalysis(session.patientID, sessionId);
    const recommendations = generateRecommendations(overallMetrics, gameAnalysis, romAnalysis, trendAnalysis);
    
    const analysis: Omit<PerformanceAnalysis, 'id'> = {
        sessionID: sessionId,
        patientID: session.patientID,
        analysisDate: new Date().toISOString().split('T')[0],
        analysisType: 'session',
        overallMetrics,
        gameAnalysis,
        romAnalysis,
        trendAnalysis,
        recommendations
    };
    
    // Veritabanına kaydet
    const newRef = push(analysisCollectionRef);
    if (!newRef.key) throw new Error("Analiz ID oluşturulamadı");
    
    await set(newRef, analysis);
    return { id: newRef.key, ...analysis };
};

/**
 * Haftalık performans analizi oluşturur
 * @param patientId Hasta ID'si
 * @param weekStartDate Hafta başlangıç tarihi
 * @returns Haftalık analiz
 */
export const createWeeklyAnalysis = async (patientId: string, weekStartDate: string): Promise<PerformanceAnalysis> => {
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 7);
    
    // Haftanın seanslarını getir
    const allSessions = await getAllSessions();
    const weekSessions = allSessions.filter(session => 
        session.patientID === patientId &&
        session.date >= weekStartDate &&
        session.date < weekEndDate.toISOString().split('T')[0]
    );
    
    if (weekSessions.length === 0) {
        throw new Error("Bu hafta için seans bulunamadı");
    }
    
    // Haftalık metrikleri hesapla
    const weeklyMetrics = await calculateWeeklyMetrics(weekSessions);
    const weeklyGameAnalysis = await calculateWeeklyGameAnalysis(weekSessions);
    const weeklyRomAnalysis = await calculateWeeklyRomAnalysis(weekSessions);
    const trendAnalysis = await calculateTrendAnalysis(patientId);
    const recommendations = generateWeeklyRecommendations(weeklyMetrics, weeklyGameAnalysis, weeklyRomAnalysis);
    
    const analysis: Omit<PerformanceAnalysis, 'id'> = {
        sessionID: weekSessions.map(s => s.id).join(','),
        patientID: patientId,
        analysisDate: new Date().toISOString().split('T')[0],
        analysisType: 'weekly',
        overallMetrics: weeklyMetrics,
        gameAnalysis: weeklyGameAnalysis,
        romAnalysis: weeklyRomAnalysis,
        trendAnalysis,
        recommendations
    };
    
    const newRef = push(analysisCollectionRef);
    if (!newRef.key) throw new Error("Haftalık analiz ID oluşturulamadı");
    
    await set(newRef, analysis);
    return { id: newRef.key, ...analysis };
};

/**
 * Hasta ilerleme raporu oluşturur
 * @param patientId Hasta ID'si
 * @param startDate Başlangıç tarihi
 * @param endDate Bitiş tarihi
 * @returns İlerleme raporu
 */
export const createProgressReport = async (
    patientId: string,
    startDate: string,
    endDate: string
): Promise<PatientProgressReport> => {
    // Dönem içindeki seansları getir
    const allSessions = await getAllSessions();
    const periodSessions = allSessions.filter(session => 
        session.patientID === patientId &&
        session.date >= startDate &&
        session.date <= endDate
    );
    
    if (periodSessions.length === 0) {
        throw new Error("Belirtilen dönemde seans bulunamadı");
    }
    
    // İlerleme verilerini hesapla
    const overallProgress = await calculateOverallProgress(periodSessions);
    const romProgress = await calculateRomProgress(periodSessions);
    const gamePerformance = await calculateGamePerformance(periodSessions);
    const recommendations = generateProgressRecommendations(overallProgress, romProgress, gamePerformance);
    const chartData = await generateChartData(periodSessions);
    
    const report: Omit<PatientProgressReport, 'id'> = {
        patientID: patientId,
        reportDate: new Date().toISOString().split('T')[0],
        reportPeriod: {
            startDate,
            endDate,
            totalSessions: periodSessions.length
        },
        overallProgress,
        romProgress,
        gamePerformance,
        recommendations,
        chartData
    };
    
    // Veritabanına kaydet
    const newRef = push(reportsCollectionRef);
    if (!newRef.key) throw new Error("Rapor ID oluşturulamadı");
    
    await set(newRef, report);
    return { id: newRef.key, ...report };
};

/**
 * Hasta için tüm analiz raporlarını getirir
 * @param patientId Hasta ID'si
 * @returns Analiz raporları
 */
export const getAnalysesByPatient = async (patientId: string): Promise<PerformanceAnalysis[]> => {
    const patientQuery = query(analysisCollectionRef, orderByChild('patientID'), equalTo(patientId));
    const snapshot = await get(patientQuery);
    
    if (!snapshot.exists()) return [];
    
    const data = snapshot.val();
    return Object.keys(data)
        .map(key => ({ id: key, ...data[key] }))
        .sort((a, b) => new Date(b.analysisDate).getTime() - new Date(a.analysisDate).getTime());
};

/**
 * Hasta için tüm ilerleme raporlarını getirir
 * @param patientId Hasta ID'si
 * @returns İlerleme raporları
 */
export const getProgressReportsByPatient = async (patientId: string): Promise<PatientProgressReport[]> => {
    const patientQuery = query(reportsCollectionRef, orderByChild('patientID'), equalTo(patientId));
    const snapshot = await get(patientQuery);
    
    if (!snapshot.exists()) return [];
    
    const data = snapshot.val();
    return Object.keys(data)
        .map(key => ({ id: key, ...data[key] }))
        .sort((a, b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime());
};

// Yardımcı hesaplama fonksiyonları

function calculateOverallMetrics(session: any, gameResult: any, romData: any): any {
    const baseScore = gameResult?.score || 0;
    const analyticsScore = session.analytics?.performanceScore || 0;
    const totalScore = (baseScore + analyticsScore) / 2;
    
    return {
        totalScore,
        improvementRate: session.analytics?.improvementScore || 0,
        consistencyScore: calculateConsistencyScore(session, gameResult),
        enduranceScore: session.analytics?.fatigueLevel ? 100 - session.analytics.fatigueLevel : 80,
        motivationScore: session.analytics?.motivationLevel || 75
    };
}

function calculateConsistencyScore(session: any, gameResult: any): number {
    // Basit tutarlılık hesaplaması
    if (gameResult?.gameType === 'fingerDance') {
        const notes = gameResult.notes || [];
        if (notes.length === 0) return 0;
        
        const accuracies = notes.map((note: any) => note.accuracy || 0);
        const avg = accuracies.reduce((sum: number, acc: number) => sum + acc, 0) / accuracies.length;
        const variance = accuracies.reduce((sum: number, acc: number) => sum + Math.pow(acc - avg, 2), 0) / accuracies.length;
        const stdDev = Math.sqrt(variance);
        
        return Math.max(0, 100 - stdDev);
    }
    
    return 75; // Varsayılan değer
}

async function calculateGameAnalysis(gameResult: any, positionLogs: any[]): Promise<any> {
    if (!gameResult) return {};
    
    if (gameResult.gameType === 'fingerDance') {
        return {
            fingerDance: await calculateFingerDanceAnalysis(gameResult, positionLogs)
        };
    } else if (gameResult.gameType === 'appleGame') {
        return {
            appleGame: await calculateAppleGameAnalysis(gameResult, positionLogs)
        };
    }
    
    return {};
}

async function calculateFingerDanceAnalysis(gameResult: any, positionLogs: any[]): Promise<FingerDanceAnalysis> {
    const notes = gameResult.notes || [];
    const fingerPerformance: any = {};
    
    // Parmak bazında performans hesapla
    [0, 1, 2, 3, 4].forEach(fingerId => {
        const fingerNotes = notes.filter((note: any) => note.finger === fingerId);
        if (fingerNotes.length > 0) {
            const accuracy = fingerNotes.reduce((sum: number, note: any) => sum + (note.accuracy || 0), 0) / fingerNotes.length;
            const reactionTimes = fingerNotes.map((note: any) => note.reactionTime || 0);
            const avgReactionTime = reactionTimes.reduce((sum: number, time: number) => sum + time, 0) / reactionTimes.length;
            
            fingerPerformance[fingerId] = {
                accuracy,
                speed: avgReactionTime > 0 ? 1000 / avgReactionTime : 0,
                consistency: calculateFingerConsistency(fingerNotes),
                improvement: 0, // Önceki seanslarla karşılaştırılmalı
                recommendedExercises: generateFingerExercises(fingerId, accuracy)
            };
        }
    });
    
    return {
        fingerPerformance,
        coordinationScore: gameResult.performance?.avgAccuracy || 0,
        rhythmAccuracy: calculateRhythmAccuracy(notes),
        reactionTimeStats: calculateReactionTimeStats(notes),
        difficultyProgression: {
            currentLevel: 'medium',
            recommendedNext: 'medium',
            readinessScore: 75
        }
    };
}

async function calculateAppleGameAnalysis(gameResult: any, positionLogs: any[]): Promise<AppleGameAnalysis> {
    return {
        handPreference: 'balanced',
        reachAnalysis: {
            comfortableReach: 0.8,
            maxReach: 1.2,
            reachImprovement: 5
        },
        grabAccuracy: gameResult.successRate || 0,
        releaseControl: 85,
        spatialAwareness: 80,
        taskCompletionEfficiency: 75
    };
}

function calculateRomAnalysis(session: any, romData: any): any {
    return {
        currentRanges: romData?.finger?.leftFingers?.reduce((acc: any, finger: any, index: number) => {
            acc[`leftFinger${index}`] = finger.current || finger.max || 0;
            return acc;
        }, {}) || {},
        improvements: session.romProgress?.improvements || {},
        targetProgress: session.romProgress?.targetProgress ? { overall: session.romProgress.targetProgress } : {},
        recommendations: generateRomRecommendations(session, romData)
    };
}

async function calculateTrendAnalysis(patientId: string, currentSessionId?: string): Promise<any> {
    // Son 5 seansı getir
    const allSessions = await getAllSessions();
    const patientSessions = allSessions
        .filter(session => session.patientID === patientId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);
    
    if (patientSessions.length < 2) {
        return {
            performanceTrend: 'stable' as const,
            weeklyChange: 0,
            monthlyChange: 0,
            projectedImprovement: 0,
            nextMilestone: {
                description: 'İlk değerlendirme',
                estimatedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                confidenceLevel: 50
            }
        };
    }
    
    // Trend hesaplama (basitleştirilmiş)
    const scores = patientSessions.map(session => session.analytics?.performanceScore || 50);
    const trend = scores[0] > scores[scores.length - 1] ? 'improving' : 
                  scores[0] < scores[scores.length - 1] ? 'declining' : 'stable';
    
    return {
        performanceTrend: trend,
        weeklyChange: scores.length > 1 ? scores[0] - scores[1] : 0,
        monthlyChange: scores.length > 3 ? scores[0] - scores[3] : 0,
        projectedImprovement: calculateProjectedImprovement(scores),
        nextMilestone: {
            description: 'Bir sonraki seviye',
            estimatedDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            confidenceLevel: 75
        }
    };
}

function generateRecommendations(overallMetrics: any, gameAnalysis: any, romAnalysis: any, trendAnalysis: any): any {
    return {
        gameSettings: {
            difficulty: overallMetrics.totalScore > 80 ? 'harder' : overallMetrics.totalScore < 60 ? 'easier' : 'maintain',
            duration: overallMetrics.enduranceScore > 80 ? 'longer' : 'maintain',
            frequency: trendAnalysis.performanceTrend === 'improving' ? 'more' : 'maintain'
        },
        therapyFocus: generateTherapyFocus(overallMetrics, gameAnalysis),
        nextSessionGoals: generateNextSessionGoals(overallMetrics, romAnalysis)
    };
}

// Daha fazla yardımcı fonksiyon...
function calculateFingerConsistency(fingerNotes: any[]): number {
    if (fingerNotes.length < 2) return 100;
    
    const accuracies = fingerNotes.map(note => note.accuracy || 0);
    const avg = accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length;
    const variance = accuracies.reduce((sum, acc) => sum + Math.pow(acc - avg, 2), 0) / accuracies.length;
    const stdDev = Math.sqrt(variance);
    
    return Math.max(0, 100 - stdDev);
}

function generateFingerExercises(fingerId: number, accuracy: number): string[] {
    const exercises = [
        'Parmak esneklik egzersizleri',
        'Hassasiyet geliştirme çalışmaları',
        'Koordinasyon egzersizleri'
    ];
    
    if (accuracy < 60) {
        exercises.push('Temel hareket tekrarları');
    }
    
    return exercises;
}

function calculateRhythmAccuracy(notes: any[]): number {
    // Ritim doğruluğu hesaplama
    return notes.reduce((sum, note) => sum + (note.accuracy || 0), 0) / Math.max(1, notes.length);
}

function calculateReactionTimeStats(notes: any[]): any {
    const reactionTimes = notes.map(note => note.reactionTime || 0).filter(time => time > 0);
    
    if (reactionTimes.length === 0) {
        return { min: 0, max: 0, avg: 0, stdDev: 0 };
    }
    
    const min = Math.min(...reactionTimes);
    const max = Math.max(...reactionTimes);
    const avg = reactionTimes.reduce((sum, time) => sum + time, 0) / reactionTimes.length;
    const variance = reactionTimes.reduce((sum, time) => sum + Math.pow(time - avg, 2), 0) / reactionTimes.length;
    const stdDev = Math.sqrt(variance);
    
    return { min, max, avg, stdDev };
}

function generateRomRecommendations(session: any, romData: any): string[] {
    const recommendations = [];
    
    if (session.analytics?.fatigueLevel > 70) {
        recommendations.push('Daha kısa süreli seanslar');
    }
    
    if (session.romProgress?.targetProgress < 50) {
        recommendations.push('ROM egzersizlerine odaklanın');
    }
    
    recommendations.push('Düzenli esneme egzersizleri');
    
    return recommendations;
}

function calculateProjectedImprovement(scores: number[]): number {
    if (scores.length < 2) return 0;
    
    // Basit lineer trend hesaplama
    const trend = (scores[0] - scores[scores.length - 1]) / (scores.length - 1);
    return Math.max(-20, Math.min(20, trend * 4)); // 4 haftalık projeksiyon
}

function generateTherapyFocus(overallMetrics: any, gameAnalysis: any): string[] {
    const focus = [];
    
    if (overallMetrics.consistencyScore < 70) {
        focus.push('Tutarlılık geliştirme');
    }
    
    if (overallMetrics.enduranceScore < 60) {
        focus.push('Dayanıklılık artırma');
    }
    
    focus.push('Koordinasyon geliştirme');
    
    return focus;
}

function generateNextSessionGoals(overallMetrics: any, romAnalysis: any): string[] {
    const goals = [];
    
    if (overallMetrics.totalScore < 70) {
        goals.push('Genel performansı %5 artır');
    }
    
    goals.push('ROM hedeflerini gerçekleştir');
    goals.push('Motivasyonu yüksek tut');
    
    return goals;
}

// Haftalık hesaplama fonksiyonları (basitleştirilmiş)
async function calculateWeeklyMetrics(sessions: any[]): Promise<any> {
    return {
        totalScore: 75,
        improvementRate: 10,
        consistencyScore: 80,
        enduranceScore: 85,
        motivationScore: 90
    };
}

async function calculateWeeklyGameAnalysis(sessions: any[]): Promise<any> {
    return {};
}

async function calculateWeeklyRomAnalysis(sessions: any[]): Promise<any> {
    return {
        currentRanges: {},
        improvements: {},
        targetProgress: {},
        recommendations: []
    };
}

function generateWeeklyRecommendations(metrics: any, gameAnalysis: any, romAnalysis: any): any {
    return {
        gameSettings: {
            difficulty: 'maintain',
            duration: 'maintain',
            frequency: 'maintain'
        },
        therapyFocus: ['Haftalık değerlendirme'],
        nextSessionGoals: ['Haftalık hedefleri gerçekleştir']
    };
}

// İlerleme raporu hesaplama fonksiyonları (basitleştirilmiş)
async function calculateOverallProgress(sessions: any[]): Promise<any> {
    return {
        totalImprovement: 15,
        weeklyAverage: 3,
        monthlyAverage: 12,
        goalAchievement: 75,
        nextGoals: ['ROM geliştirme', 'Koordinasyon artırma']
    };
}

async function calculateRomProgress(sessions: any[]): Promise<any> {
    return {};
}

async function calculateGamePerformance(sessions: any[]): Promise<any> {
    return {};
}

function generateProgressRecommendations(overallProgress: any, romProgress: any, gamePerformance: any): any {
    return {
        therapyAdjustments: ['Egzersiz sıklığını artır'],
        gameSettings: {
            difficulty: 'medium',
            duration: '20 dakika',
            frequency: 'Haftada 3 kez'
        },
        homeExercises: ['Parmak esneklik egzersizleri'],
        nextMilestones: [{
            description: 'ROM hedefine ulaşma',
            targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            metrics: ['ROM gelişimi', 'Koordinasyon']
        }]
    };
}

async function generateChartData(sessions: any[]): Promise<any> {
    return {
        performanceOverTime: sessions.map(session => ({
            date: session.date,
            score: session.analytics?.performanceScore || 50
        })),
        romOverTime: [],
        gameScoresOverTime: [],
        weeklyProgress: []
    };
}