// src/services/validationService.ts

import { Rom, Session, GameResult } from '@/types/firebase';
import { FingerMovementLog, FingerMovementEntry } from '@/types/fingerDance';
import { ValidationResult, DataQuality } from '@/types/analysis';

/**
 * Validate ROM measurement data
 */
export const validateRomMeasurement = (rom: Omit<Rom, 'id'>): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!rom.patientID) errors.push('Patient ID is required');
    if (!rom.measurementDate) errors.push('Measurement date is required');

    // Validate finger ranges
    if (rom.fingerRanges) {
        Object.entries(rom.fingerRanges).forEach(([finger, ranges]) => {
            if (ranges.flexion < 0 || ranges.flexion > 180) {
                errors.push(`${finger} flexion must be between 0-180 degrees`);
            }
            if (ranges.extension < 0 || ranges.extension > 180) {
                errors.push(`${finger} extension must be between 0-180 degrees`);
            }
            if (ranges.abduction < 0 || ranges.abduction > 90) {
                errors.push(`${finger} abduction must be between 0-90 degrees`);
            }
        });
    }

    // Validate wrist ranges
    if (rom.wristRange) {
        if (rom.wristRange.flexion < 0 || rom.wristRange.flexion > 120) {
            errors.push('Wrist flexion must be between 0-120 degrees');
        }
        if (rom.wristRange.extension < 0 || rom.wristRange.extension > 120) {
            errors.push('Wrist extension must be between 0-120 degrees');
        }
        if (rom.wristRange.ulnarDeviation < 0 || rom.wristRange.ulnarDeviation > 60) {
            errors.push('Ulnar deviation must be between 0-60 degrees');
        }
        if (rom.wristRange.radialDeviation < 0 || rom.wristRange.radialDeviation > 60) {
            errors.push('Radial deviation must be between 0-60 degrees');
        }
    }

    // Validate grip strength
    if (rom.gripStrength < 0 || rom.gripStrength > 100) {
        errors.push('Grip strength must be between 0-100 kg');
    }

    // Warnings for unusual values
    if (rom.gripStrength < 10) {
        warnings.push('Grip strength is very low, please verify measurement');
    }
    if (rom.gripStrength > 60) {
        warnings.push('Grip strength is very high, please verify measurement');
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
};

/**
 * Validate FingerDance movement entry
 */
export const validateFingerMovementEntry = (entry: FingerMovementEntry): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (entry.timestamp < 0) errors.push('Timestamp must be non-negative');
    if (entry.targetFinger < 1 || entry.targetFinger > 5) {
        errors.push('Target finger must be between 1-5');
    }
    if (entry.score < 0 || entry.score > 1000) {
        errors.push('Score must be between 0-1000');
    }

    // Validate finger positions
    if (entry.fingerPositions) {
        Object.values(entry.fingerPositions).forEach(position => {
            if (Math.abs(position.x) > 10) warnings.push('X position seems extreme (>10)');
            if (Math.abs(position.y) > 10) warnings.push('Y position seems extreme (>10)');
            if (Math.abs(position.z) > 10) warnings.push('Z position seems extreme (>10)');
        });
    }

    // Validate timing
    if (!['perfect', 'good', 'miss', 'early', 'late'].includes(entry.timing)) {
        errors.push('Invalid timing value');
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
};

/**
 * Validate FingerDance movement log
 */
