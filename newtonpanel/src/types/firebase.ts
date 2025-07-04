// src/types/firebase.ts

// Her bir modele, Firebase'den gelen benzersiz anahtarı (key) saklamak için
// bir 'id' alanı eklenmiştir. Bu, veriyi yönetmeyi kolaylaştırır.

export interface Patient {
    id: string;
    age: number;
    // customGames, hastanın genel oyun tercihlerini veya varsayılanlarını tutabilir.
    customGames: {
        appleGame: string;      // gameConfig ID
        fingerDance: string;    // gameConfig ID
    };
    devices: string[];          // Hastanın kullandığı cihazların ID listesi
    diagnosis: string;
    isFemale: boolean;
    name: string;
    note: string;
    romID: string;              // Hastanın ROM (hareket aralığı) profili ID'si
    sessionCount: number;       // Hastanın toplam seans sayısı
    sessions?: { [sessionId: string]: boolean }; // Hastanın katıldığı tüm seansların ID'leri
}

export interface Session {
    id: string;
    date: string;               // Seansın tarihi, "YYYY-AA-GG" formatında
    deviceID: string;           // Seansın yapıldığı cihazın ID'si
    patientID: string;          // Seansın yapıldığı hastanın ID'si
    startTime: string;          // Seansın başlangıç zamanı, "HH:mm" formatında
    endTime: string;            // Seansın bitiş zamanı (başlangıçta boş olabilir)
    romID: string;              // Seans sırasında kullanılan ROM profili ID'si
    // Bu alanlar, seans akışı sırasında doldurulur.
    gameType?: 'appleGame' | 'fingerDance';
    gameConfigID?: string;
    gameResultID?: string;
    // Enhanced session logging
    preRomID?: string;          // ROM measurement before session
    postRomID?: string;         // ROM measurement after session
    sessionLog?: {
        calibrationTime: number; // Milliseconds
        gameTime: number;        // Milliseconds
        restTime: number;        // Milliseconds
        totalTime: number;       // Milliseconds
    };
    performanceMetrics?: {
        averageAccuracy: number;
        improvementFromLastSession: number;
        fatigueFactor: number;   // 0-1 scale
        motivationLevel: number; // 1-10 scale
    };
}

export interface Device {
    id: string;
    connectionStatus: 'online' | 'offline';
    deviceName: string;
    enable: boolean;
    patientID: string;          // Cihazın o anki kullanıcısı (hasta ID'si), boş ise müsait demek.
}

// GameConfig için birleşik bir tip (Union Type).
// Bu, hem Elma Toplama hem de Piyano oyununun ayarlarını tek bir tip altında birleştirir.
interface BaseGameConfig {
    id: string;
    gameType: 'appleGame' | 'fingerDance';
}

export interface AppleGameConfig extends BaseGameConfig {
    gameType: 'appleGame';
    allowedHand: 'right' | 'left' | 'both';
    difficulty: 'easy' | 'medium' | 'hard';
    duration: number;           // Saniye cinsinden
    maxApples: number;
}

export interface FingerDanceConfig extends BaseGameConfig {
    gameType: 'fingerDance';
    song: string;
    difficulty: 'easy' | 'medium' | 'hard';
    speed: number;
    targetFingers: number[];
    totalNotes?: number;           // Total notes in the song
}

export type GameConfig = AppleGameConfig | FingerDanceConfig;


// GameResult için birleşik bir tip
interface BaseGameResult {
    id: string;
    gameType: 'appleGame' | 'fingerDance';
    score: number;
    sessionID: string;
}

export interface AppleGameResult extends BaseGameResult {
    gameType: 'appleGame';
    apples: {
        index: number;
        status: 'picked' | 'dropped' | 'missed';
        time?: number;
    }[];
    successRate: number;
}

export interface FingerDanceResult extends BaseGameResult {
    gameType: 'fingerDance';
    songName: string;
    difficulty: 'easy' | 'medium' | 'hard';
    totalNotes: number;
    hitNotes: number;
    missedNotes: number;
    accuracy: number;               // hitNotes / totalNotes
    maxCombo: number;
    fingerPerformance: {
        finger1: { hits: number; misses: number; accuracy: number; };  // Thumb
        finger2: { hits: number; misses: number; accuracy: number; };  // Index
        finger3: { hits: number; misses: number; accuracy: number; };  // Middle
        finger4: { hits: number; misses: number; accuracy: number; };  // Ring
        finger5: { hits: number; misses: number; accuracy: number; };  // Pinky
    };
    fingerMovementLogID?: string;   // Reference to FingerMovementLog
    timing: {
        startTime: string;          // ISO timestamp
        endTime: string;            // ISO timestamp  
        duration: number;           // Milliseconds
    };
    // Legacy fields for backward compatibility
    combo: number;                  // Same as maxCombo
    mistakes: number;               // Same as missedNotes
    notes: {
        finger: number;
        hit: boolean;
        note: string;
        time: number;
    }[];
}

export type GameResult = AppleGameResult | FingerDanceResult;


// ROM (Range of Motion - Hareket Aralığı) Profili
export interface Rom {
    id: string;
    patientID: string;
    measurementDate: string;        // ISO timestamp
    // Legacy fields for backward compatibility
    arm: {
        leftSpace: number;
        rightSpace: number;
    };
    finger: {
        leftFingers: { max: number; min: number }[];
        rightFingers: { max: number; min: number }[];
    };
    // Enhanced ROM data structure
    fingerRanges: {
        thumb: {
            flexion: number;        // Degrees
            extension: number;      // Degrees
            abduction: number;      // Degrees
        };
        index: {
            flexion: number;
            extension: number;
            abduction: number;
        };
        middle: {
            flexion: number;
            extension: number;
            abduction: number;
        };
        ring: {
            flexion: number;
            extension: number;
            abduction: number;
        };
        pinky: {
            flexion: number;
            extension: number;
            abduction: number;
        };
    };
    wristRange: {
        flexion: number;            // Degrees
        extension: number;          // Degrees
        ulnarDeviation: number;     // Degrees
        radialDeviation: number;    // Degrees
    };
    gripStrength: number;           // kg or pounds
    notes: string;                  // Clinical notes
}