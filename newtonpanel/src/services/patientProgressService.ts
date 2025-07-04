import { db } from './firebase';
import { ref, get, orderByChild, equalTo, query } from "firebase/database";
import { Patient, Session, GameResult, DetailedRom } from '@/types/firebase';
import { getPatientById } from './patientService';
import { getSessionAnalyticsByPatient, calculatePatientProgress } from './sessionAnalysisService';
import { getDetailedRomsByPatient, compareRomProgress } from './romAnalysisService';

export interface PatientProgressReport {
    patientInfo: {
        id: string;
        name: string;
        age: number;
        diagnosis: string;
        startDate: string;
        totalSessions: number;
    };
    performanceMetrics: {
        overall: {
            averageScore: number;
            averageAccuracy: number;
            improvementRate: number;
            consistencyScore: number;
        };
        fingerDance?: {
            averageAccuracy: number;
            bestCombo: number;
            mostUsedFinger: number;
            fingerPerformanceBalance: number;
        };
        appleGame?: {
            averageSuccessRate: number;
            averageReactionTime: number;
            handCoordination: number;
        };
    };
    romProgress: {
        latest: DetailedRom | null;
        previous: DetailedRom | null;
        improvement: number;
        specificImprovements: {
            fingerFlexibility: number;
            wristMobility: number;
            gripStrength: number;
        };
    };
    timelineAnalysis: {
        weeklyProgress: Array<{
            week: string;
            averageScore: number;
            sessionCount: number;
            accuracyTrend: number;
        }>;
        milestones: Array<{
            date: string;
            achievement: string;
            metric: string;
            value: number;
        }>;
    };
    recommendations: {
        immediate: string[];
        shortTerm: string[];
        longTerm: string[];
    };
    riskFactors: Array<{
        factor: string;
        severity: 'low' | 'medium' | 'high';
        description: string;
    }>;
}

export interface ComprehensiveProgressAnalysis {
    patientId: string;
    analysisDate: string;
    reportPeriod: number; // days
    overallTrend: 'significant_improvement' | 'moderate_improvement' | 'stable' | 'declining' | 'concerning';
    keyInsights: string[];
    nextSteps: string[];
}

export const generatePatientProgressReport = async (
    patientId: string,
    periodDays: number = 90
): Promise<PatientProgressReport | null> => {
    const patient = await getPatientById(patientId);
    if (!patient) return null;

    // Get patient sessions and analysis
    const sessionAnalyses = await getSessionAnalyticsByPatient(patientId, 50);
    const progressData = await calculatePatientProgress(patientId, periodDays);

    // Get ROM data
    const romData = await getDetailedRomsByPatient(patientId);
    const sortedRomData = romData.sort((a, b) => new Date(b.measurementDate).getTime() - new Date(a.measurementDate).getTime());
    const latestRom = sortedRomData[0] || null;
    const previousRom = sortedRomData[1] || null;

    // Calculate ROM progress
    let romProgressData = {
        latest: latestRom,
        previous: previousRom,
        improvement: 0,
        specificImprovements: {
            fingerFlexibility: 0,
            wristMobility: 0,
            gripStrength: 0
        }
    };

    if (latestRom && previousRom) {
        const romComparison = compareRomProgress(previousRom, latestRom);
        romProgressData.improvement = romComparison.overallImprovement;
        
        // Calculate specific improvements
        const fingerImprovements = Object.values(romComparison.fingerImprovements);
        romProgressData.specificImprovements.fingerFlexibility = 
            fingerImprovements.reduce((sum, imp) => sum + imp, 0) / fingerImprovements.length;
        
        const wristImprovements = Object.values(romComparison.wristImprovements);
        romProgressData.specificImprovements.wristMobility = 
            wristImprovements.reduce((sum, imp) => sum + imp, 0) / wristImprovements.length;
        
        romProgressData.specificImprovements.gripStrength = romComparison.gripStrengthImprovement;
    }

    // Calculate performance metrics
    const fingerDanceSessions = sessionAnalyses.filter(s => s.gameType === 'fingerDance');
    const appleGameSessions = sessionAnalyses.filter(s => s.gameType === 'appleGame');

    const performanceMetrics = {
        overall: {
            averageScore: progressData.averageScore,
            averageAccuracy: progressData.averageAccuracy,
            improvementRate: progressData.improvementRate,
            consistencyScore: calculateConsistencyScore(sessionAnalyses)
        },
        fingerDance: fingerDanceSessions.length > 0 ? {
            averageAccuracy: fingerDanceSessions.reduce((sum, s) => sum + s.performance.accuracy, 0) / fingerDanceSessions.length,
            bestCombo: Math.max(...fingerDanceSessions.map(s => s.fingerDanceMetrics?.maxCombo || 0)),
            mostUsedFinger: findMostUsedFinger(fingerDanceSessions),
            fingerPerformanceBalance: calculateFingerBalance(fingerDanceSessions)
        } : undefined,
        appleGame: appleGameSessions.length > 0 ? {
            averageSuccessRate: appleGameSessions.reduce((sum, s) => sum + s.performance.accuracy, 0) / appleGameSessions.length,
            averageReactionTime: appleGameSessions.reduce((sum, s) => sum + (s.appleGameMetrics?.averageTime || 0), 0) / appleGameSessions.length,
            handCoordination: calculateHandCoordination(appleGameSessions)
        } : undefined
    };

    // Generate timeline analysis
    const timelineAnalysis = generateTimelineAnalysis(sessionAnalyses, periodDays);

    // Generate recommendations and risk factors
    const recommendations = generateRecommendations(
        progressData,
        performanceMetrics,
        romProgressData,
        sessionAnalyses
    );
    
    const riskFactors = identifyRiskFactors(
        progressData,
        performanceMetrics,
        romProgressData,
        patient
    );

    // Get first session date
    const allSessions = sessionAnalyses.sort((a, b) => new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime());
    const startDate = allSessions.length > 0 ? allSessions[0].sessionDate : patient.id; // fallback to patient creation

    return {
        patientInfo: {
            id: patient.id,
            name: patient.name,
            age: patient.age,
            diagnosis: patient.diagnosis,
            startDate,
            totalSessions: progressData.totalSessions
        },
        performanceMetrics,
        romProgress: romProgressData,
        timelineAnalysis,
        recommendations,
        riskFactors
    };
};

