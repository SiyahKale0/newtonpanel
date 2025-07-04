// src/examples/fingerDanceSystemUsage.ts

/**
 * Example usage of the Firebase Schema and FingerDance Game Analysis System
 * This file demonstrates how to use all the new services and types
 */

import { 
    createFingerDanceResult, 
    createFingerMovementLog, 
    calculateFingerPerformance,
    generatePerformanceSummary 
} from '@/services/fingerDanceService';

import { 
    createRomMeasurement, 
    generateRomAnalysisReport, 
    compareRomMeasurements 
} from '@/services/romAnalysisService';

import { 
    calculateSessionPerformanceMetrics, 
    generateSessionAnalysisReport 
} from '@/services/sessionAnalysisService';

import { 
    generatePatientProgressReport 
} from '@/services/patientProgressService';

import { 
    validateRomMeasurement, 
    validateFingerMovementLog,
    calculateDataQuality 
} from '@/services/validationService';

import { FingerDanceResult, Rom, Session } from '@/types/firebase';
import { FingerMovementLog } from '@/types/fingerDance';

/**
 * Example 1: Creating a comprehensive FingerDance session
 */
async function exampleFingerDanceSession() {
    console.log('=== FingerDance Session Example ===');

    // 1. Create finger movement log
    const movementLog: Omit<FingerMovementLog, 'totalEntries'> = {
        sessionID: "session_1",
        gameType: "fingerDance",
        songName: "fur_elise",
        recordingStartTime: new Date().toISOString(),
        recordingEndTime: new Date(Date.now() + 225000).toISOString(), // 3:45 minutes later
        fingerMovements: [
            {
                timestamp: 1520,
                targetFinger: 2,
                actualFingers: [1, 2],
                fingerPositions: {
                    thumb: { x: 0.23, y: 1.30, z: 0.19 },
                    index: { x: 0.26, y: 1.29, z: 0.07 },
                    middle: { x: 0.32, y: 1.25, z: -0.03 },
                    ring: { x: 0.34, y: 1.26, z: -0.08 },
                    pinky: { x: 0.39, y: 1.28, z: -0.14 }
                },
                hit: true,
                timing: "perfect",
                score: 100
            },
            {
                timestamp: 2340,
                targetFinger: 3,
                actualFingers: [3],
                fingerPositions: {
                    thumb: { x: 0.21, y: 1.32, z: 0.18 },
                    index: { x: 0.24, y: 1.31, z: 0.06 },
                    middle: { x: 0.30, y: 1.27, z: -0.01 },
                    ring: { x: 0.32, y: 1.28, z: -0.06 },
                    pinky: { x: 0.37, y: 1.30, z: -0.12 }
                },
                hit: true,
                timing: "good",
                score: 85
            }
            // ... more movements would be added
        ]
    };

    // Validate movement log
    const logValidation = validateFingerMovementLog(movementLog);
    if (!logValidation.isValid) {
        console.error('Movement log validation failed:', logValidation.errors);
        return;
    }

    // Create the movement log
    const createdLog = await createFingerMovementLog(movementLog);
    console.log('Created movement log:', (createdLog as any).id);

    // 2. Calculate finger performance from movement log
    const fingerPerformance = calculateFingerPerformance(createdLog);
    console.log('Finger performance:', fingerPerformance);

    // 3. Create FingerDance result
    const fingerDanceResult: Omit<FingerDanceResult, 'id'> = {
        gameType: "fingerDance",
        sessionID: "session_1",
        score: 850,
        songName: "fur_elise",
        difficulty: "medium",
        totalNotes: 45,
        hitNotes: 38,
        missedNotes: 7,
        accuracy: 0.844,
        maxCombo: 12,
        fingerPerformance: fingerPerformance,
        fingerMovementLogID: (createdLog as any).id,
        timing: {
            startTime: "2025-07-04T12:00:00Z",
            endTime: "2025-07-04T12:03:45Z",
            duration: 225000
        },
        // Legacy fields for backward compatibility
        combo: 12,
        mistakes: 7,
        notes: [
            { finger: 2, hit: true, note: "C4", time: 1520 },
            { finger: 3, hit: true, note: "D4", time: 2340 }
        ]
    };

    const createdResult = await createFingerDanceResult(fingerDanceResult);
    console.log('Created FingerDance result:', createdResult.id);

    // 4. Generate performance summary
    const performanceSummary = generatePerformanceSummary(createdResult);
    console.log('Performance summary:', performanceSummary);
}

/**
 * Example 2: ROM measurement and analysis
 */
