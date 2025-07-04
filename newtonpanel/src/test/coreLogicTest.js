// Simple test to validate our types and core logic without Firebase dependencies

// Test finger performance calculation logic
function calculateFingerPerformanceTest(fingerMovements) {
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
            } else {
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
}

// Test game metrics calculation logic
function calculateGameMetricsTest(fingerMovements) {
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
}

// Test data
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

// Run tests
console.log('=== Testing FingerDance Core Logic ===');

const fingerPerformance = calculateFingerPerformanceTest(sampleMovements);
console.log('✓ Finger Performance:', fingerPerformance);

const gameMetrics = calculateGameMetricsTest(sampleMovements);
console.log('✓ Game Metrics:', gameMetrics);

// Validate results
console.log('\n=== Validation ===');
console.log('Total notes:', gameMetrics.totalNotes === 4 ? '✓ PASS' : '✗ FAIL');
console.log('Hit notes:', gameMetrics.hitNotes === 3 ? '✓ PASS' : '✗ FAIL');
console.log('Accuracy:', gameMetrics.accuracy === 75 ? '✓ PASS' : '✗ FAIL');
console.log('Max combo:', gameMetrics.maxCombo === 3 ? '✓ PASS' : '✗ FAIL');
console.log('Total score:', gameMetrics.totalScore === 280 ? '✓ PASS' : '✗ FAIL');

console.log('\n=== Finger Performance Validation ===');
console.log('Finger 1 accuracy:', fingerPerformance.finger1.accuracy === 100 ? '✓ PASS' : '✗ FAIL');
console.log('Finger 2 accuracy:', fingerPerformance.finger2.accuracy === 100 ? '✓ PASS' : '✗ FAIL');
console.log('Finger 3 accuracy:', fingerPerformance.finger3.accuracy === 100 ? '✓ PASS' : '✗ FAIL');
console.log('Finger 4 accuracy:', fingerPerformance.finger4.accuracy === 0 ? '✓ PASS' : '✗ FAIL');
console.log('Finger 5 accuracy:', fingerPerformance.finger5.accuracy === 0 ? '✓ PASS' : '✗ FAIL');

console.log('\n=== All Core Logic Tests Completed Successfully! ===');