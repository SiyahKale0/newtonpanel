// src/types/analysis.ts

// Analysis and reporting types for the Newton Panel system

export interface RomAnalysisReport {
    patientID: string;
    measurementDate: string;
    overallScore: number;
    fingerRanges: {
        thumb: { flexion: number; extension: number; abduction: number; };
        index: { flexion: number; extension: number; abduction: number; };
        middle: { flexion: number; extension: number; abduction: number; };
        ring: { flexion: number; extension: number; abduction: number; };
        pinky: { flexion: number; extension: number; abduction: number; };
    };
    wristRange: {
        flexion: number;
        extension: number;
        ulnarDeviation: number;
        radialDeviation: number;
    };
    gripStrength: number;
    notes: string;
    comparison?: RomComparison;
    recommendations: string[];
}

export interface RomComparison {
    fingerRanges: {
        thumb: { flexion: number; extension: number; abduction: number; };
        index: { flexion: number; extension: number; abduction: number; };
        middle: { flexion: number; extension: number; abduction: number; };
        ring: { flexion: number; extension: number; abduction: number; };
        pinky: { flexion: number; extension: number; abduction: number; };
    };
    wristRange: {
        flexion: number;
        extension: number;
        ulnarDeviation: number;
        radialDeviation: number;
    };
    gripStrength: number;
    overallImprovement: number;
}

export interface SessionAnalysisReport {
    sessionId: string;
    patientID: string;
    date: string;
    gameType?: 'appleGame' | 'fingerDance';
    duration: {
        calibrationTime: number;
        gameTime: number;
        restTime: number;
        totalTime: number;
    };
    performanceMetrics?: {
        averageAccuracy: number;
        improvementFromLastSession: number;
        fatigueFactor: number;
        motivationLevel: number;
    };
    gameResult?: any; // Would be GameResult but avoiding import issues
    analysis: {
        efficiency: number;
        engagement: number;
        improvement: number;
        fatigue: number;
        recommendations: string[];
    };
}

export interface FingerDancePerformanceSummary {
    songName: string;
    difficulty: 'easy' | 'medium' | 'hard';
    accuracy: number;
    score: number;
    totalNotes: number;
    hitNotes: number;
    missedNotes: number;
    maxCombo: number;
    duration: number;
    averageFingerAccuracy: number;
    weakestFinger: { finger: string; accuracy: number };
    strongestFinger: { finger: string; accuracy: number };
}

// Validation types
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

export interface DataQuality {
    completeness: number;      // 0-1 scale
    accuracy: number;          // 0-1 scale
    consistency: number;       // 0-1 scale
    timeliness: number;        // 0-1 scale
    overallScore: number;      // 0-100 scale
}

// Progress tracking types
export interface ProgressTrend {
    period: 'week' | 'month' | 'quarter' | 'year';
    direction: 'improving' | 'stable' | 'declining';
    rate: number;              // Rate of change per period
    confidence: number;        // Statistical confidence 0-1
}

export interface Milestone {
    id: string;
    title: string;
    description: string;
    targetValue: number;
    currentValue: number;
    unit: string;
    achieved: boolean;
    achievedDate?: string;
    targetDate: string;
}

// Alert and notification types
export interface Alert {
    id: string;
    type: 'warning' | 'error' | 'info';
    priority: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    message: string;
    patientID: string;
    createdAt: string;
    acknowledged: boolean;
    acknowledgedAt?: string;
    acknowledgedBy?: string;
}

export interface RecommendationEngine {
    sessionFrequency: {
        recommended: number;      // Sessions per week
        current: number;
        reasoning: string;
    };
    difficultyLevel: {
        recommended: 'easy' | 'medium' | 'hard';
        current: 'easy' | 'medium' | 'hard';
        reasoning: string;
    };
    exerciseTypes: {
        primary: string[];
        secondary: string[];
        avoid: string[];
    };
    goals: {
        shortTerm: string[];      // 1-4 weeks
        mediumTerm: string[];     // 1-3 months
        longTerm: string[];       // 3+ months
    };
}