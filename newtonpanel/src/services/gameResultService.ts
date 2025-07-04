import { db } from './firebase';
import { ref, set, get, update, remove, push, child, query, orderByChild, equalTo } from "firebase/database";
import { GameResult, FingerDanceResult, AppleGameResult } from '@/types/firebase';

const collectionRef = ref(db, 'gameResults');

export const createGameResult = async (data: Omit<GameResult, 'id'>): Promise<GameResult> => {
    const newRef = push(collectionRef);
    if (!newRef.key) throw new Error("ID oluşturulamadı.");
    await set(newRef, data);
    return { id: newRef.key, ...data } as GameResult;
};

export const getAllGameResults = async (): Promise<GameResult[]> => {
    const snapshot = await get(collectionRef);
    if (!snapshot.exists()) return [];
    const data = snapshot.val();
    return Object.keys(data).map(key => ({ id: key, ...data[key] }));
};

export const getGameResultById = async (id: string): Promise<GameResult | null> => {
    const snapshot = await get(child(collectionRef, id));
    if (!snapshot.exists()) return null;
    return { id: snapshot.key, ...snapshot.val() };
};

export const updateGameResult = async (id: string, updates: Partial<Omit<GameResult, 'id'>>): Promise<void> => {
    return update(child(collectionRef, id), updates);
};

export const deleteGameResult = async (id: string): Promise<void> => {
    return remove(child(collectionRef, id));
};

/**
 * Belirli bir seans için oyun sonuçlarını getirir
 * @param sessionId Seans ID'si
 * @returns Oyun sonuçları
 */
export const getGameResultsBySession = async (sessionId: string): Promise<GameResult[]> => {
    const sessionQuery = query(collectionRef, orderByChild('sessionID'), equalTo(sessionId));
    const snapshot = await get(sessionQuery);
    
    if (!snapshot.exists()) return [];
    
    const data = snapshot.val();
    return Object.keys(data).map(key => ({ id: key, ...data[key] }));
};

/**
 * Belirli bir hasta için oyun sonuçlarını getirir
 * @param patientId Hasta ID'si
 * @returns Oyun sonuçları
 */
export const getGameResultsByPatient = async (patientId: string): Promise<GameResult[]> => {
    // Önce hasta seanslarını bul
    const sessionsRef = ref(db, 'sessions');
    const sessionsQuery = query(sessionsRef, orderByChild('patientID'), equalTo(patientId));
    const sessionsSnapshot = await get(sessionsQuery);
    
    if (!sessionsSnapshot.exists()) return [];
    
    const sessions = sessionsSnapshot.val();
    const sessionIds = Object.keys(sessions);
    
    // Her seans için oyun sonuçlarını getir
    const allResults: GameResult[] = [];
    for (const sessionId of sessionIds) {
        const results = await getGameResultsBySession(sessionId);
        allResults.push(...results);
    }
    
    return allResults.sort((a, b) => new Date(b.sessionID).getTime() - new Date(a.sessionID).getTime());
};

/**
 * FingerDance oyunu için detaylı analiz verileri hesaplar
 * @param result FingerDance oyun sonucu
 * @returns Analiz verileri
 */
export const analyzeFingerDanceResult = (result: FingerDanceResult): {
    accuracyStats: {
        perfect: number;
        good: number;
        poor: number;
        missed: number;
    };
    fingerEfficiency: { [fingerId: number]: number };
    timingConsistency: number;
    improvementAreas: string[];
} => {
    const notes = result.notes || [];
    
    // Doğruluk istatistikleri
    const accuracyStats = {
        perfect: notes.filter(note => note.accuracy >= 90).length,
        good: notes.filter(note => note.accuracy >= 70 && note.accuracy < 90).length,
        poor: notes.filter(note => note.accuracy >= 50 && note.accuracy < 70).length,
        missed: notes.filter(note => !note.hit).length
    };
    
    // Parmak verimliliği
    const fingerEfficiency: { [fingerId: number]: number } = {};
    [0, 1, 2, 3, 4].forEach(fingerId => {
        const fingerNotes = notes.filter(note => note.finger === fingerId);
        if (fingerNotes.length > 0) {
            const avgAccuracy = fingerNotes.reduce((sum, note) => sum + (note.accuracy || 0), 0) / fingerNotes.length;
            fingerEfficiency[fingerId] = avgAccuracy;
        }
    });
    
    // Zamanlama tutarlılığı
    const reactionTimes = notes.map(note => note.reactionTime || 0).filter(time => time > 0);
    let timingConsistency = 100;
    if (reactionTimes.length > 1) {
        const avg = reactionTimes.reduce((sum, time) => sum + time, 0) / reactionTimes.length;
        const variance = reactionTimes.reduce((sum, time) => sum + Math.pow(time - avg, 2), 0) / reactionTimes.length;
        const stdDev = Math.sqrt(variance);
        timingConsistency = Math.max(0, 100 - (stdDev / avg) * 100);
    }
    
    // Gelişim alanları
    const improvementAreas: string[] = [];
    if (result.performance.accuracy < 70) improvementAreas.push('Genel doğruluk');
    if (result.performance.avgReactionTime > 500) improvementAreas.push('Tepki süresi');
    if (result.combo < result.performance.totalNotes * 0.5) improvementAreas.push('Kombo tutma');
    
    // En düşük performanslı parmakları bul
    Object.entries(fingerEfficiency).forEach(([fingerId, efficiency]) => {
        if (efficiency < 60) {
            improvementAreas.push(`Parmak ${fingerId} koordinasyonu`);
        }
    });
    
    return {
        accuracyStats,
        fingerEfficiency,
        timingConsistency,
        improvementAreas
    };
};

