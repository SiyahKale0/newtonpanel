import { db } from './firebase';
import { ref, set, get, update, remove, push, child, orderByChild, equalTo, query } from "firebase/database";
import { DetailedRom, FingerRange, WristRange, FingerMovement } from '@/types/firebase';

const collectionRef = ref(db, 'detailedRoms');

export const createDetailedRom = async (data: DetailedRom): Promise<DetailedRom> => {
    const romRef = push(collectionRef);
    if (!romRef.key) throw new Error("ID oluşturulamadı.");
    await set(romRef, data);
    return data;
};

export const getAllDetailedRoms = async (): Promise<DetailedRom[]> => {
    const snapshot = await get(collectionRef);
    if (!snapshot.exists()) return [];
    const data = snapshot.val();
    return Object.keys(data).map(key => data[key]);
};

export const getDetailedRomsByPatient = async (patientID: string): Promise<DetailedRom[]> => {
    const patientQuery = query(collectionRef, orderByChild('patientID'), equalTo(patientID));
    const snapshot = await get(patientQuery);
    if (!snapshot.exists()) return [];
    const data = snapshot.val();
    return Object.keys(data).map(key => data[key]);
};

export const getLatestDetailedRomForPatient = async (patientID: string): Promise<DetailedRom | null> => {
    const roms = await getDetailedRomsByPatient(patientID);
    if (roms.length === 0) return null;
    
    // Sort by measurement date and return the latest
    return roms.sort((a, b) => new Date(b.measurementDate).getTime() - new Date(a.measurementDate).getTime())[0];
};

export const updateDetailedRom = async (patientID: string, measurementDate: string, updates: Partial<DetailedRom>): Promise<void> => {
    const roms = await getDetailedRomsByPatient(patientID);
    const targetRom = roms.find(rom => rom.measurementDate === measurementDate);
    
    if (!targetRom) {
        throw new Error("ROM measurement not found");
    }
    
    // Find the key for this ROM record
    const snapshot = await get(collectionRef);
    if (!snapshot.exists()) return;
    
    const data = snapshot.val();
    const targetKey = Object.keys(data).find(key => 
        data[key].patientID === patientID && data[key].measurementDate === measurementDate
    );
    
    if (targetKey) {
        await update(child(collectionRef, targetKey), updates);
    }
};

export const deleteDetailedRom = async (patientID: string, measurementDate: string): Promise<void> => {
    const snapshot = await get(collectionRef);
    if (!snapshot.exists()) return;
    
    const data = snapshot.val();
    const targetKey = Object.keys(data).find(key => 
        data[key].patientID === patientID && data[key].measurementDate === measurementDate
    );
    
    if (targetKey) {
        await remove(child(collectionRef, targetKey));
    }
};

// ROM Analysis Functions
export const analyzeFingerRangeOfMotion = (fingerMovements: FingerMovement[]): {
    fingerRangeUsage: {
        thumb: number;
        index: number;
        middle: number;
        ring: number;
        pinky: number;
    };
    overallRangeUtilization: number;
} => {
    const fingerUsage = {
        thumb: 0,
        index: 0,
        middle: 0,
        ring: 0,
        pinky: 0
    };

    const fingerNames = ['thumb', 'index', 'middle', 'ring', 'pinky'];
    
    fingerMovements.forEach(movement => {
        fingerNames.forEach((finger, index) => {
            if (movement.targetFinger === index + 1) {
                fingerUsage[finger as keyof typeof fingerUsage]++;
            }
        });
    });

    // Calculate percentage usage
    const totalMovements = fingerMovements.length;
    const fingerRangeUsage = {
        thumb: totalMovements > 0 ? (fingerUsage.thumb / totalMovements) * 100 : 0,
        index: totalMovements > 0 ? (fingerUsage.index / totalMovements) * 100 : 0,
        middle: totalMovements > 0 ? (fingerUsage.middle / totalMovements) * 100 : 0,
        ring: totalMovements > 0 ? (fingerUsage.ring / totalMovements) * 100 : 0,
        pinky: totalMovements > 0 ? (fingerUsage.pinky / totalMovements) * 100 : 0
    };

    const overallRangeUtilization = totalMovements > 0 ? 
        Object.values(fingerUsage).reduce((sum, count) => sum + count, 0) / (totalMovements * fingerNames.length) * 100 : 0;

    return {
        fingerRangeUsage,
        overallRangeUtilization
    };
};

