// src/services/sessionAnalysisService.ts

import { db } from './firebase';
import { ref, get, update, child, query, orderByChild, equalTo } from "firebase/database";
import { Session } from '@/types/firebase';
import { SessionPerformanceMetrics } from '@/types/fingerDance';
import { getFingerDanceResultById } from './fingerDanceService';
import { getGameResultById } from './gameResultService';

const sessionCollectionRef = ref(db, 'sessions');

/**
 * Calculate session performance metrics
 */
export const calculateSessionPerformanceMetrics = async (sessionId: string): Promise<SessionPerformanceMetrics | null> => {
    const session = await getSessionById(sessionId);
    if (!session || !session.gameResultID) return null;

    const gameResult = await getGameResultById(session.gameResultID);
    if (!gameResult) return null;

    let averageAccuracy = 0;
    let improvementFromLastSession = 0;
    let fatigueFactor = 0;
    let motivationLevel = 5; // Default middle value

    // Calculate accuracy based on game type
    if (gameResult.gameType === 'fingerDance') {
        const fingerDanceResult = await getFingerDanceResultById(session.gameResultID);
        if (fingerDanceResult) {
            averageAccuracy = fingerDanceResult.accuracy;
            
            // Calculate fatigue factor based on performance degradation over time
            // const movements = fingerDanceResult.fingerMovementLogID; // Would need to fetch actual log
            // For now, use combo as a proxy for fatigue
            fatigueFactor = Math.max(0, 1 - (fingerDanceResult.maxCombo / fingerDanceResult.totalNotes));
            
            // Motivation level based on accuracy and combo
            if (averageAccuracy > 0.9) motivationLevel = 9;
            else if (averageAccuracy > 0.8) motivationLevel = 8;
            else if (averageAccuracy > 0.7) motivationLevel = 7;
            else if (averageAccuracy > 0.6) motivationLevel = 6;
            else motivationLevel = 5;
        }
    } else if (gameResult.gameType === 'appleGame') {
        averageAccuracy = gameResult.successRate / 100;
        fatigueFactor = 0.1; // Lower fatigue for apple game
        motivationLevel = Math.min(10, Math.max(1, Math.round(averageAccuracy * 10)));
    }

    // Calculate improvement from last session
    const previousSessions = await getPatientSessions(session.patientID);
    const lastSession = previousSessions
        .filter(s => s.id !== sessionId && s.gameType === session.gameType)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

    if (lastSession && lastSession.gameResultID) {
        const lastGameResult = await getGameResultById(lastSession.gameResultID);
        if (lastGameResult) {
            let lastAccuracy = 0;
            if (lastGameResult.gameType === 'fingerDance') {
                const lastFingerDanceResult = await getFingerDanceResultById(lastSession.gameResultID);
                lastAccuracy = lastFingerDanceResult?.accuracy || 0;
            } else if (lastGameResult.gameType === 'appleGame') {
                lastAccuracy = lastGameResult.successRate / 100;
            }
            improvementFromLastSession = averageAccuracy - lastAccuracy;
        }
    }

    return {
        averageAccuracy,
        improvementFromLastSession,
        fatigueFactor,
        motivationLevel
    };
};

/**
 * Update session with performance metrics
 */
export const updateSessionPerformanceMetrics = async (sessionId: string): Promise<void> => {
    const metrics = await calculateSessionPerformanceMetrics(sessionId);
    if (!metrics) return;

    await update(child(sessionCollectionRef, sessionId), {
        performanceMetrics: metrics
    });
};

/**
 * Get session by ID
 */
export const getSessionById = async (id: string): Promise<Session | null> => {
    const snapshot = await get(child(sessionCollectionRef, id));
    if (!snapshot.exists()) return null;
    return { id: snapshot.key, ...snapshot.val() };
};

/**
 * Get all sessions for a patient
 */
