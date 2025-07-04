// src/types/fingerDance.ts

// FingerDance position logging types
export interface FingerPosition {
    x: number;
    y: number;
    z: number;
}

export interface FingerMovementEntry {
    timestamp: number;              // Milliseconds since game start
    targetFinger: number;           // Expected finger (1-5)
    actualFingers: number[];        // Actual fingers detected
    fingerPositions: {
        thumb: FingerPosition;      // Finger 1
        index: FingerPosition;      // Finger 2
        middle: FingerPosition;     // Finger 3
        ring: FingerPosition;       // Finger 4
        pinky: FingerPosition;      // Finger 5
    };
    hit: boolean;                   // Whether the note was hit correctly
    timing: 'perfect' | 'good' | 'miss' | 'early' | 'late';
    score: number;                  // Points awarded for this note
}

export interface FingerMovementLog {
    sessionID: string;
    gameType: 'fingerDance';
    songName: string;
    fingerMovements: FingerMovementEntry[];
    totalEntries: number;
    recordingStartTime: string;     // ISO timestamp
    recordingEndTime: string;       // ISO timestamp
}

// Individual finger performance tracking
export interface FingerPerformance {
    hits: number;
    misses: number;
    accuracy: number;               // hits / (hits + misses)
}

// Timing data for session analysis
export interface TimingData {
    startTime: string;              // ISO timestamp
    endTime: string;                // ISO timestamp
    duration: number;               // Total duration in milliseconds
}

// Performance metrics for session analysis
export interface SessionPerformanceMetrics {
    averageAccuracy: number;
    improvementFromLastSession: number;
    fatigueFactor: number;          // 0-1 scale, higher = more fatigued
    motivationLevel: number;        // 1-10 scale
}