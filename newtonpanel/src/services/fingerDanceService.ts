import { db } from './firebase';
import { ref, set, get, update, remove, push, child, orderByChild, equalTo, query } from "firebase/database";
import { FingerDanceResult, FingerMovement, FingerStats } from '@/types/firebase';

const collectionRef = ref(db, 'fingerDanceResults');

export const createFingerDanceResult = async (data: Omit<FingerDanceResult, 'id'>): Promise<FingerDanceResult> => {
    const newRef = push(collectionRef);
    if (!newRef.key) throw new Error("ID oluşturulamadı.");
    await set(newRef, data);
    return { id: newRef.key, ...data } as FingerDanceResult;
};

export const getAllFingerDanceResults = async (): Promise<FingerDanceResult[]> => {
    const snapshot = await get(collectionRef);
    if (!snapshot.exists()) return [];
    const data = snapshot.val();
    return Object.keys(data).map(key => ({ id: key, ...data[key] }));
};

export const getFingerDanceResultById = async (id: string): Promise<FingerDanceResult | null> => {
    const snapshot = await get(child(collectionRef, id));
    if (!snapshot.exists()) return null;
    return { id: snapshot.key, ...snapshot.val() };
};

export const getFingerDanceResultsBySession = async (sessionID: string): Promise<FingerDanceResult[]> => {
    const sessionQuery = query(collectionRef, orderByChild('sessionID'), equalTo(sessionID));
    const snapshot = await get(sessionQuery);
    if (!snapshot.exists()) return [];
    const data = snapshot.val();
    return Object.keys(data).map(key => ({ id: key, ...data[key] }));
};

export const updateFingerDanceResult = async (id: string, updates: Partial<Omit<FingerDanceResult, 'id'>>): Promise<void> => {
    return update(child(collectionRef, id), updates);
};

export const deleteFingerDanceResult = async (id: string): Promise<void> => {
    return remove(child(collectionRef, id));
};

// Finger performance analysis functions
export const calculateFingerPerformance = (fingerMovements: FingerMovement[]): {
    finger1: FingerStats;
    finger2: FingerStats;
    finger3: FingerStats;
    finger4: FingerStats;
    finger5: FingerStats;
} => {
    const fingerStats = {
        finger1: { hits: 0, misses: 0, accuracy: 0 },
        finger2: { hits: 0, misses: 0, accuracy: 0 },
        finger3: { hits: 0, misses: 0, accuracy: 0 },
        finger4: { hits: 0, misses: 0, accuracy: 0 },
        finger5: { hits: 0, misses: 0, accuracy: 0 }
    };

    fingerMovements.forEach(movement => {
        const fingerKey = `finger${movement.targetFinger}` as keyof typeof fingerStats;
        if (fingerStats[fingerKey]) {
            if (movement.hit) {
                fingerStats[fingerKey].hits++;
            } else {
                fingerStats[fingerKey].misses++;
            }
        }
    });

    // Calculate accuracy for each finger
    Object.keys(fingerStats).forEach(fingerKey => {
        const stats = fingerStats[fingerKey as keyof typeof fingerStats];
        const total = stats.hits + stats.misses;
        stats.accuracy = total > 0 ? (stats.hits / total) * 100 : 0;
    });

    return fingerStats;
};

export const calculateGameMetrics = (fingerMovements: FingerMovement[]): {
    totalNotes: number;
    hitNotes: number;
    missedNotes: number;
    accuracy: number;
    maxCombo: number;
    totalScore: number;
} => {
    const totalNotes = fingerMovements.length;
    const hitNotes = fingerMovements.filter(m => m.hit).length;
    const missedNotes = totalNotes - hitNotes;
    const accuracy = totalNotes > 0 ? (hitNotes / totalNotes) * 100 : 0;
    const totalScore = fingerMovements.reduce((sum, m) => sum + m.score, 0);

    // Calculate max combo
    let maxCombo = 0;
    let currentCombo = 0;
    fingerMovements.forEach(movement => {
        if (movement.hit) {
            currentCombo++;
            maxCombo = Math.max(maxCombo, currentCombo);
        } else {
            currentCombo = 0;
        }
    });

    return {
        totalNotes,
        hitNotes,
        missedNotes,
        accuracy,
        maxCombo,
        totalScore
    };
};

// Position logging functions for position_log.json format adaptation
export const logFingerPosition = (
    sessionID: string,
    timestamp: number,
    fingerPositions: {
        thumb: string;
        index: string;
        middle: string;
        ring: string;
        pinky: string;
    }
): FingerMovement => {
    return {
        timestamp,
        targetFinger: 0, // Will be set by game logic
        actualFingers: [], // Will be determined by position analysis
        fingerPositions,
        hit: false, // Will be determined by game logic
        timing: 'miss', // Will be determined by game logic
        score: 0 // Will be calculated by game logic
    };
};

export const analyzeFingerMovementPattern = (movements: FingerMovement[]): {
    dominantFinger: number;
    averageReactionTime: number;
    consistencyScore: number;
} => {
    if (movements.length === 0) {
        return {
            dominantFinger: 1,
            averageReactionTime: 0,
            consistencyScore: 0
        };
    }

    // Find dominant finger (most used)
    const fingerUsage = movements.reduce((acc, movement) => {
        acc[movement.targetFinger] = (acc[movement.targetFinger] || 0) + 1;
        return acc;
    }, {} as Record<number, number>);

    const dominantFinger = Object.entries(fingerUsage).reduce((a, b) => 
        fingerUsage[Number(a[0])] > fingerUsage[Number(b[0])] ? a : b
    )[0];

    // Calculate average reaction time (simplified)
    const reactionTimes = movements.map(m => m.timestamp);
    const averageReactionTime = reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length;

    // Calculate consistency score based on hit rate
    const hitRate = movements.filter(m => m.hit).length / movements.length;
    const consistencyScore = hitRate * 100;

    return {
        dominantFinger: Number(dominantFinger),
        averageReactionTime,
        consistencyScore
    };
};