export const getPatientSessions = async (patientId: string): Promise<Session[]> => {
    const patientQuery = query(sessionCollectionRef, orderByChild('patientID'), equalTo(patientId));
    const snapshot = await get(patientQuery);
    
    if (!snapshot.exists()) return [];
    
    const data = snapshot.val();
    return Object.keys(data)
        .map(key => ({ id: key, ...data[key] }))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

/**
 * Calculate session duration breakdown
 */
export const calculateSessionDuration = (session: Session): { 
    calibrationTime: number; 
    gameTime: number; 
    restTime: number; 
    totalTime: number; 
} => {
    if (session.sessionLog) {
        return session.sessionLog;
    }

    // Calculate from start and end times if sessionLog is not available
    const startTime = new Date(`${session.date}T${session.startTime}`);
    const endTime = session.endTime ? new Date(`${session.date}T${session.endTime}`) : new Date();
    const totalTime = endTime.getTime() - startTime.getTime();

    // Estimate breakdown (these would be tracked in real implementation)
    const calibrationTime = Math.min(60000, totalTime * 0.1); // Max 1 minute, or 10% of total
    const restTime = Math.min(120000, totalTime * 0.2); // Max 2 minutes, or 20% of total
    const gameTime = totalTime - calibrationTime - restTime;

    return {
        calibrationTime,
        gameTime: Math.max(0, gameTime),
        restTime,
        totalTime
    };
};

/**
 * Generate session analysis report
 */
export const generateSessionAnalysisReport = async (sessionId: string) => {
    const session = await getSessionById(sessionId);
    if (!session) return null;

    const metrics = await calculateSessionPerformanceMetrics(sessionId);
    const duration = calculateSessionDuration(session);
    
    let gameResult = null;
    if (session.gameResultID) {
        gameResult = await getGameResultById(session.gameResultID);
    }

    return {
        sessionId: session.id,
        patientID: session.patientID,
        date: session.date,
        gameType: session.gameType,
        duration,
        performanceMetrics: metrics,
        gameResult,
        analysis: {
            efficiency: duration.gameTime / duration.totalTime,
            engagement: metrics?.motivationLevel || 5,
            improvement: metrics?.improvementFromLastSession || 0,
            fatigue: metrics?.fatigueFactor || 0,
            recommendations: generateSessionRecommendations(session, metrics, duration)
        }
    };
};

/**
 * Generate recommendations based on session analysis
 */
export const generateSessionRecommendations = (
    session: Session, 
    metrics: SessionPerformanceMetrics | null, 
    duration: { calibrationTime: number; gameTime: number; restTime: number; totalTime: number; }
): string[] => {
    const recommendations: string[] = [];

    if (!metrics) return ['Session analizi için yeterli veri yok'];

    // Performance-based recommendations
    if (metrics.averageAccuracy < 0.5) {
        recommendations.push('Oyun zorluğu azaltılmalı');
        recommendations.push('Daha fazla kalibrasyon zamanı gerekli');
    } else if (metrics.averageAccuracy > 0.9) {
        recommendations.push('Oyun zorluğu artırılabilir');
        recommendations.push('Daha karmaşık egzersizler denenebilir');
    }

    // Fatigue-based recommendations
    if (metrics.fatigueFactor > 0.7) {
        recommendations.push('Seans süresi kısaltılmalı');
        recommendations.push('Daha sık ara verilmeli');
    } else if (metrics.fatigueFactor < 0.3) {
        recommendations.push('Seans süresi artırılabilir');
    }

    // Motivation-based recommendations
    if (metrics.motivationLevel < 5) {
        recommendations.push('Motivasyon artırıcı elementi eklenmeli');
        recommendations.push('Oyun çeşitliliği artırılmalı');
    } else if (metrics.motivationLevel > 8) {
        recommendations.push('Mevcut yaklaşım sürdürülmeli');
    }

    // Improvement-based recommendations
    if (metrics.improvementFromLastSession < -0.1) {
        recommendations.push('Regresyon gözlemleniyor, program gözden geçirilmeli');
    } else if (metrics.improvementFromLastSession > 0.1) {
        recommendations.push('İyi ilerleme kaydediliyor, mevcut program sürdürülmeli');
    }

    // Duration-based recommendations
    if (duration.totalTime > 1800000) { // 30 minutes
        recommendations.push('Seans süresi çok uzun, kısaltılmalı');
    } else if (duration.totalTime < 600000) { // 10 minutes
        recommendations.push('Seans süresi çok kısa, uzatılabilir');
    }

    return recommendations;
};

/**
 * Get session statistics for a patient
 */
export const getPatientSessionStatistics = async (patientId: string) => {
    const sessions = await getPatientSessions(patientId);
    
    if (sessions.length === 0) {
        return {
            totalSessions: 0,
            averageAccuracy: 0,
            averageMotivation: 0,
            averageDuration: 0,
            improvementTrend: 0,
            gameTypeDistribution: {}
        };
    }

    let totalAccuracy = 0;
    let totalMotivation = 0;
    let totalDuration = 0;
    let validSessions = 0;
    const gameTypeDistribution: { [key: string]: number } = {};

    for (const session of sessions) {
        if (session.performanceMetrics) {
            totalAccuracy += session.performanceMetrics.averageAccuracy;
            totalMotivation += session.performanceMetrics.motivationLevel;
            validSessions++;
        }
        
        const duration = calculateSessionDuration(session);
        totalDuration += duration.totalTime;
        
        if (session.gameType) {
            gameTypeDistribution[session.gameType] = (gameTypeDistribution[session.gameType] || 0) + 1;
        }
    }

    // Calculate improvement trend (last 5 sessions vs first 5 sessions)
    const recentSessions = sessions.slice(0, 5);
    const oldSessions = sessions.slice(-5);
    
    const recentAvgAccuracy = recentSessions.reduce((sum, s) => 
        sum + (s.performanceMetrics?.averageAccuracy || 0), 0) / recentSessions.length;
    const oldAvgAccuracy = oldSessions.reduce((sum, s) => 
        sum + (s.performanceMetrics?.averageAccuracy || 0), 0) / oldSessions.length;
    
    const improvementTrend = recentAvgAccuracy - oldAvgAccuracy;

    return {
        totalSessions: sessions.length,
        averageAccuracy: validSessions > 0 ? totalAccuracy / validSessions : 0,
        averageMotivation: validSessions > 0 ? totalMotivation / validSessions : 0,
        averageDuration: totalDuration / sessions.length,
        improvementTrend,
        gameTypeDistribution
    };
};