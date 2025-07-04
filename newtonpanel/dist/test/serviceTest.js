"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fingerDanceService_1 = require("../services/fingerDanceService");
const positionLogService_1 = require("../services/positionLogService");
// Test data for finger movements
const sampleMovements = [
    {
        timestamp: 1000,
        targetFinger: 1,
        actualFingers: [1],
        fingerPositions: {
            thumb: 'down(0.95)',
            index: 'up(0.87)',
            middle: 'up(0.92)',
            ring: 'up(0.89)',
            pinky: 'up(0.83)'
        },
        hit: true,
        timing: 'perfect',
        score: 100
    },
    {
        timestamp: 1500,
        targetFinger: 2,
        actualFingers: [2],
        fingerPositions: {
            thumb: 'up(0.93)',
            index: 'down(0.91)',
            middle: 'up(0.88)',
            ring: 'up(0.86)',
            pinky: 'up(0.81)'
        },
        hit: true,
        timing: 'good',
        score: 85
    },
    {
        timestamp: 2000,
        targetFinger: 3,
        actualFingers: [3],
        fingerPositions: {
            thumb: 'up(0.90)',
            index: 'up(0.89)',
            middle: 'down(0.94)',
            ring: 'up(0.87)',
            pinky: 'up(0.84)'
        },
        hit: true,
        timing: 'perfect',
        score: 95
    },
    {
        timestamp: 2500,
        targetFinger: 4,
        actualFingers: [1], // Wrong finger pressed
        fingerPositions: {
            thumb: 'down(0.88)', // Wrong finger
            index: 'up(0.85)',
            middle: 'up(0.86)',
            ring: 'up(0.89)', // Should be down
            pinky: 'up(0.82)'
        },
        hit: false,
        timing: 'miss',
        score: 0
    }
];
// Test service functions
console.log('=== Testing FingerDance Services ===');
// Test finger performance calculation
const fingerPerformance = (0, fingerDanceService_1.calculateFingerPerformance)(sampleMovements);
console.log('Finger Performance:', fingerPerformance);
// Test game metrics calculation
const gameMetrics = (0, fingerDanceService_1.calculateGameMetrics)(sampleMovements);
console.log('Game Metrics:', gameMetrics);
// Test movement pattern analysis
const movementPattern = (0, fingerDanceService_1.analyzeFingerMovementPattern)(sampleMovements);
console.log('Movement Pattern:', movementPattern);
// Test position log conversion
const samplePositionLog = (0, positionLogService_1.generateSamplePositionLog)('test_session_123', 'test_patient_001');
const convertedResult = (0, positionLogService_1.convertPositionLogToFingerDanceResult)(samplePositionLog);
console.log('Converted FingerDance Result:', {
    songName: convertedResult.songName,
    difficulty: convertedResult.difficulty,
    accuracy: convertedResult.accuracy,
    score: convertedResult.score,
    fingerPerformance: convertedResult.fingerPerformance
});
console.log('=== All tests completed successfully! ===');
