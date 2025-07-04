"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeFingerMovementPattern = exports.logFingerPosition = exports.calculateGameMetrics = exports.calculateFingerPerformance = exports.deleteFingerDanceResult = exports.updateFingerDanceResult = exports.getFingerDanceResultsBySession = exports.getFingerDanceResultById = exports.getAllFingerDanceResults = exports.createFingerDanceResult = void 0;
const firebase_1 = require("./firebase");
const database_1 = require("firebase/database");
const collectionRef = (0, database_1.ref)(firebase_1.db, 'fingerDanceResults');
const createFingerDanceResult = async (data) => {
    const newRef = (0, database_1.push)(collectionRef);
    if (!newRef.key)
        throw new Error("ID oluşturulamadı.");
    await (0, database_1.set)(newRef, data);
    return { id: newRef.key, ...data };
};
exports.createFingerDanceResult = createFingerDanceResult;
const getAllFingerDanceResults = async () => {
    const snapshot = await (0, database_1.get)(collectionRef);
    if (!snapshot.exists())
        return [];
    const data = snapshot.val();
    return Object.keys(data).map(key => ({ id: key, ...data[key] }));
};
exports.getAllFingerDanceResults = getAllFingerDanceResults;
const getFingerDanceResultById = async (id) => {
    const snapshot = await (0, database_1.get)((0, database_1.child)(collectionRef, id));
    if (!snapshot.exists())
        return null;
    return { id: snapshot.key, ...snapshot.val() };
};
exports.getFingerDanceResultById = getFingerDanceResultById;
const getFingerDanceResultsBySession = async (sessionID) => {
    const sessionQuery = (0, database_1.query)(collectionRef, (0, database_1.orderByChild)('sessionID'), (0, database_1.equalTo)(sessionID));
    const snapshot = await (0, database_1.get)(sessionQuery);
    if (!snapshot.exists())
        return [];
    const data = snapshot.val();
    return Object.keys(data).map(key => ({ id: key, ...data[key] }));
};
exports.getFingerDanceResultsBySession = getFingerDanceResultsBySession;
const updateFingerDanceResult = async (id, updates) => {
    return (0, database_1.update)((0, database_1.child)(collectionRef, id), updates);
};
exports.updateFingerDanceResult = updateFingerDanceResult;
const deleteFingerDanceResult = async (id) => {
    return (0, database_1.remove)((0, database_1.child)(collectionRef, id));
};
exports.deleteFingerDanceResult = deleteFingerDanceResult;
// Finger performance analysis functions
const calculateFingerPerformance = (fingerMovements) => {
    const fingerStats = {
        finger1: { hits: 0, misses: 0, accuracy: 0 },
        finger2: { hits: 0, misses: 0, accuracy: 0 },
        finger3: { hits: 0, misses: 0, accuracy: 0 },
        finger4: { hits: 0, misses: 0, accuracy: 0 },
        finger5: { hits: 0, misses: 0, accuracy: 0 }
    };
    fingerMovements.forEach(movement => {
        const fingerKey = `finger${movement.targetFinger}`;
        if (fingerStats[fingerKey]) {
            if (movement.hit) {
                fingerStats[fingerKey].hits++;
            }
            else {
                fingerStats[fingerKey].misses++;
            }
        }
    });
    // Calculate accuracy for each finger
    Object.keys(fingerStats).forEach(fingerKey => {
        const stats = fingerStats[fingerKey];
        const total = stats.hits + stats.misses;
        stats.accuracy = total > 0 ? (stats.hits / total) * 100 : 0;
    });
    return fingerStats;
};
exports.calculateFingerPerformance = calculateFingerPerformance;
const calculateGameMetrics = (fingerMovements) => {
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
        }
        else {
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
exports.calculateGameMetrics = calculateGameMetrics;
// Position logging functions for position_log.json format adaptation
const logFingerPosition = (sessionID, timestamp, fingerPositions) => {
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
exports.logFingerPosition = logFingerPosition;
const analyzeFingerMovementPattern = (movements) => {
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
    }, {});
    const dominantFinger = Object.entries(fingerUsage).reduce((a, b) => fingerUsage[Number(a[0])] > fingerUsage[Number(b[0])] ? a : b)[0];
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
exports.analyzeFingerMovementPattern = analyzeFingerMovementPattern;