export const trackPatientMilestones = async (patientId: string): Promise<Array<{
    date: string;
    type: 'performance' | 'rom' | 'consistency';
    achievement: string;
    metric: string;
    value: number;
    significance: 'minor' | 'major' | 'breakthrough';
}>> => {
    const sessionAnalyses = await getSessionAnalyticsByPatient(patientId, 100);
    const milestones: Array<{
        date: string;
        type: 'performance' | 'rom' | 'consistency';
        achievement: string;
        metric: string;
        value: number;
        significance: 'minor' | 'major' | 'breakthrough';
    }> = [];

    // Track performance milestones
    let bestScore = 0;
    let bestAccuracy = 0;
    let longestStreak = 0;
    let currentStreak = 0;

    sessionAnalyses.reverse().forEach((session, index) => {
        // Score milestones
        if (session.performance.score > bestScore) {
            bestScore = session.performance.score;
            milestones.push({
                date: session.sessionDate,
                type: 'performance',
                achievement: `Yeni en yüksek puan: ${bestScore}`,
                metric: 'score',
                value: bestScore,
                significance: bestScore > (sessionAnalyses[index - 1]?.performance.score || 0) * 1.2 ? 'major' : 'minor'
            });
        }

        // Accuracy milestones
        if (session.performance.accuracy > bestAccuracy) {
            bestAccuracy = session.performance.accuracy;
            milestones.push({
                date: session.sessionDate,
                type: 'performance',
                achievement: `Yeni en yüksek doğruluk: ${bestAccuracy.toFixed(1)}%`,
                metric: 'accuracy',
                value: bestAccuracy,
                significance: bestAccuracy > 90 ? 'major' : 'minor'
            });
        }

        // Consistency streak
        if (session.performance.accuracy > 75) {
            currentStreak++;
            if (currentStreak > longestStreak) {
                longestStreak = currentStreak;
                if (longestStreak >= 5) {
                    milestones.push({
                        date: session.sessionDate,
                        type: 'consistency',
                        achievement: `${longestStreak} seans üst üste %75+ doğruluk`,
                        metric: 'consistency_streak',
                        value: longestStreak,
                        significance: longestStreak >= 10 ? 'breakthrough' : 'major'
                    });
                }
            }
        } else {
            currentStreak = 0;
        }
    });

    return milestones.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const generateComprehensiveProgressAnalysis = async (
    patientId: string,
    periodDays: number = 30
): Promise<ComprehensiveProgressAnalysis | null> => {
    const progressReport = await generatePatientProgressReport(patientId, periodDays);
    if (!progressReport) return null;

    const keyInsights: string[] = [];
    const nextSteps: string[] = [];
    
    // Analyze overall trend
    let overallTrend: 'significant_improvement' | 'moderate_improvement' | 'stable' | 'declining' | 'concerning' = 'stable';
    
    const improvementRate = progressReport.performanceMetrics.overall.improvementRate;
    const consistencyScore = progressReport.performanceMetrics.overall.consistencyScore;
    const romImprovement = progressReport.romProgress.improvement;

    if (improvementRate > 20 && consistencyScore > 80) {
        overallTrend = 'significant_improvement';
        keyInsights.push("Performansta kayda değer ilerleme görülüyor.");
        nextSteps.push("Zorluk seviyesi kademeli olarak artırılabilir.");
    } else if (improvementRate > 10 || (improvementRate > 5 && consistencyScore > 70)) {
        overallTrend = 'moderate_improvement';
        keyInsights.push("İstikrarlı ilerleme kaydediliyor.");
        nextSteps.push("Mevcut egzersiz programına devam edilmeli.");
    } else if (improvementRate < -15 || consistencyScore < 50) {
        overallTrend = 'concerning';
        keyInsights.push("Performansta belirgin düşüş tespit edildi.");
        nextSteps.push("Egzersiz programının acil gözden geçirilmesi gerekiyor.");
    } else if (improvementRate < -5) {
        overallTrend = 'declining';
        keyInsights.push("Performansta hafif düşüş var.");
        nextSteps.push("Egzersiz sıklığı ve yoğunluğu kontrol edilmeli.");
    }

    // ROM analysis insights
    if (progressReport.romProgress.latest && progressReport.romProgress.previous) {
        if (romImprovement > 10) {
            keyInsights.push("Hareket aralığında önemli iyileşme görülüyor.");
        } else if (romImprovement < -10) {
            keyInsights.push("Hareket aralığında gerileme tespit edildi.");
            nextSteps.push("Fizik tedavi konsültasyonu önerilir.");
        }
    }

    // Session frequency analysis
    if (progressReport.patientInfo.totalSessions < periodDays / 7 * 2) {
        keyInsights.push("Seans sıklığı yetersiz görünüyor.");
        nextSteps.push("Haftada en az 3 seans hedeflenmeli.");
    }

    // Consistency analysis
    if (consistencyScore < 60) {
        keyInsights.push("Performans tutarlılığı geliştirilmeli.");
        nextSteps.push("Daha kısa ve sık seanslar denenebilir.");
    }

    return {
        patientId,
        analysisDate: new Date().toISOString().split('T')[0],
        reportPeriod: periodDays,
        overallTrend,
        keyInsights,
        nextSteps
    };
};

// Helper functions
const calculateConsistencyScore = (sessionAnalyses: any[]): number => {
    if (sessionAnalyses.length === 0) return 0;
    
    const accuracies = sessionAnalyses.map(s => s.performance.accuracy);
    const average = accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length;
    const variance = accuracies.reduce((sum, acc) => sum + Math.pow(acc - average, 2), 0) / accuracies.length;
    
    return Math.max(0, 100 - Math.sqrt(variance));
};

const findMostUsedFinger = (fingerDanceSessions: any[]): number => {
    const fingerUsage: Record<number, number> = {};
    
    fingerDanceSessions.forEach(session => {
        if (session.fingerDanceMetrics?.dominantFingerPerformance) {
            const finger = session.fingerDanceMetrics.dominantFingerPerformance.finger;
            fingerUsage[finger] = (fingerUsage[finger] || 0) + 1;
        }
    });
    
    return Object.entries(fingerUsage).reduce((most, [finger, count]) => 
        count > (fingerUsage[most] || 0) ? Number(finger) : most, 1
    );
};

const calculateFingerBalance = (fingerDanceSessions: any[]): number => {
    // Calculate how balanced finger usage is across all sessions
    const fingerCounts = [0, 0, 0, 0, 0]; // 5 fingers
    
    fingerDanceSessions.forEach(session => {
        if (session.fingerDanceMetrics?.dominantFingerPerformance) {
            const finger = session.fingerDanceMetrics.dominantFingerPerformance.finger;
            if (finger >= 1 && finger <= 5) {
                fingerCounts[finger - 1]++;
            }
        }
    });
    
    const total = fingerCounts.reduce((sum, count) => sum + count, 0);
    if (total === 0) return 0;
    
    const idealCount = total / 5;
    const variance = fingerCounts.reduce((sum, count) => sum + Math.pow(count - idealCount, 2), 0) / 5;
    
    return Math.max(0, 100 - (Math.sqrt(variance) / idealCount) * 100);
};

const calculateHandCoordination = (appleGameSessions: any[]): number => {
    // Simplified hand coordination based on success rate and reaction time
    const avgSuccessRate = appleGameSessions.reduce((sum, s) => sum + s.performance.accuracy, 0) / appleGameSessions.length;
    const avgReactionTime = appleGameSessions.reduce((sum, s) => sum + (s.appleGameMetrics?.averageTime || 3), 0) / appleGameSessions.length;
    
    // Lower reaction time and higher success rate = better coordination
    const timeScore = Math.max(0, 100 - (avgReactionTime - 1) * 20);
    return (avgSuccessRate + timeScore) / 2;
};

const generateTimelineAnalysis = (sessionAnalyses: any[], periodDays: number) => {
    const weeks = Math.ceil(periodDays / 7);
    const weeklyProgress = [];
    
    for (let week = 0; week < weeks; week++) {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - (week + 1) * 7);
        const weekEnd = new Date();
        weekEnd.setDate(weekEnd.getDate() - week * 7);
        
        const weekSessions = sessionAnalyses.filter(session => {
            const sessionDate = new Date(session.sessionDate);
            return sessionDate >= weekStart && sessionDate < weekEnd;
        });
        
        if (weekSessions.length > 0) {
            const averageScore = weekSessions.reduce((sum, s) => sum + s.performance.score, 0) / weekSessions.length;
            const accuracyTrend = weekSessions.length > 1 ? 
                weekSessions[0].performance.accuracy - weekSessions[weekSessions.length - 1].performance.accuracy : 0;
            
            weeklyProgress.unshift({
                week: `Hafta ${week + 1}`,
                averageScore,
                sessionCount: weekSessions.length,
                accuracyTrend
            });
        }
    }
    
    return {
        weeklyProgress,
        milestones: [] // Will be populated by trackPatientMilestones
    };
};

