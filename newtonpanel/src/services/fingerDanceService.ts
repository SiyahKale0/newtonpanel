// src/services/fingerDanceService.ts

import { db } from './firebase';
import { ref, set, get, update, remove, push, child } from "firebase/database";
import { FingerDanceResult } from '@/types/firebase';
import { FingerMovementLog, FingerMovementEntry } from '@/types/fingerDance';

// Firebase collections
const fingerDanceResultsRef = ref(db, 'fingerDanceResults');
const fingerMovementLogsRef = ref(db, 'fingerMovementLogs');

/**
 * Create a new FingerDance game result
 */
export const createFingerDanceResult = async (data: Omit<FingerDanceResult, 'id'>): Promise<FingerDanceResult> => {
    const newRef = push(fingerDanceResultsRef);
    if (!newRef.key) throw new Error("ID oluşturulamadı.");
    await set(newRef, data);
    return { id: newRef.key, ...data } as FingerDanceResult;
};

/**
 * Create a new finger movement log
 */
export const createFingerMovementLog = async (data: Omit<FingerMovementLog, 'totalEntries'>): Promise<FingerMovementLog> => {
    const newRef = push(fingerMovementLogsRef);
    if (!newRef.key) throw new Error("Movement log ID oluşturulamadı.");
    
    const logData = {
        ...data,
        totalEntries: data.fingerMovements.length
    };
    
    await set(newRef, logData);
    return { id: newRef.key, ...logData } as FingerMovementLog & { id: string };
};

/**
 * Add a movement entry to an existing log
 */
export const addMovementEntry = async (logId: string, entry: FingerMovementEntry): Promise<void> => {
    const logRef = child(fingerMovementLogsRef, logId);
    const snapshot = await get(logRef);
    
    if (!snapshot.exists()) {
        throw new Error("Movement log bulunamadı.");
    }
    
    const currentLog = snapshot.val() as FingerMovementLog;
    const updatedMovements = [...currentLog.fingerMovements, entry];
    
    await update(logRef, {
        fingerMovements: updatedMovements,
        totalEntries: updatedMovements.length,
        recordingEndTime: new Date().toISOString()
    });
};

/**
 * Get FingerDance result by ID
 */
export const getFingerDanceResultById = async (id: string): Promise<FingerDanceResult | null> => {
    const snapshot = await get(child(fingerDanceResultsRef, id));
    if (!snapshot.exists()) return null;
    return { id: snapshot.key, ...snapshot.val() } as FingerDanceResult;
};

/**
 * Get finger movement log by ID
 */
export const getFingerMovementLogById = async (id: string): Promise<FingerMovementLog | null> => {
    const snapshot = await get(child(fingerMovementLogsRef, id));
    if (!snapshot.exists()) return null;
    return { id: snapshot.key, ...snapshot.val() } as FingerMovementLog & { id: string };
};

/**
 * Get all FingerDance results for a patient
 */
export const getFingerDanceResultsByPatient = async (patientId: string): Promise<FingerDanceResult[]> => {
    const snapshot = await get(fingerDanceResultsRef);
    if (!snapshot.exists()) return [];
    
    const data = snapshot.val();
    // Note: This is a simplified implementation. In a real scenario, you would 
    // need proper indexing or join with sessions to filter by patient
    return Object.keys(data)
        .map(key => ({ id: key, ...data[key] }))
        .filter((result: FingerDanceResult) => {
            // For now, return all results as we don't have direct patient reference
            // In real implementation, would filter through session data
            return Boolean(result && patientId);
        });
};

/**
 * Calculate finger performance metrics from movement log
 */
export const calculateFingerPerformance = (movementLog: FingerMovementLog) => {
    const fingerStats = {
        finger1: { hits: 0, misses: 0, accuracy: 0 },
        finger2: { hits: 0, misses: 0, accuracy: 0 },
        finger3: { hits: 0, misses: 0, accuracy: 0 },
        finger4: { hits: 0, misses: 0, accuracy: 0 },
        finger5: { hits: 0, misses: 0, accuracy: 0 }
    };

    movementLog.fingerMovements.forEach(movement => {
        const fingerKey = `finger${movement.targetFinger}` as keyof typeof fingerStats;
        
        if (movement.hit) {
            fingerStats[fingerKey].hits++;
        } else {
            fingerStats[fingerKey].misses++;
        }
    });

    // Calculate accuracy for each finger
    Object.keys(fingerStats).forEach(key => {
        const finger = fingerStats[key as keyof typeof fingerStats];
        const total = finger.hits + finger.misses;
        finger.accuracy = total > 0 ? finger.hits / total : 0;
    });

    return fingerStats;
};

/**
 * Generate FingerDance performance summary
 */
export const generatePerformanceSummary = (result: FingerDanceResult) => {
    return {
        songName: result.songName,
        difficulty: result.difficulty,
        accuracy: result.accuracy,
        score: result.score,
        totalNotes: result.totalNotes,
        hitNotes: result.hitNotes,
        missedNotes: result.missedNotes,
        maxCombo: result.maxCombo,
        duration: result.timing.duration,
        averageFingerAccuracy: Object.values(result.fingerPerformance)
            .reduce((sum, finger) => sum + finger.accuracy, 0) / 5,
        weakestFinger: Object.entries(result.fingerPerformance)
            .reduce((min, [key, finger]) => 
                finger.accuracy < min.accuracy ? { finger: key, accuracy: finger.accuracy } : min,
                { finger: 'finger1', accuracy: 1 }
            ),
        strongestFinger: Object.entries(result.fingerPerformance)
            .reduce((max, [key, finger]) => 
                finger.accuracy > max.accuracy ? { finger: key, accuracy: finger.accuracy } : max,
                { finger: 'finger1', accuracy: 0 }
            )
    };
};

/**
 * Update FingerDance result
 */
export const updateFingerDanceResult = async (id: string, updates: Partial<Omit<FingerDanceResult, 'id'>>): Promise<void> => {
    return update(child(fingerDanceResultsRef, id), updates);
};

/**
 * Delete FingerDance result
 */
export const deleteFingerDanceResult = async (id: string): Promise<void> => {
    return remove(child(fingerDanceResultsRef, id));
};

/**
 * Delete finger movement log
 */
export const deleteFingerMovementLog = async (id: string): Promise<void> => {
    return remove(child(fingerMovementLogsRef, id));
};