async function exampleRomAnalysis() {
    console.log('=== ROM Analysis Example ===');

    // Create ROM measurement
    const romMeasurement: Omit<Rom, 'id'> = {
        patientID: "-OU94Z96FE777DEx1sLk",
        measurementDate: new Date().toISOString(),
        // Enhanced ROM data structure
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
        gripStrength: 25.5,
        notes: "İyileşme gözlemleniyor",
        // Legacy fields for backward compatibility
        arm: {
            leftSpace: 80,
            rightSpace: 75
        },
        finger: {
            leftFingers: [
                { max: 90, min: 0 },
                { max: 100, min: 0 },
                { max: 95, min: 0 },
                { max: 85, min: 0 },
                { max: 65, min: 0 }
            ],
            rightFingers: [
                { max: 92, min: 0 },
                { max: 102, min: 0 },
                { max: 97, min: 0 },
                { max: 87, min: 0 },
                { max: 67, min: 0 }
            ]
        }
    };

    // Validate ROM measurement
    const romValidation = validateRomMeasurement(romMeasurement);
    if (!romValidation.isValid) {
        console.error('ROM validation failed:', romValidation.errors);
        return;
    }

    if (romValidation.warnings.length > 0) {
        console.warn('ROM warnings:', romValidation.warnings);
    }

    // Create ROM measurement
    const createdRom = await createRomMeasurement(romMeasurement);
    console.log('Created ROM measurement:', createdRom.id);

    // Generate ROM analysis report
    const romReport = generateRomAnalysisReport(createdRom);
    console.log('ROM analysis report:', romReport);

    // Example comparison with previous ROM (mock data)
    const previousRom: Rom = {
        ...romMeasurement,
        id: 'previous_rom_id',
        fingerRanges: {
            thumb: { flexion: 60, extension: 40, abduction: 45 },
            index: { flexion: 85, extension: 0, abduction: 20 },
            middle: { flexion: 95, extension: 0, abduction: 15 },
            ring: { flexion: 90, extension: 0, abduction: 10 },
            pinky: { flexion: 80, extension: 0, abduction: 25 }
        },
        wristRange: {
            flexion: 75,
            extension: 65,
            ulnarDeviation: 25,
            radialDeviation: 15
        },
        gripStrength: 22.0
    };

    const comparison = compareRomMeasurements(previousRom, createdRom);
    console.log('ROM improvement:', comparison);
}

/**
 * Example 3: Session analysis and patient progress
 */
async function exampleSessionAnalysis() {
    console.log('=== Session Analysis Example ===');

    const sessionId = "session_1";
    const patientId = "-OU94Z96FE777DEx1sLk";

    // Calculate session performance metrics
    const sessionMetrics = await calculateSessionPerformanceMetrics(sessionId);
    console.log('Session metrics:', sessionMetrics);

    // Generate session analysis report
    const sessionReport = await generateSessionAnalysisReport(sessionId);
    console.log('Session analysis:', sessionReport);

    // Generate comprehensive patient progress report
    const progressReport = await generatePatientProgressReport(patientId);
    console.log('Patient progress report:', progressReport);
}

/**
 * Example 4: Data quality assessment
 */
async function exampleDataQuality() {
    console.log('=== Data Quality Example ===');

    // Mock data for quality assessment
    const sampleData = [
        { id: '1', name: 'Patient A', age: 45, lastSession: '2025-01-15' },
        { id: '2', name: 'Patient B', age: null, lastSession: '2025-01-10' },
        { id: '3', name: '', age: 32, lastSession: '2024-12-20' },
        { id: '4', name: 'Patient D', age: 28, lastSession: '2025-01-18' }
    ];

    const dataQuality = calculateDataQuality(sampleData);
    console.log('Data quality assessment:', dataQuality);
}

/**
 * Example 5: Complete workflow demonstration
 */
async function exampleCompleteWorkflow() {
    console.log('=== Complete Workflow Example ===');

    try {
        // Step 1: Create FingerDance session
        await exampleFingerDanceSession();

        // Step 2: Perform ROM analysis
        await exampleRomAnalysis();

        // Step 3: Analyze session and patient progress
        await exampleSessionAnalysis();

        // Step 4: Assess data quality
        await exampleDataQuality();

        console.log('✅ Complete workflow executed successfully!');
    } catch (error) {
        console.error('❌ Workflow failed:', error);
    }
}

// Export all examples for use in components or testing
export {
    exampleFingerDanceSession,
    exampleRomAnalysis,
    exampleSessionAnalysis,
    exampleDataQuality,
    exampleCompleteWorkflow
};