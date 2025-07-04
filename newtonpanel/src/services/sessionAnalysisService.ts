import { db } from './firebase';
import { ref, get, orderByChild, equalTo, query } from "firebase/database";
import { Session, GameResult, FingerDanceResult, AppleGameResult } from '@/types/firebase';
import { getSessionById } from './sessionService';
import { getGameResultById } from './gameResultService';

export interface SessionAnalysis {
    sessionId: string;
    patientId: string;
    sessionDate: string;
    duration: number; // in minutes
    gameType: 'appleGame' | 'fingerDance' | null;
    performance: {
        score: number;
        accuracy: number;
        improvement: number; // percentage compared to previous session
    };
    fingerDanceMetrics?: {
        totalNotes: number;
        hitNotes: number;
        maxCombo: number;
        averageFingerAccuracy: number;
        dominantFingerPerformance: {
            finger: number;
            accuracy: number;
        };
    };
    appleGameMetrics?: {
        totalApples: number;
        successRate: number;
        averageTime: number;
    };
    recommendations: string[];
}

export interface SessionComparisonResult {
    current: SessionAnalysis;
    previous: SessionAnalysis | null;
    improvementTrend: 'improving' | 'stable' | 'declining';
    keyMetrics: {
        scoreChange: number;
        accuracyChange: number;
        consistencyChange: number;
    };
}

export const analyzeSession = async (sessionId: string): Promise<SessionAnalysis | null> => {
    const session = await getSessionById(sessionId);
    if (!session || !session.gameResultID) return null;

    const gameResult = await getGameResultById(session.gameResultID);
    if (!gameResult) return null;

    const startTime = new Date(`${session.date} ${session.startTime}`);
    const endTime = new Date(`${session.date} ${session.endTime}`);
    const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60); // minutes

    const baseAnalysis: SessionAnalysis = {
        sessionId: session.id,
        patientId: session.patientID,
        sessionDate: session.date,
        duration,
        gameType: session.gameType || null,
        performance: {
            score: gameResult.score,
            accuracy: 0,
            improvement: 0
        },
        recommendations: []
    };

    // Get previous session for comparison
    const previousSession = await getPreviousSessionForPatient(session.patientID, session.date);
    if (previousSession) {
        const previousResult = await getGameResultById(previousSession.gameResultID || '');
        if (previousResult) {
            baseAnalysis.performance.improvement = 
                ((gameResult.score - previousResult.score) / previousResult.score) * 100;
        }
    }

    if (gameResult.gameType === 'fingerDance') {
        const fingerDanceResult = gameResult as FingerDanceResult;
        
        // Calculate average finger accuracy
        const fingerAccuracies = Object.values(fingerDanceResult.fingerPerformance || {}).map(f => f.accuracy);
        const averageFingerAccuracy = fingerAccuracies.reduce((sum, acc) => sum + acc, 0) / fingerAccuracies.length;
        
        // Find dominant finger performance
        const dominantFingerEntry = Object.entries(fingerDanceResult.fingerPerformance || {}).reduce((best, [finger, stats]) => {
            return stats.hits > best[1].hits ? [finger, stats] : best;
        });
        
        baseAnalysis.performance.accuracy = fingerDanceResult.accuracy || 0;
        baseAnalysis.fingerDanceMetrics = {
            totalNotes: fingerDanceResult.totalNotes || 0,
            hitNotes: fingerDanceResult.hitNotes || 0,
            maxCombo: fingerDanceResult.maxCombo || 0,
            averageFingerAccuracy,
            dominantFingerPerformance: {
                finger: parseInt(dominantFingerEntry[0].replace('finger', '')),
                accuracy: dominantFingerEntry[1].accuracy
            }
        };

        // Generate recommendations for FingerDance
        if (averageFingerAccuracy < 70) {
            baseAnalysis.recommendations.push("Parmak koordinasyonu çalışmaları önerilir.");
        }
        if (fingerDanceResult.maxCombo < 10) {
            baseAnalysis.recommendations.push("Konsantrasyon ve ritim çalışmaları yapılabilir.");
        }
        if (fingerDanceResult.accuracy < 80) {
            baseAnalysis.recommendations.push("Daha yavaş tempo ile başlayıp hızı artırın.");
        }
        
    } else if (gameResult.gameType === 'appleGame') {
        const appleGameResult = gameResult as AppleGameResult;
        
        baseAnalysis.performance.accuracy = appleGameResult.successRate;
        baseAnalysis.appleGameMetrics = {
            totalApples: appleGameResult.apples.length,
            successRate: appleGameResult.successRate,
            averageTime: appleGameResult.apples.reduce((sum, apple) => sum + (apple.time || 0), 0) / appleGameResult.apples.length
        };

        // Generate recommendations for Apple Game
        if (appleGameResult.successRate < 70) {
            baseAnalysis.recommendations.push("Yavaş ve kontrollü hareketler ile başlayın.");
        }
        if (baseAnalysis.appleGameMetrics.averageTime > 3) {
            baseAnalysis.recommendations.push("Hareket hızını artırmak için pratik yapın.");
        }
    }

    // General recommendations based on performance
    if (baseAnalysis.performance.improvement < -10) {
        baseAnalysis.recommendations.push("Performansta düşüş tespit edildi. Dinlenme süresi artırılabilir.");
    } else if (baseAnalysis.performance.improvement > 15) {
        baseAnalysis.recommendations.push("Harika ilerleme! Zorluk seviyesi artırılabilir.");
    }

    return baseAnalysis;
};

