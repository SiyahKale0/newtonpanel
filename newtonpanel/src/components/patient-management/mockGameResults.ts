// Create some mock game results for testing
import { GameResult } from '@/types/firebase';

export const mockGameResults: GameResult[] = [
    {
        id: 'result-1',
        gameType: 'appleGame',
        score: 850,
        sessionID: 'session-1',
        apples: [
            { index: 0, status: 'picked', time: 2.5 },
            { index: 1, status: 'picked', time: 4.1 },
            { index: 2, status: 'missed', time: 6.2 },
            { index: 3, status: 'picked', time: 8.7 },
            { index: 4, status: 'dropped', time: 10.3 },
            { index: 5, status: 'picked', time: 12.1 },
        ],
        successRate: 75.5
    },
    {
        id: 'result-2',
        gameType: 'fingerDance',
        score: 1250,
        sessionID: 'session-2',
        combo: 45,
        mistakes: 8,
        notes: [
            { finger: 1, hit: true, note: 'C', time: 1.2 },
            { finger: 2, hit: true, note: 'D', time: 2.1 },
            { finger: 1, hit: false, note: 'C', time: 3.5 },
            { finger: 3, hit: true, note: 'E', time: 4.2 },
            { finger: 4, hit: true, note: 'F', time: 5.1 },
            { finger: 2, hit: false, note: 'D', time: 6.3 },
            { finger: 5, hit: true, note: 'G', time: 7.2 },
            { finger: 1, hit: true, note: 'C', time: 8.1 },
            { finger: 3, hit: true, note: 'E', time: 9.4 },
            { finger: 2, hit: true, note: 'D', time: 10.2 },
            { finger: 4, hit: false, note: 'F', time: 11.1 },
            { finger: 5, hit: true, note: 'G', time: 12.3 },
        ]
    }
];