const generateRecommendations = (progressData: any, performanceMetrics: any, romProgressData: any, sessionAnalyses: any[]) => {
    const immediate: string[] = [];
    const shortTerm: string[] = [];
    const longTerm: string[] = [];
    
    // Immediate recommendations
    if (progressData.averageAccuracy < 60) {
        immediate.push("Egzersiz hızını azaltın ve doğruluğa odaklanın.");
    }
    if (progressData.sessionFrequency < 2) {
        immediate.push("Haftada en az 3 seans yapılması önerilir.");
    }
    
    // Short-term recommendations
    if (performanceMetrics.overall.improvementRate > 15) {
        shortTerm.push("Zorluk seviyesi artırılabilir.");
    }
    if (romProgressData.improvement < 0) {
        shortTerm.push("Fizik tedavi desteği alınması önerilir.");
    }
    
    // Long-term recommendations
    if (progressData.progressTrend === 'improving') {
        longTerm.push("6 ay sonra kapsamlı değerlendirme planlanabilir.");
    }
    longTerm.push("Ev egzersiz programı oluşturulması önerilir.");
    
    return { immediate, shortTerm, longTerm };
};

const identifyRiskFactors = (progressData: any, performanceMetrics: any, romProgressData: any, patient: any) => {
    const riskFactors: Array<{
        factor: string;
        severity: 'low' | 'medium' | 'high';
        description: string;
    }> = [];
    
    if (progressData.improvementRate < -20) {
        riskFactors.push({
            factor: "Performans Düşüşü",
            severity: 'high',
            description: "Son dönemde belirgin performans düşüşü gözleniyor."
        });
    }
    
    if (progressData.sessionFrequency < 1) {
        riskFactors.push({
            factor: "Düşük Katılım",
            severity: 'medium',
            description: "Seans katılım sıklığı yetersiz."
        });
    }
    
    if (romProgressData.improvement < -15) {
        riskFactors.push({
            factor: "ROM Gerileme",
            severity: 'high',
            description: "Hareket aralığında kayda değer gerileme tespit edildi."
        });
    }
    
    if (patient.age > 70 && performanceMetrics.overall.consistencyScore < 50) {
        riskFactors.push({
            factor: "Yaş ve Tutarlılık",
            severity: 'medium',
            description: "İleri yaş ve düşük performans tutarlılığı."
        });
    }
    
    return riskFactors;
};