export const validateFingerMovementLog = (log: Omit<FingerMovementLog, 'totalEntries'>): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!log.sessionID) errors.push('Session ID is required');
    if (!log.songName) errors.push('Song name is required');
    if (!log.recordingStartTime) errors.push('Recording start time is required');

    // Validate movement entries
    if (!log.fingerMovements || log.fingerMovements.length === 0) {
        errors.push('At least one finger movement entry is required');
    } else {
        log.fingerMovements.forEach((entry, index) => {
            const entryValidation = validateFingerMovementEntry(entry);
            if (!entryValidation.isValid) {
                errors.push(`Entry ${index + 1}: ${entryValidation.errors.join(', ')}`);
            }
            warnings.push(...entryValidation.warnings.map(w => `Entry ${index + 1}: ${w}`));
        });
    }

    // Validate timestamps are in order
    if (log.fingerMovements.length > 1) {
        for (let i = 1; i < log.fingerMovements.length; i++) {
            if (log.fingerMovements[i].timestamp < log.fingerMovements[i - 1].timestamp) {
                warnings.push(`Entry ${i + 1} timestamp is out of order`);
            }
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
};

/**
 * Validate session data
 */
export const validateSession = (session: Omit<Session, 'id'>): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    if (!session.patientID) errors.push('Patient ID is required');
    if (!session.deviceID) errors.push('Device ID is required');
    if (!session.date) errors.push('Date is required');
    if (!session.startTime) errors.push('Start time is required');
    if (!session.romID) errors.push('ROM ID is required');

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (session.date && !dateRegex.test(session.date)) {
        errors.push('Date must be in YYYY-MM-DD format');
    }

    // Validate time format
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (session.startTime && !timeRegex.test(session.startTime)) {
        errors.push('Start time must be in HH:mm format');
    }
    if (session.endTime && !timeRegex.test(session.endTime)) {
        errors.push('End time must be in HH:mm format');
    }

    // Validate session duration
    if (session.startTime && session.endTime) {
        const startMinutes = parseInt(session.startTime.split(':')[0]) * 60 + parseInt(session.startTime.split(':')[1]);
        const endMinutes = parseInt(session.endTime.split(':')[0]) * 60 + parseInt(session.endTime.split(':')[1]);
        
        if (endMinutes <= startMinutes) {
            warnings.push('End time should be after start time');
        }
        
        const duration = endMinutes - startMinutes;
        if (duration > 120) { // 2 hours
            warnings.push('Session duration is very long (>2 hours)');
        }
        if (duration < 5) { // 5 minutes
            warnings.push('Session duration is very short (<5 minutes)');
        }
    }

    // Validate performance metrics
    if (session.performanceMetrics) {
        const metrics = session.performanceMetrics;
        if (metrics.averageAccuracy < 0 || metrics.averageAccuracy > 1) {
            errors.push('Average accuracy must be between 0-1');
        }
        if (metrics.fatigueFactor < 0 || metrics.fatigueFactor > 1) {
            errors.push('Fatigue factor must be between 0-1');
        }
        if (metrics.motivationLevel < 1 || metrics.motivationLevel > 10) {
            errors.push('Motivation level must be between 1-10');
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
};

/**
 * Calculate data quality score for a dataset
 */
export const calculateDataQuality = (data: any[]): DataQuality => {
    if (data.length === 0) {
        return {
            completeness: 0,
            accuracy: 0,
            consistency: 0,
            timeliness: 0,
            overallScore: 0
        };
    }

    let completeness = 0;
    let accuracy = 0;
    let consistency = 0;
    let timeliness = 0;

    // Calculate completeness (% of non-null fields)
    let totalFields = 0;
    let completedFields = 0;
    
    data.forEach(item => {
        Object.values(item).forEach(value => {
            totalFields++;
            if (value !== null && value !== undefined && value !== '') {
                completedFields++;
            }
        });
    });
    
    completeness = totalFields > 0 ? completedFields / totalFields : 0;

    // Calculate accuracy (based on validation results)
    let validItems = 0;
    data.forEach(item => {
        // This is a simplified accuracy check
        // In real implementation, would use specific validation for each data type
        if (item && typeof item === 'object' && Object.keys(item).length > 0) {
            validItems++;
        }
    });
    
    accuracy = data.length > 0 ? validItems / data.length : 0;

    // Calculate consistency (simplified - based on data types)
    consistency = 0.8; // Placeholder - would implement proper consistency checks

    // Calculate timeliness (based on recency of data)
    const now = new Date();
    let recentItems = 0;
    
    data.forEach(item => {
        if (item.date || item.createdAt || item.measurementDate) {
            const itemDate = new Date(item.date || item.createdAt || item.measurementDate);
            const daysDiff = (now.getTime() - itemDate.getTime()) / (1000 * 3600 * 24);
            
            if (daysDiff <= 30) { // Within 30 days
                recentItems++;
            }
        }
    });
    
    timeliness = data.length > 0 ? recentItems / data.length : 0;

    // Calculate overall score
    const overallScore = Math.round(
        (completeness * 0.3 + accuracy * 0.3 + consistency * 0.2 + timeliness * 0.2) * 100
    );

    return {
        completeness,
        accuracy,
        consistency,
        timeliness,
        overallScore
    };
};

/**
 * Validate game result data
 */
export const validateGameResult = (result: Omit<GameResult, 'id'>): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Common validations
    if (!result.sessionID) errors.push('Session ID is required');
    if (result.score < 0) errors.push('Score cannot be negative');
    if (!result.gameType) errors.push('Game type is required');

    // Game-specific validations
    if (result.gameType === 'fingerDance') {
        const fingerDanceResult = result as any; // Avoiding type complexity
        
        if (fingerDanceResult.accuracy < 0 || fingerDanceResult.accuracy > 1) {
            errors.push('Accuracy must be between 0-1');
        }
        if (fingerDanceResult.totalNotes < 0) {
            errors.push('Total notes cannot be negative');
        }
        if (fingerDanceResult.hitNotes > fingerDanceResult.totalNotes) {
            errors.push('Hit notes cannot exceed total notes');
        }
        if (fingerDanceResult.missedNotes > fingerDanceResult.totalNotes) {
            errors.push('Missed notes cannot exceed total notes');
        }
        
        // Validate finger performance
        if (fingerDanceResult.fingerPerformance) {
            Object.entries(fingerDanceResult.fingerPerformance).forEach(([finger, performance]: [string, any]) => {
                if (performance.accuracy < 0 || performance.accuracy > 1) {
                    errors.push(`${finger} accuracy must be between 0-1`);
                }
                if (performance.hits < 0) {
                    errors.push(`${finger} hits cannot be negative`);
                }
                if (performance.misses < 0) {
                    errors.push(`${finger} misses cannot be negative`);
                }
            });
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
        warnings
    };
};

/**
 * Batch validate multiple data items
 */
export const batchValidate = (items: any[], validationFn: (item: any) => ValidationResult): {
    validItems: number;
    invalidItems: number;
    totalErrors: number;
    totalWarnings: number;
    results: ValidationResult[];
} => {
    const results = items.map(validationFn);
    
    return {
        validItems: results.filter(r => r.isValid).length,
        invalidItems: results.filter(r => !r.isValid).length,
        totalErrors: results.reduce((sum, r) => sum + r.errors.length, 0),
        totalWarnings: results.reduce((sum, r) => sum + r.warnings.length, 0),
        results
    };
};