export const compareRomProgress = (
    previousRom: DetailedRom, 
    currentRom: DetailedRom
): {
    fingerImprovements: {
        thumb: number;
        index: number;
        middle: number;
        ring: number;
        pinky: number;
    };
    wristImprovements: {
        flexion: number;
        extension: number;
        ulnarDeviation: number;
        radialDeviation: number;
    };
    gripStrengthImprovement: number;
    overallImprovement: number;
} => {
    const fingerNames = ['thumb', 'index', 'middle', 'ring', 'pinky'] as const;
    const wristMeasures = ['flexion', 'extension', 'ulnarDeviation', 'radialDeviation'] as const;

    const fingerImprovements = fingerNames.reduce((acc, finger) => {
        const prevRange = previousRom.fingerRanges[finger];
        const currRange = currentRom.fingerRanges[finger];
        
        // Calculate improvement as average of flexion and extension improvements
        const flexionImprovement = ((currRange.flexion - prevRange.flexion) / prevRange.flexion) * 100;
        const extensionImprovement = ((currRange.extension - prevRange.extension) / prevRange.extension) * 100;
        
        acc[finger] = (flexionImprovement + extensionImprovement) / 2;
        return acc;
    }, {} as Record<typeof fingerNames[number], number>);

    const wristImprovements = wristMeasures.reduce((acc, measure) => {
        const prevValue = previousRom.wristRange[measure];
        const currValue = currentRom.wristRange[measure];
        acc[measure] = ((currValue - prevValue) / prevValue) * 100;
        return acc;
    }, {} as Record<typeof wristMeasures[number], number>);

    const gripStrengthImprovement = ((currentRom.gripStrength - previousRom.gripStrength) / previousRom.gripStrength) * 100;

    // Calculate overall improvement as average of all improvements
    const allImprovements = [
        ...Object.values(fingerImprovements),
        ...Object.values(wristImprovements),
        gripStrengthImprovement
    ];
    
    const overallImprovement = allImprovements.reduce((sum, imp) => sum + imp, 0) / allImprovements.length;

    return {
        fingerImprovements,
        wristImprovements,
        gripStrengthImprovement,
        overallImprovement
    };
};

export const generateRomReport = async (patientID: string): Promise<{
    latestRom: DetailedRom | null;
    previousRom: DetailedRom | null;
    progressAnalysis: ReturnType<typeof compareRomProgress> | null;
    recommendations: string[];
}> => {
    const roms = await getDetailedRomsByPatient(patientID);
    
    if (roms.length === 0) {
        return {
            latestRom: null,
            previousRom: null,
            progressAnalysis: null,
            recommendations: ["İlk ROM ölçümü yapılması önerilir."]
        };
    }

    const sortedRoms = roms.sort((a, b) => new Date(b.measurementDate).getTime() - new Date(a.measurementDate).getTime());
    const latestRom = sortedRoms[0];
    const previousRom = sortedRoms.length > 1 ? sortedRoms[1] : null;

    let progressAnalysis = null;
    const recommendations: string[] = [];

    if (previousRom) {
        progressAnalysis = compareRomProgress(previousRom, latestRom);
        
        // Generate recommendations based on progress
        if (progressAnalysis.overallImprovement > 5) {
            recommendations.push("Genel hareket aralığında iyi ilerleme görülüyor. Mevcut egzersizlere devam edin.");
        } else if (progressAnalysis.overallImprovement < -5) {
            recommendations.push("Hareket aralığında gerileme tespit edildi. Egzersiz programının yeniden değerlendirilmesi önerilir.");
        } else {
            recommendations.push("Hareket aralığında stabil durum. Egzersiz yoğunluğu artırılabilir.");
        }

        // Specific finger recommendations
        Object.entries(progressAnalysis.fingerImprovements).forEach(([finger, improvement]) => {
            if (improvement < -10) {
                recommendations.push(`${finger} parmağında belirgin gerileme. Özel egzersizler önerilir.`);
            }
        });

        if (progressAnalysis.gripStrengthImprovement < -5) {
            recommendations.push("Kavrama gücünde azalma. Güçlendirme egzersizleri önerilir.");
        }
    } else {
        recommendations.push("İlk ölçüm tamamlandı. Düzenli takip için 2-4 hafta sonra tekrar ölçüm önerilir.");
    }

    return {
        latestRom,
        previousRom,
        progressAnalysis,
        recommendations
    };
};

export const calculateNormalizedRomScore = (rom: DetailedRom): number => {
    // Define normal ranges for comparison
    const normalRanges = {
        fingerFlexion: 90,
        fingerExtension: 0,
        fingerAbduction: 30,
        wristFlexion: 80,
        wristExtension: 70,
        ulnarDeviation: 30,
        radialDeviation: 20,
        gripStrength: 40 // kg, average for adults
    };

    const fingerNames = ['thumb', 'index', 'middle', 'ring', 'pinky'] as const;
    
    let totalScore = 0;
    let maxPossibleScore = 0;

    // Score finger ranges
    fingerNames.forEach(finger => {
        const range = rom.fingerRanges[finger];
        totalScore += Math.min(range.flexion / normalRanges.fingerFlexion, 1) * 100;
        totalScore += Math.min(range.abduction / normalRanges.fingerAbduction, 1) * 100;
        maxPossibleScore += 200; // 100 for flexion + 100 for abduction
    });

    // Score wrist ranges
    totalScore += Math.min(rom.wristRange.flexion / normalRanges.wristFlexion, 1) * 100;
    totalScore += Math.min(rom.wristRange.extension / normalRanges.wristExtension, 1) * 100;
    totalScore += Math.min(rom.wristRange.ulnarDeviation / normalRanges.ulnarDeviation, 1) * 100;
    totalScore += Math.min(rom.wristRange.radialDeviation / normalRanges.radialDeviation, 1) * 100;
    maxPossibleScore += 400;

    // Score grip strength
    totalScore += Math.min(rom.gripStrength / normalRanges.gripStrength, 1) * 100;
    maxPossibleScore += 100;

    return (totalScore / maxPossibleScore) * 100;
};