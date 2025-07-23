// src/lib/analytics.ts
import { Session, GameConfig, SessionResult } from '@/types/firebase';
import { PerformanceMetrics, ImprovementSuggestion } from '@/types/analytics';
import {
  TrendingDown,
  Target, 
  Activity,
  Calendar,
  Award
} from 'lucide-react';

const FINGER_NAMES = [
  "Sol Serçe", "Sol Yüzük", "Sol Orta", "Sol İşaret", "Sol Başparmak",
  "Sağ Başparmak", "Sağ İşaret", "Sağ Orta", "Sağ Yüzük", "Sağ Serçe"
];

// Yardımcı fonksiyonlar
export const getWeekKey = (date: Date): string => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay()||7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1)/7);
    return `${d.getUTCFullYear()}-W${weekNo}`;
};

export const calculateConsistency = (weeklyData: { sessions: number }[]): number => {
    if (weeklyData.length < 2) return 100;
    const sessionsPerWeek = weeklyData.map(d => d.sessions);
    const mean = sessionsPerWeek.reduce((a, b) => a + b, 0) / sessionsPerWeek.length;
    if (mean === 0) return 0;
    const stdDev = Math.sqrt(sessionsPerWeek.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / sessionsPerWeek.length);
    // Normalize to a 0-100 scale, where lower deviation is better
    return Math.max(0, Math.round(100 - (stdDev / mean) * 100));
};

/**
 * Calculates the duration of a session in seconds from HH:MM:SS time strings.
 * Handles sessions that cross midnight.
 * @param startTime - The start time of the session (e.g., "23:55:00").
 * @param endTime - The end time of the session (e.g., "00:05:00").
 * @returns The duration in seconds.
 */
const getSessionDurationInSeconds = (startTime: string, endTime: string): number => {
    if (!startTime || !endTime) return 0;
    try {
        const start = new Date(`1970-01-01T${startTime}Z`);
        const end = new Date(`1970-01-01T${endTime}Z`);
        if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
        let duration = (end.getTime() - start.getTime()) / 1000;
        if (duration < 0) {
            duration += 24 * 60 * 60; // Handle midnight crossing
        }
        return duration;
    } catch (e) {
        console.error("Error parsing session time:", e);
        return 0;
    }
};

/**
 * Calculates comprehensive performance metrics for a patient based on their sessions, results, and game configurations.
 * @param sessions - An array of session objects.
 * @param results - A record of session results.
 * @param gameConfigs - A record of game configurations.
 * @returns A PerformanceMetrics object containing calculated analytics.
 */
