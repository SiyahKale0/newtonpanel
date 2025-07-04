"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSamplePositionLog = exports.loadPositionLogFromFile = exports.parsePositionLogFromJson = exports.validatePositionLogData = exports.convertPositionLogToFingerDanceResult = void 0;
/**
 * Converts position log data to FingerDanceResult format
 * @param positionLogData - The position log data from the game
 * @returns FingerDanceResult object ready for Firebase storage
 */
const convertPositionLogToFingerDanceResult = (positionLogData) => {
    // Convert finger positions to finger movements
    const fingerMovementLog = positionLogData.fingerPositions.map(position => {
        // Determine which fingers were actually detected as "down"
        const actualFingers = [];
        const detectedFingers = position.detectedFingers;
        if (detectedFingers.thumb.position === 'down')
            actualFingers.push(1);
        if (detectedFingers.index.position === 'down')
            actualFingers.push(2);
        if (detectedFingers.middle.position === 'down')
            actualFingers.push(3);
        if (detectedFingers.ring.position === 'down')
            actualFingers.push(4);
        if (detectedFingers.pinky.position === 'down')
            actualFingers.push(5);
        return {
            timestamp: position.timestamp,
            targetFinger: position.targetNote.finger,
            actualFingers,
            fingerPositions: {
                thumb: `${detectedFingers.thumb.position}(${detectedFingers.thumb.confidence.toFixed(2)})`,
                index: `${detectedFingers.index.position}(${detectedFingers.index.confidence.toFixed(2)})`,
                middle: `${detectedFingers.middle.position}(${detectedFingers.middle.confidence.toFixed(2)})`,
                ring: `${detectedFingers.ring.position}(${detectedFingers.ring.confidence.toFixed(2)})`,
                pinky: `${detectedFingers.pinky.position}(${detectedFingers.pinky.confidence.toFixed(2)})`,
            },
            hit: position.analysis.hit,
            timing: position.analysis.timing,
            score: position.analysis.score
        };
    });
    // Convert finger performance data
    const fingerPerformance = {
        finger1: {
            hits: positionLogData.gameResults.fingerPerformance.finger1.hits,
            misses: positionLogData.gameResults.fingerPerformance.finger1.misses,
            accuracy: positionLogData.gameResults.fingerPerformance.finger1.accuracy
        },
        finger2: {
            hits: positionLogData.gameResults.fingerPerformance.finger2.hits,
            misses: positionLogData.gameResults.fingerPerformance.finger2.misses,
            accuracy: positionLogData.gameResults.fingerPerformance.finger2.accuracy
        },
        finger3: {
            hits: positionLogData.gameResults.fingerPerformance.finger3.hits,
            misses: positionLogData.gameResults.fingerPerformance.finger3.misses,
            accuracy: positionLogData.gameResults.fingerPerformance.finger3.accuracy
        },
        finger4: {
            hits: positionLogData.gameResults.fingerPerformance.finger4.hits,
            misses: positionLogData.gameResults.fingerPerformance.finger4.misses,
            accuracy: positionLogData.gameResults.fingerPerformance.finger4.accuracy
        },
        finger5: {
            hits: positionLogData.gameResults.fingerPerformance.finger5.hits,
            misses: positionLogData.gameResults.fingerPerformance.finger5.misses,
            accuracy: positionLogData.gameResults.fingerPerformance.finger5.accuracy
        }
    };
    // Create the FingerDanceResult
    const result = {
        gameType: 'fingerDance',
        score: positionLogData.gameResults.score,
        sessionID: positionLogData.sessionInfo.sessionID,
        songName: positionLogData.sessionInfo.songName,
        difficulty: positionLogData.sessionInfo.difficulty,
        totalNotes: positionLogData.gameResults.totalNotes,
        hitNotes: positionLogData.gameResults.hitNotes,
        missedNotes: positionLogData.gameResults.missedNotes,
        accuracy: positionLogData.gameResults.accuracy,
        maxCombo: positionLogData.gameResults.maxCombo,
        fingerPerformance,
        fingerMovementLog,
        timing: {
            startTime: positionLogData.sessionInfo.startTime,
            endTime: positionLogData.sessionInfo.endTime,
            duration: positionLogData.sessionInfo.totalDuration
        },
        // Legacy fields for backward compatibility
        combo: positionLogData.gameResults.maxCombo,
        mistakes: positionLogData.gameResults.missedNotes,
        notes: fingerMovementLog.map(movement => ({
            finger: movement.targetFinger,
            hit: movement.hit,
            note: positionLogData.fingerPositions.find(p => p.timestamp === movement.timestamp)?.targetNote.note || '',
            time: movement.timestamp
        }))
    };
    return result;
};
exports.convertPositionLogToFingerDanceResult = convertPositionLogToFingerDanceResult;
/**
 * Validates position log data structure
 * @param data - The data to validate
 * @returns true if valid, false otherwise
 */
