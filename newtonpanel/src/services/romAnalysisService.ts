// src/services/romAnalysisService.ts

import { db } from './firebase';
import { ref, set, get, update, remove, push, child, query, orderByChild, equalTo } from "firebase/database";
import { Rom } from '@/types/firebase';

const romCollectionRef = ref(db, 'roms');

/**
 * Create a new ROM measurement
 */
export const createRomMeasurement = async (data: Omit<Rom, 'id'>): Promise<Rom> => {
    const newRef = push(romCollectionRef);
    if (!newRef.key) throw new Error("ROM ID oluşturulamadı.");
    
    const romData = {
        ...data,
        measurementDate: data.measurementDate || new Date().toISOString()
    };
    
    await set(newRef, romData);
    return { id: newRef.key, ...romData };
};

/**
 * Get ROM measurements for a patient
 */
export const getRomMeasurementsByPatient = async (patientId: string): Promise<Rom[]> => {
    const patientQuery = query(romCollectionRef, orderByChild('patientID'), equalTo(patientId));
    const snapshot = await get(patientQuery);
    
    if (!snapshot.exists()) return [];
    
    const data = snapshot.val();
    return Object.keys(data)
        .map(key => ({ id: key, ...data[key] }))
        .sort((a, b) => new Date(b.measurementDate).getTime() - new Date(a.measurementDate).getTime());
};

/**
 * Get the latest ROM measurement for a patient
 */
export const getLatestRomMeasurement = async (patientId: string): Promise<Rom | null> => {
    const measurements = await getRomMeasurementsByPatient(patientId);
    return measurements.length > 0 ? measurements[0] : null;
};

/**
 * Compare two ROM measurements and calculate improvement
 */
export const compareRomMeasurements = (oldRom: Rom, newRom: Rom) => {
    const improvements = {
        fingerRanges: {
            thumb: {
                flexion: newRom.fingerRanges.thumb.flexion - oldRom.fingerRanges.thumb.flexion,
                extension: newRom.fingerRanges.thumb.extension - oldRom.fingerRanges.thumb.extension,
                abduction: newRom.fingerRanges.thumb.abduction - oldRom.fingerRanges.thumb.abduction
            },
            index: {
                flexion: newRom.fingerRanges.index.flexion - oldRom.fingerRanges.index.flexion,
                extension: newRom.fingerRanges.index.extension - oldRom.fingerRanges.index.extension,
                abduction: newRom.fingerRanges.index.abduction - oldRom.fingerRanges.index.abduction
            },
            middle: {
                flexion: newRom.fingerRanges.middle.flexion - oldRom.fingerRanges.middle.flexion,
                extension: newRom.fingerRanges.middle.extension - oldRom.fingerRanges.middle.extension,
                abduction: newRom.fingerRanges.middle.abduction - oldRom.fingerRanges.middle.abduction
            },
            ring: {
                flexion: newRom.fingerRanges.ring.flexion - oldRom.fingerRanges.ring.flexion,
                extension: newRom.fingerRanges.ring.extension - oldRom.fingerRanges.ring.extension,
                abduction: newRom.fingerRanges.ring.abduction - oldRom.fingerRanges.ring.abduction
            },
            pinky: {
                flexion: newRom.fingerRanges.pinky.flexion - oldRom.fingerRanges.pinky.flexion,
                extension: newRom.fingerRanges.pinky.extension - oldRom.fingerRanges.pinky.extension,
                abduction: newRom.fingerRanges.pinky.abduction - oldRom.fingerRanges.pinky.abduction
            }
        },
        wristRange: {
            flexion: newRom.wristRange.flexion - oldRom.wristRange.flexion,
            extension: newRom.wristRange.extension - oldRom.wristRange.extension,
            ulnarDeviation: newRom.wristRange.ulnarDeviation - oldRom.wristRange.ulnarDeviation,
            radialDeviation: newRom.wristRange.radialDeviation - oldRom.wristRange.radialDeviation
        },
        gripStrength: newRom.gripStrength - oldRom.gripStrength,
        overallImprovement: 0 // Will be calculated below
    };

    // Calculate overall improvement score (0-100)
    const fingerImprovements = Object.values(improvements.fingerRanges).map(finger => 
        Object.values(finger).reduce((sum, val) => sum + Math.max(0, val), 0)
    );
    const wristImprovements = Object.values(improvements.wristRange).reduce((sum, val) => sum + Math.max(0, val), 0);
    const gripImprovement = Math.max(0, improvements.gripStrength);
    
    const totalImprovement = fingerImprovements.reduce((sum, val) => sum + val, 0) + wristImprovements + gripImprovement;
    improvements.overallImprovement = Math.min(100, Math.max(0, totalImprovement / 10)); // Normalize to 0-100

    return improvements;
};