export const calculatePerformanceMetrics = (
    sessions: Session[],
    results: Record<string, SessionResult>,
    gameConfigs: Record<string, GameConfig>,
    roms: Record<string, { finger: { min: number; max: number }[] }>
): PerformanceMetrics => {
    let totalGameTimeInSeconds = 0;
    let totalScore = 0;
    let scoreCount = 0;
    let bestScore = 0;
    let totalResponseTime = 0;
    let responseTimeCount = 0;
    const gamePreference: { [key: string]: number } = {};
    const weeklyData: { [key: string]: { sessions: number; totalScore: number; scoreCount: number; totalTime: number } } = {};
    const fingerPerformance: { [key: string]: { total: number; success: number } } = {};
    const difficultyData: { [level: number]: { successScores: number[]; attempts: number } } = {};
    const romData: { [key: string]: { values: number[]; count: number } } = {};

    sessions.forEach(session => {
        // Basic session data
        totalGameTimeInSeconds += getSessionDurationInSeconds(session.startTime, session.endTime);
        if (session.gameType) {
            gamePreference[session.gameType] = (gamePreference[session.gameType] || 0) + 1;
        }
        const weekKey = getWeekKey(new Date(session.date));
        if (!weeklyData[weekKey]) {
            weeklyData[weekKey] = { sessions: 0, totalScore: 0, scoreCount: 0, totalTime: 0 };
        }
        weeklyData[weekKey].sessions++;

        // Find the corresponding session result
        const sessionNumber = session.id.split('_').pop();
        // The result key can be in two formats: `_result_` for fingerDance or `_results_` for appleGame history
        const resultId = `${session.patientID}_results_${sessionNumber}`;
        const alternativeResultId = `${session.patientID}_result_${sessionNumber}`;
        const sessionResult = results[resultId] || results[alternativeResultId];

        if (!sessionResult) {
            return; // Skip if no result found for the session
        }

        const configId = session.gameConfigID;
        const config = configId ? gameConfigs[configId] : undefined;

        // Process Apple Game results (from history)
        if (sessionResult.history && config && config.gameType === 'appleGame') {
            sessionResult.history.forEach(item => {
                // Assuming 'item.timestamp' can be used to derive response time if needed,
                // but for now, we'll focus on more direct time logs.
                if (item.percent !== undefined) {
                    const score = item.percent;
                    totalScore += score;
                    scoreCount++;
                    bestScore = Math.max(bestScore, score);
                    weeklyData[weekKey].totalScore += score;
                    weeklyData[weekKey].scoreCount++;

                    // Difficulty analysis for Apple Game
                    const level = item.level ?? config.level; // Prefer level from history item
                    if (level !== undefined) {
                        if (!difficultyData[level]) {
                            difficultyData[level] = { successScores: [], attempts: 0 };
                        }
                        difficultyData[level].successScores.push(score);
                    }
                }
            });
            const level = config.level;
            if (level !== undefined) {
                if (!difficultyData[level]) {
                    difficultyData[level] = { successScores: [], attempts: 0 };
                }
                difficultyData[level].attempts++;
            }
        }

        // Process Finger Dance results
        if (sessionResult.results && config && config.gameType === 'fingerDance') {
            sessionResult.results.forEach(gameResult => {
                if (gameResult.gameType === 'fingerDance' && gameResult.notes) {
                    // Finger performance
                    const fingerCounts: { [key: number]: { total: number, success: number } } = {};
                    gameResult.notes.forEach(note => {
                        if (fingerCounts[note.finger] === undefined) {
                            fingerCounts[note.finger] = { total: 0, success: 0 };
                        }
                        fingerCounts[note.finger].total++;
                        if (note.hit) {
                            fingerCounts[note.finger].success++;
                            // Assuming note.time represents the time to hit in ms
                            if (typeof note.time === 'number') {
                                totalResponseTime += note.time;
                                responseTimeCount++;
                            }
                        }
                    });

                    Object.entries(fingerCounts).forEach(([fingerIndex, counts]) => {
                        const fingerName = FINGER_NAMES[parseInt(fingerIndex, 10)] || `Parmak ${fingerIndex}`;
                        if (!fingerPerformance[fingerName]) {
                            fingerPerformance[fingerName] = { total: 0, success: 0 };
                        }
                        fingerPerformance[fingerName].total += counts.total;
                        fingerPerformance[fingerName].success += counts.success;
                    });

                    // Score calculation
                    const takes = gameResult.takes || 0;
                    const mistakes = gameResult.mistakes || 0;
                    const totalNotes = takes + mistakes;
                    const score = totalNotes > 0 ? Math.round((takes / totalNotes) * 100) : 0;

                    if (score !== undefined) {
                        totalScore += score;
                        scoreCount++;
                        bestScore = Math.max(bestScore, score);
                        weeklyData[weekKey].totalScore += score;
                        weeklyData[weekKey].scoreCount++;
                    }
                }
            });
        }

        // ROM Analysis
        const rom = roms[session.romID];
        if (rom && rom.finger) {
            rom.finger.forEach((fingerRom: { min: number; max: number }, index: number) => {
                const fingerName = FINGER_NAMES[index] || `Parmak ${index}`;
                if (!romData[fingerName]) {
                    romData[fingerName] = { values: [], count: 0 };
                }
                const range = Math.abs(fingerRom.min - fingerRom.max);
                romData[fingerName].values.push(range);
                romData[fingerName].count++;
            });
        }
    });

    const weeklyProgress = Object.entries(weeklyData)
        .map(([week, data]) => ({
            week,
            sessions: data.sessions,
            averageScore: data.scoreCount > 0 ? Math.round(data.totalScore / data.scoreCount) : 0,
            totalTime: data.totalTime
        }))
        .sort((a, b) => a.week.localeCompare(b.week));

    const fingerPerformanceArray = Object.entries(fingerPerformance)
        .map(([finger, data]) => ({
            finger,
            accuracy: data.total > 0 ? Math.round((data.success / data.total) * 100) : 0,
            improvement: Math.random() * 20 - 10 // Placeholder for improvement
        }));

    const averageScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;
    const improvementTrend = weeklyProgress.length > 1
        ? weeklyProgress[weeklyProgress.length - 1].averageScore - weeklyProgress[0].averageScore
        : 0;

    const averageSessionDuration = sessions.length > 0 ? Math.round((totalGameTimeInSeconds / sessions.length) / 60) : 0;

    const difficultyProgress = Object.entries(difficultyData).map(([level, data]) => ({
        level: Number(level),
        successRate: data.successScores.length > 0 ? Math.round(data.successScores.reduce((a, b) => a + b, 0) / data.successScores.length) : 0,
        attempts: data.attempts,
    })).sort((a, b) => a.level - b.level);

    const romAnalysis = Object.entries(romData).map(([finger, data]) => ({
        finger,
        rom: data.count > 0 ? Math.round((data.values.reduce((a, b) => a + b, 0) / data.count) * 100) : 0,
    }));

    return {
        totalSessions: sessions.length,
        totalGameTime: Math.round(totalGameTimeInSeconds / 60),
        averageSessionDuration,
        averageResponseTime: responseTimeCount > 0 ? Math.round(totalResponseTime / responseTimeCount) : 0,
        averageScore,
        bestScore,
        improvementTrend,
        sessionConsistency: calculateConsistency(weeklyProgress),
        gamePreference,
        weeklyProgress,
        fingerPerformance: fingerPerformanceArray,
        difficultyProgress: difficultyProgress.length > 0 ? difficultyProgress : [],
        romAnalysis: romAnalysis.length > 0 ? romAnalysis : [],
    };
};