export const compareSessionPerformance = async (
    currentSessionId: string,
    previousSessionId?: string
): Promise<SessionComparisonResult | null> => {
    const currentAnalysis = await analyzeSession(currentSessionId);
    if (!currentAnalysis) return null;

    let previousAnalysis: SessionAnalysis | null = null;
    if (previousSessionId) {
        previousAnalysis = await analyzeSession(previousSessionId);
    } else {
        const previousSession = await getPreviousSessionForPatient(
            currentAnalysis.patientId,
            currentAnalysis.sessionDate
        );
        if (previousSession) {
            previousAnalysis = await analyzeSession(previousSession.id);
        }
    }

    const keyMetrics = {
        scoreChange: 0,
        accuracyChange: 0,
        consistencyChange: 0
    };

    let improvementTrend: 'improving' | 'stable' | 'declining' = 'stable';

    if (previousAnalysis) {
        keyMetrics.scoreChange = currentAnalysis.performance.score - previousAnalysis.performance.score;
        keyMetrics.accuracyChange = currentAnalysis.performance.accuracy - previousAnalysis.performance.accuracy;
        
        // Calculate consistency change based on performance variation
        const currentConsistency = calculateConsistencyScore(currentAnalysis);
        const previousConsistency = calculateConsistencyScore(previousAnalysis);
        keyMetrics.consistencyChange = currentConsistency - previousConsistency;

        // Determine trend
        const overallChange = (keyMetrics.scoreChange + keyMetrics.accuracyChange + keyMetrics.consistencyChange) / 3;
        if (overallChange > 5) {
            improvementTrend = 'improving';
        } else if (overallChange < -5) {
            improvementTrend = 'declining';
        }
    }

    return {
        current: currentAnalysis,
        previous: previousAnalysis,
        improvementTrend,
        keyMetrics
    };
};

export const getSessionAnalyticsByPatient = async (
    patientId: string,
    limit: number = 10
): Promise<SessionAnalysis[]> => {
    const sessionsRef = ref(db, 'sessions');
    const patientQuery = query(sessionsRef, orderByChild('patientID'), equalTo(patientId));
    const snapshot = await get(patientQuery);
    
    if (!snapshot.exists()) return [];
    
    const sessions = Object.keys(snapshot.val()).map(key => ({
        id: key,
        ...snapshot.val()[key]
    })) as Session[];

    // Sort by date and limit
    const sortedSessions = sessions
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, limit);

    const analyses: SessionAnalysis[] = [];
    for (const session of sortedSessions) {
        const analysis = await analyzeSession(session.id);
        if (analysis) {
            analyses.push(analysis);
        }
    }

    return analyses;
};