/**
 * AppleGame oyunu için detaylı analiz verileri hesaplar
 * @param result AppleGame oyun sonucu
 * @returns Analiz verileri
 */
export const analyzeAppleGameResult = (result: AppleGameResult): {
    taskEfficiency: number;
    errorAnalysis: {
        dropped: number;
        missed: number;
        timeouts: number;
    };
    speedConsistency: number;
    improvementAreas: string[];
} => {
    const apples = result.apples || [];
    
    // Görev verimliliği
    const completedTasks = apples.filter(apple => apple.status === 'picked').length;
    const taskEfficiency = apples.length > 0 ? (completedTasks / apples.length) * 100 : 0;
    
    // Hata analizi
    const errorAnalysis = {
        dropped: apples.filter(apple => apple.status === 'dropped').length,
        missed: apples.filter(apple => apple.status === 'missed').length,
        timeouts: apples.filter(apple => apple.time && apple.time > 10000).length // 10 saniyeden uzun
    };
    
    // Hız tutarlılığı
    const completionTimes = apples
        .filter(apple => apple.status === 'picked' && apple.time)
        .map(apple => apple.time!);
    
    let speedConsistency = 100;
    if (completionTimes.length > 1) {
        const avg = completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length;
        const variance = completionTimes.reduce((sum, time) => sum + Math.pow(time - avg, 2), 0) / completionTimes.length;
        const stdDev = Math.sqrt(variance);
        speedConsistency = Math.max(0, 100 - (stdDev / avg) * 100);
    }
    
    // Gelişim alanları
    const improvementAreas: string[] = [];
    if (result.successRate < 70) improvementAreas.push('Başarı oranı');
    if (errorAnalysis.dropped > apples.length * 0.2) improvementAreas.push('Kavrama kontrolü');
    if (errorAnalysis.missed > apples.length * 0.15) improvementAreas.push('Hedefleme doğruluğu');
    if (speedConsistency < 70) improvementAreas.push('Hareket tutarlılığı');
    
    return {
        taskEfficiency,
        errorAnalysis,
        speedConsistency,
        improvementAreas
    };
};

/**
 * Oyun türüne göre performans karşılaştırması yapar
 * @param results Oyun sonuçları
 * @param gameType Oyun türü
 * @returns Karşılaştırma verileri
 */
export const compareGamePerformance = (
    results: GameResult[], 
    gameType: 'appleGame' | 'fingerDance'
): {
    averageScore: number;
    bestScore: number;
    worstScore: number;
    improvementTrend: 'improving' | 'stable' | 'declining';
    sessionCount: number;
} => {
    const filteredResults = results.filter(result => result.gameType === gameType);
    
    if (filteredResults.length === 0) {
        return {
            averageScore: 0,
            bestScore: 0,
            worstScore: 0,
            improvementTrend: 'stable',
            sessionCount: 0
        };
    }
    
    const scores = filteredResults.map(result => result.score);
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const bestScore = Math.max(...scores);
    const worstScore = Math.min(...scores);
    
    // Trend hesaplama (son 5 seansa göre)
    const recentResults = filteredResults.slice(-5);
    let improvementTrend: 'improving' | 'stable' | 'declining' = 'stable';
    
    if (recentResults.length >= 3) {
        const firstHalf = recentResults.slice(0, Math.floor(recentResults.length / 2));
        const secondHalf = recentResults.slice(Math.floor(recentResults.length / 2));
        
        const firstAvg = firstHalf.reduce((sum, result) => sum + result.score, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, result) => sum + result.score, 0) / secondHalf.length;
        
        if (secondAvg > firstAvg * 1.05) improvementTrend = 'improving';
        else if (secondAvg < firstAvg * 0.95) improvementTrend = 'declining';
    }
    
    return {
        averageScore,
        bestScore,
        worstScore,
        improvementTrend,
        sessionCount: filteredResults.length
    };
};