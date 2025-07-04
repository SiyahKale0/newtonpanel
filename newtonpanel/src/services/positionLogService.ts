// src/services/positionLogService.ts

import { db } from './firebase';
import { ref, set, get, push, child, query, orderByChild, equalTo } from "firebase/database";
import { PositionLog, PositionLogEntry } from '@/types/firebase';

const collectionRef = ref(db, 'positionLogs');

/**
 * Yeni bir pozisyon log kaydı oluşturur
 * @param data Pozisyon log verileri
 * @returns Oluşturulan pozisyon log
 */
export const createPositionLog = async (data: Omit<PositionLog, 'id'>): Promise<PositionLog> => {
    const newRef = push(collectionRef);
    if (!newRef.key) throw new Error("Pozisyon log ID oluşturulamadı.");
    
    const logData = {
        ...data,
        data: [] // Başlangıçta boş, gerçek zamanlı olarak doldurulacak
    };
    
    await set(newRef, logData);
    return { id: newRef.key, ...logData };
};

/**
 * Pozisyon log'a yeni bir entry ekler (gerçek zamanlı)
 * @param logId Pozisyon log ID'si
 * @param entry Eklenecek pozisyon verisi
 */
export const addPositionLogEntry = async (logId: string, entry: PositionLogEntry): Promise<void> => {
    const entryRef = push(child(collectionRef, `${logId}/data`));
    await set(entryRef, entry);
};

/**
 * Pozisyon log'a toplu entry ekler (performans için)
 * @param logId Pozisyon log ID'si
 * @param entries Eklenecek pozisyon verileri
 */
export const addMultiplePositionLogEntries = async (logId: string, entries: PositionLogEntry[]): Promise<void> => {
    const updates: { [key: string]: PositionLogEntry } = {};
    
    entries.forEach((entry, index) => {
        const entryKey = `${logId}/data/${Date.now()}_${index}`;
        updates[entryKey] = entry;
    });
    
    await set(ref(db), updates);
};

/**
 * Belirli bir seans için pozisyon log'larını getirir
 * @param sessionId Seans ID'si
 * @returns Pozisyon log'ları
 */
export const getPositionLogsBySession = async (sessionId: string): Promise<PositionLog[]> => {
    const sessionQuery = query(collectionRef, orderByChild('sessionID'), equalTo(sessionId));
    const snapshot = await get(sessionQuery);
    
    if (!snapshot.exists()) return [];
    
    const data = snapshot.val();
    return Object.keys(data).map(key => ({ id: key, ...data[key] }));
};

/**
 * Pozisyon log'u ID ile getirir
 * @param id Pozisyon log ID'si
 * @returns Pozisyon log
 */
export const getPositionLogById = async (id: string): Promise<PositionLog | null> => {
    const snapshot = await get(child(collectionRef, id));
    if (!snapshot.exists()) return null;
    return { id: snapshot.key, ...snapshot.val() };
};

/**
 * Pozisyon log'un veri kısmını getirir (büyük veri optimizasyonu için)
 * @param id Pozisyon log ID'si
 * @param startTime Başlangıç zamanı (isteğe bağlı)
 * @param endTime Bitiş zamanı (isteğe bağlı)
 * @returns Pozisyon log verileri
 */
export const getPositionLogData = async (
    id: string, 
    startTime?: number, 
    endTime?: number
): Promise<PositionLogEntry[]> => {
    const dataRef = child(collectionRef, `${id}/data`);
    const snapshot = await get(dataRef);
    
    if (!snapshot.exists()) return [];
    
    const data = snapshot.val();
    let entries: PositionLogEntry[] = Object.keys(data).map(key => data[key]);
    
    // Zaman aralığı filtresi
    if (startTime || endTime) {
        entries = entries.filter(entry => {
            if (startTime && entry.timestamp < startTime) return false;
            if (endTime && entry.timestamp > endTime) return false;
            return true;
        });
    }
    
    return entries.sort((a, b) => a.timestamp - b.timestamp);
};

/**
 * Pozisyon log'u sonlandırır ve bitiş zamanını ayarlar
 * @param id Pozisyon log ID'si
 * @param endTime Bitiş zamanı
 */