export const generateImprovementSuggestions = (metrics: PerformanceMetrics): ImprovementSuggestion[] => {
    const suggestions: ImprovementSuggestion[] = [];

    if (metrics.improvementTrend < 0) {
        suggestions.push({
            icon: TrendingDown,
            color: "text-red-500",
            text: `<strong>Gelişim Trendi Negatif:</strong> Son zamanlarda performans düşüşü gözlemleniyor. Zorlandığınız aktiviteleri tekrar gözden geçirin ve zorluk seviyesini bir adım düşürmeyi düşünün.`
        });
    }

    if (metrics.averageScore < 70) {
        suggestions.push({
            icon: Target,
            color: "text-yellow-500",
            text: `<strong>Ortalama Başarı Düşük:</strong> Genel başarı oranını artırmak için temel seviyelerdeki oyunlara ve aktivitelere odaklanmak faydalı olabilir.`
        });
    }
    
    if (metrics.fingerPerformance.length > 0) {
        const weakestFinger = metrics.fingerPerformance.reduce((prev, curr) => 
            prev.accuracy < curr.accuracy ? prev : curr
        );
        if (weakestFinger.accuracy < 60) {
            suggestions.push({
                icon: Activity,
                color: "text-blue-500",
                text: `<strong>Zayıf Parmak Tespiti:</strong> Özellikle <strong>${weakestFinger.finger}</strong> parmağınızın performansını artırmak için 'Parmak Dansı' oyununda bu parmağa özel egzersizler yapın.`
            });
        }
    }

    if (metrics.sessionConsistency < 80) {
        suggestions.push({
            icon: Calendar,
            color: "text-purple-500",
            text: `<strong>Tutarsız Performans:</strong> Seanslar arasında performans dalgalanmaları var. Daha düzenli ve kısa süreli pratikler, tutarlılığı artırmaya yardımcı olabilir.`
        });
    }

    if(suggestions.length === 0){
        suggestions.push({
            icon: Award,
            color: "text-green-500",
            text: `<strong>Harika Gidiyorsun:</strong> Performans metrikleriniz oldukça iyi. Mevcut çalışma düzeninizi koruyarak gelişiminizi sürdürebilirsiniz.`
        });
    }

    return suggestions;
  }