const validatePositionLogData = (data) => {
    try {
        // Check required top-level properties
        if (!data.sessionInfo || !data.fingerPositions || !data.gameResults) {
            return false;
        }
        // Check session info
        const sessionInfo = data.sessionInfo;
        if (!sessionInfo.sessionID || !sessionInfo.patientID || sessionInfo.gameType !== 'fingerDance') {
            return false;
        }
        // Check finger positions array
        if (!Array.isArray(data.fingerPositions)) {
            return false;
        }
        // Check game results
        const gameResults = data.gameResults;
        if (typeof gameResults.totalNotes !== 'number' ||
            typeof gameResults.hitNotes !== 'number' ||
            typeof gameResults.accuracy !== 'number') {
            return false;
        }
        // Check finger performance
        if (!gameResults.fingerPerformance ||
            !gameResults.fingerPerformance.finger1 ||
            !gameResults.fingerPerformance.finger2 ||
            !gameResults.fingerPerformance.finger3 ||
            !gameResults.fingerPerformance.finger4 ||
            !gameResults.fingerPerformance.finger5) {
            return false;
        }
        return true;
    }
    catch (error) {
        console.error('Position log validation error:', error);
        return false;
    }
};
exports.validatePositionLogData = validatePositionLogData;
/**
 * Loads and parses position log data from JSON string
 * @param jsonString - The JSON string containing position log data
 * @returns Parsed position log data or null if invalid
 */
const parsePositionLogFromJson = (jsonString) => {
    try {
        const data = JSON.parse(jsonString);
        if ((0, exports.validatePositionLogData)(data)) {
            return data;
        }
        return null;
    }
    catch (error) {
        console.error('Failed to parse position log JSON:', error);
        return null;
    }
};
exports.parsePositionLogFromJson = parsePositionLogFromJson;
/**
 * Loads position log data from a file and converts it to FingerDanceResult
 * @param file - The file containing position log data
 * @returns Promise that resolves to FingerDanceResult or null if invalid
 */
const loadPositionLogFromFile = async (file) => {
    try {
        const fileContent = await file.text();
        const positionLogData = (0, exports.parsePositionLogFromJson)(fileContent);
        if (positionLogData) {
            return (0, exports.convertPositionLogToFingerDanceResult)(positionLogData);
        }
        return null;
    }
    catch (error) {
        console.error('Failed to load position log from file:', error);
        return null;
    }
};
exports.loadPositionLogFromFile = loadPositionLogFromFile;
/**
 * Generates a sample position log for testing
 * @param sessionID - The session ID
 * @param patientID - The patient ID
 * @returns Sample position log data
 */
const generateSamplePositionLog = (sessionID, patientID) => {
    return {
        sessionInfo: {
            sessionID,
            patientID,
            gameType: 'fingerDance',
            songName: 'Sample Song',
            difficulty: 'easy',
            startTime: new Date().toISOString(),
            endTime: new Date(Date.now() + 30000).toISOString(),
            totalDuration: 30
        },
        fingerPositions: [
            {
                timestamp: 1000,
                frameId: 1,
                targetNote: { finger: 1, note: 'C4', expectedTiming: 1000 },
                detectedFingers: {
                    thumb: { position: 'down', confidence: 0.95, coordinates: { x: 120, y: 200, z: 10 } },
                    index: { position: 'up', confidence: 0.87, coordinates: { x: 140, y: 180, z: 5 } },
                    middle: { position: 'up', confidence: 0.92, coordinates: { x: 160, y: 175, z: 3 } },
                    ring: { position: 'up', confidence: 0.89, coordinates: { x: 180, y: 180, z: 4 } },
                    pinky: { position: 'up', confidence: 0.83, coordinates: { x: 200, y: 185, z: 6 } }
                },
                analysis: { correctFinger: true, timing: 'perfect', timingDifference: 0, score: 100, hit: true }
            }
        ],
        gameResults: {
            totalNotes: 1,
            hitNotes: 1,
            missedNotes: 0,
            accuracy: 100,
            score: 100,
            maxCombo: 1,
            fingerPerformance: {
                finger1: { hits: 1, misses: 0, accuracy: 100 },
                finger2: { hits: 0, misses: 0, accuracy: 0 },
                finger3: { hits: 0, misses: 0, accuracy: 0 },
                finger4: { hits: 0, misses: 0, accuracy: 0 },
                finger5: { hits: 0, misses: 0, accuracy: 0 }
            },
            timing: {
                startTime: new Date().toISOString(),
                endTime: new Date(Date.now() + 30000).toISOString(),
                duration: 30
            }
        },
        metadata: {
            version: '1.0',
            created: new Date().toISOString(),
            deviceInfo: {
                deviceId: 'device_001',
                cameraResolution: '1920x1080',
                frameRate: 30,
                processingLatency: 15
            },
            calibration: {
                fingerDetectionThreshold: 0.8,
                timingTolerancePerfect: 50,
                timingToleranceGood: 150,
                coordinateSystem: 'relative'
            }
        }
    };
};
exports.generateSamplePositionLog = generateSamplePositionLog;