/**
 * Calculate ROM score based on normal ranges
 */
export const calculateRomScore = (rom: Rom): number => {
    // Normal ranges (approximate values for reference)
    const normalRanges = {
        fingerRanges: {
            thumb: { flexion: 65, extension: 45, abduction: 50 },
            index: { flexion: 90, extension: 0, abduction: 25 },
            middle: { flexion: 100, extension: 0, abduction: 20 },
            ring: { flexion: 95, extension: 0, abduction: 15 },
            pinky: { flexion: 85, extension: 0, abduction: 30 }
        },
        wristRange: {
            flexion: 80,
            extension: 70,
            ulnarDeviation: 30,
            radialDeviation: 20
        },
        gripStrength: 40 // kg for average adult
    };

    let totalScore = 0;
    let maxScore = 0;

    // Score finger ranges
    Object.keys(normalRanges.fingerRanges).forEach(finger => {
        const fingerKey = finger as keyof typeof normalRanges.fingerRanges;
        Object.keys(normalRanges.fingerRanges[fingerKey]).forEach(movement => {
            const movementKey = movement as keyof typeof normalRanges.fingerRanges[typeof fingerKey];
            const normal = normalRanges.fingerRanges[fingerKey][movementKey];
            const actual = rom.fingerRanges[fingerKey][movementKey];
            
            totalScore += Math.min(actual, normal);
            maxScore += normal;
        });
    });

    // Score wrist ranges
    Object.keys(normalRanges.wristRange).forEach(movement => {
        const movementKey = movement as keyof typeof normalRanges.wristRange;
        const normal = normalRanges.wristRange[movementKey];
        const actual = rom.wristRange[movementKey];
        
        totalScore += Math.min(actual, normal);
        maxScore += normal;
    });

    // Score grip strength
    totalScore += Math.min(rom.gripStrength, normalRanges.gripStrength);
    maxScore += normalRanges.gripStrength;

    return Math.round((totalScore / maxScore) * 100);
};

/**
 * Generate ROM analysis report
 */
export const generateRomAnalysisReport = (rom: Rom, previousRom?: Rom) => {
    const score = calculateRomScore(rom);
    let comparison = null;
    
    if (previousRom) {
        comparison = compareRomMeasurements(previousRom, rom);
    }

    return {
        patientID: rom.patientID,
        measurementDate: rom.measurementDate,
        overallScore: score,
        fingerRanges: rom.fingerRanges,
        wristRange: rom.wristRange,
        gripStrength: rom.gripStrength,
        notes: rom.notes,
        comparison,
        recommendations: generateRecommendations(rom, score)
    };
};

/**
 * Generate exercise recommendations based on ROM data
 */
export const generateRecommendations = (rom: Rom, score: number): string[] => {
    const recommendations: string[] = [];

    // Check finger flexibility
    Object.entries(rom.fingerRanges).forEach(([finger, ranges]) => {
        if (ranges.flexion < 70) {
            recommendations.push(`${finger} parmağı fleksiyon egzersizleri önerilir`);
        }
        if (ranges.extension < 20 && finger !== 'index' && finger !== 'middle') {
            recommendations.push(`${finger} parmağı ekstansiyon egzersizleri önerilir`);
        }
        if (ranges.abduction < 20) {
            recommendations.push(`${finger} parmağı abdüksiyon egzersizleri önerilir`);
        }
    });

    // Check wrist mobility
    if (rom.wristRange.flexion < 60) {
        recommendations.push('Bilek fleksiyon egzersizleri önerilir');
    }
    if (rom.wristRange.extension < 50) {
        recommendations.push('Bilek ekstansiyon egzersizleri önerilir');
    }

    // Check grip strength
    if (rom.gripStrength < 20) {
        recommendations.push('Kavrama gücü egzersizleri önerilir');
    }

    // Overall score recommendations
    if (score < 50) {
        recommendations.push('Yoğun fizyoterapi programı önerilir');
    } else if (score < 75) {
        recommendations.push('Düzenli egzersiz programı önerilir');
    } else {
        recommendations.push('Mevcut fonksiyonun korunması için hafif egzersizler yeterli');
    }

    return recommendations;
};

/**
 * Update ROM measurement
 */
export const updateRomMeasurement = async (id: string, updates: Partial<Omit<Rom, 'id'>>): Promise<void> => {
    return update(child(romCollectionRef, id), updates);
};

/**
 * Delete ROM measurement
 */
export const deleteRomMeasurement = async (id: string): Promise<void> => {
    return remove(child(romCollectionRef, id));
};