export const finalizePositionLog = async (id: string, endTime: number): Promise<void> => {
    const logRef = child(collectionRef, id);
    await set(child(logRef, 'endTime'), endTime);
};

/**
 * Belirli bir hasta için pozisyon log'larını getirir
 * @param patientId Hasta ID'si
 * @returns Pozisyon log'ları
 */
export const getPositionLogsByPatient = async (patientId: string): Promise<PositionLog[]> => {
    // Önce hasta seanslarını bul, sonra pozisyon log'larını getir
    const sessionsRef = ref(db, 'sessions');
    const sessionsQuery = query(sessionsRef, orderByChild('patientID'), equalTo(patientId));
    const sessionsSnapshot = await get(sessionsQuery);
    
    if (!sessionsSnapshot.exists()) return [];
    
    const sessions = sessionsSnapshot.val();
    const sessionIds = Object.keys(sessions);
    
    // Her seans için pozisyon log'larını getir
    const allLogs: PositionLog[] = [];
    for (const sessionId of sessionIds) {
        const logs = await getPositionLogsBySession(sessionId);
        allLogs.push(...logs);
    }
    
    return allLogs.sort((a, b) => b.startTime - a.startTime);
};

/**
 * Pozisyon log'undan özet istatistikler çıkarır
 * @param id Pozisyon log ID'si
 * @returns Özet istatistikler
 */
export const getPositionLogSummary = async (id: string): Promise<{
    totalDuration: number;
    totalFrames: number;
    avgFrameRate: number;
    handTrackingQuality: {
        left: number;
        right: number;
    };
    movementStats: {
        totalDistance: number;
        avgVelocity: number;
        maxVelocity: number;
    };
} | null> => {
    const entries = await getPositionLogData(id);
    if (entries.length === 0) return null;
    
    const firstEntry = entries[0];
    const lastEntry = entries[entries.length - 1];
    const totalDuration = (lastEntry.timestamp - firstEntry.timestamp) / 1000; // saniye
    
    // Hand tracking quality
    let leftTrackingSum = 0;
    let rightTrackingSum = 0;
    let leftTrackingCount = 0;
    let rightTrackingCount = 0;
    
    // Movement stats
    let totalDistance = 0;
    let velocitySum = 0;
    let maxVelocity = 0;
    
    entries.forEach((entry, index) => {
        // Hand tracking quality
        if (entry.hands.left.isTracked) {
            leftTrackingSum += entry.hands.left.confidence;
            leftTrackingCount++;
        }
        if (entry.hands.right.isTracked) {
            rightTrackingSum += entry.hands.right.confidence;
            rightTrackingCount++;
        }
        
        // Movement stats
        if (index > 0) {
            const prevEntry = entries[index - 1];
            const leftDist = calculateDistance(entry.hands.left.position, prevEntry.hands.left.position);
            const rightDist = calculateDistance(entry.hands.right.position, prevEntry.hands.right.position);
            totalDistance += leftDist + rightDist;
            
            const leftVel = calculateVelocity(entry.hands.left.velocity);
            const rightVel = calculateVelocity(entry.hands.right.velocity);
            const avgVel = (leftVel + rightVel) / 2;
            velocitySum += avgVel;
            maxVelocity = Math.max(maxVelocity, avgVel);
        }
    });
    
    return {
        totalDuration,
        totalFrames: entries.length,
        avgFrameRate: entries.length / totalDuration,
        handTrackingQuality: {
            left: leftTrackingCount > 0 ? leftTrackingSum / leftTrackingCount : 0,
            right: rightTrackingCount > 0 ? rightTrackingSum / rightTrackingCount : 0
        },
        movementStats: {
            totalDistance,
            avgVelocity: velocitySum / Math.max(1, entries.length - 1),
            maxVelocity
        }
    };
};

// Yardımcı fonksiyonlar
function calculateDistance(pos1: { x: number; y: number; z: number }, pos2: { x: number; y: number; z: number }): number {
    return Math.sqrt(
        Math.pow(pos1.x - pos2.x, 2) + 
        Math.pow(pos1.y - pos2.y, 2) + 
        Math.pow(pos1.z - pos2.z, 2)
    );
}

function calculateVelocity(velocity: { x: number; y: number; z: number }): number {
    return Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y + velocity.z * velocity.z);
}