export const calculatePatientProgress = async (
    patientId: string,
    timeframe: number = 30 // days
): Promise<{
    totalSessions: number;
    averageScore: number;
    averageAccuracy: number;
    improvementRate: number;
    sessionFrequency: number; // sessions per week
    progressTrend: 'improving' | 'stable' | 'declining';
    recommendations: string[];
}> => {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - timeframe * 24 * 60 * 60 * 1000);

    const allAnalyses = await getSessionAnalyticsByPatient(patientId, 100);
    const timeframeAnalyses = allAnalyses.filter(analysis => {
        const sessionDate = new Date(analysis.sessionDate);
        return sessionDate >= startDate && sessionDate <= endDate;
    });

    const totalSessions = timeframeAnalyses.length;
    const averageScore = totalSessions > 0 ? 
        timeframeAnalyses.reduce((sum, analysis) => sum + analysis.performance.score, 0) / totalSessions : 0;
    const averageAccuracy = totalSessions > 0 ? 
        timeframeAnalyses.reduce((sum, analysis) => sum + analysis.performance.accuracy, 0) / totalSessions : 0;

    // Calculate improvement rate
    let improvementRate = 0;
    if (timeframeAnalyses.length >= 2) {
        const firstSession = timeframeAnalyses[timeframeAnalyses.length - 1];
        const lastSession = timeframeAnalyses[0];
        improvementRate = ((lastSession.performance.score - firstSession.performance.score) / firstSession.performance.score) * 100;
    }

    const sessionFrequency = (totalSessions / timeframe) * 7; // sessions per week

    // Determine progress trend
    let progressTrend: 'improving' | 'stable' | 'declining' = 'stable';
    if (improvementRate > 10) {
        progressTrend = 'improving';
    } else if (improvementRate < -10) {
        progressTrend = 'declining';
    }

    // Generate recommendations
    const recommendations: string[] = [];
    if (sessionFrequency < 2) {
        recommendations.push("Seans sıklığı artırılabilir. Haftada en az 3 seans önerilir.");
    }
    if (averageAccuracy < 70) {
        recommendations.push("Doğruluk oranı artırılması için daha yavaş tempo ile çalışın.");
    }
    if (progressTrend === 'declining') {
        recommendations.push("Performansta düşüş tespit edildi. Egzersiz programı gözden geçirilmelidir.");
    }
    if (averageScore < 50) {
        recommendations.push("Temel egzersizler ile başlayarak zorluk seviyesi kademeli artırılabilir.");
    }

    return {
        totalSessions,
        averageScore,
        averageAccuracy,
        improvementRate,
        sessionFrequency,
        progressTrend,
        recommendations
    };
};

// Helper functions
const getPreviousSessionForPatient = async (patientId: string, currentDate: string): Promise<Session | null> => {
    const sessionsRef = ref(db, 'sessions');
    const patientQuery = query(sessionsRef, orderByChild('patientID'), equalTo(patientId));
    const snapshot = await get(patientQuery);
    
    if (!snapshot.exists()) return null;
    
    const sessions = Object.keys(snapshot.val()).map(key => ({
        id: key,
        ...snapshot.val()[key]
    })) as Session[];

    const previousSessions = sessions
        .filter(session => session.date < currentDate)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return previousSessions.length > 0 ? previousSessions[0] : null;
};

const calculateConsistencyScore = (analysis: SessionAnalysis): number => {
    // Simple consistency calculation based on accuracy and performance
    if (analysis.fingerDanceMetrics) {
        // Extract only numeric accuracy values from finger metrics
        const fingerAccuracyValues = [
            analysis.fingerDanceMetrics.averageFingerAccuracy,
            analysis.fingerDanceMetrics.dominantFingerPerformance.accuracy
        ];
        const variance = fingerAccuracyValues.reduce((sum, acc) => sum + Math.pow(acc - analysis.performance.accuracy, 2), 0) / fingerAccuracyValues.length;
        return Math.max(0, 100 - Math.sqrt(variance));
    } else if (analysis.appleGameMetrics) {
        return analysis.appleGameMetrics.successRate;
    }
    return analysis.performance.accuracy;
};

export const generateSessionReport = async (sessionId: string): Promise<string> => {
    const analysis = await analyzeSession(sessionId);
    if (!analysis) return "Seans analizi bulunamadı.";

    const comparison = await compareSessionPerformance(sessionId);
    
    let report = `SEANS RAPORU\n`;
    report += `Tarih: ${analysis.sessionDate}\n`;
    report += `Süre: ${analysis.duration.toFixed(1)} dakika\n`;
    report += `Oyun Tipi: ${analysis.gameType}\n`;
    report += `Puan: ${analysis.performance.score}\n`;
    report += `Doğruluk: ${analysis.performance.accuracy.toFixed(1)}%\n`;

    if (comparison?.previous) {
        report += `\nÖNCEKİ SEANSLA KARŞILAŞTIRMA:\n`;
        report += `Puan Değişimi: ${comparison.keyMetrics.scoreChange > 0 ? '+' : ''}${comparison.keyMetrics.scoreChange.toFixed(1)}\n`;
        report += `Doğruluk Değişimi: ${comparison.keyMetrics.accuracyChange > 0 ? '+' : ''}${comparison.keyMetrics.accuracyChange.toFixed(1)}%\n`;
        report += `Eğilim: ${comparison.improvementTrend}\n`;
    }

    if (analysis.recommendations.length > 0) {
        report += `\nÖNERİLER:\n`;
        analysis.recommendations.forEach((rec, index) => {
            report += `${index + 1}. ${rec}\n`;
        });
    }

    return report;
};