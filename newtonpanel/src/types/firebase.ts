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
    speed: number;
    targetFingers: number[];
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
    accuracy: number;
    maxCombo: number;
    fingerPerformance: {
        finger1: FingerStats;
        finger2: FingerStats;
        finger3: FingerStats;
        finger4: FingerStats;
        finger5: FingerStats;
    };
    fingerMovementLog: FingerMovement[];
    timing: {
        startTime: string;
        endTime: string;
        duration: number;
    };
    // Legacy fields for backward compatibility
    combo?: number;
    mistakes?: number;
    notes?: {
        finger: number;
        hit: boolean;
        note: string;
        time: number;
    }[];
}

export interface FingerStats {
    hits: number;
    misses: number;
    accuracy: number;
}

export interface FingerMovement {
    timestamp: number;
    targetFinger: number;
    actualFingers: number[];
    fingerPositions: {
        thumb: string;
        index: string;
        middle: string;
        ring: string;
        pinky: string;
    };
    hit: boolean;
    timing: 'perfect' | 'good' | 'miss';
    score: number;
}

export type GameResult = AppleGameResult | FingerDanceResult;


// ROM (Range of Motion - Hareket Aralığı) Profili
export interface Rom {
    id: string;
    arm: {
        leftSpace: number;
        rightSpace: number;
    };
    finger: {
        leftFingers: { max: number; min: number }[];
        rightFingers: { max: number; min: number }[];
    };
}

export interface DetailedRom {
    patientID: string;
    measurementDate: string;
    fingerRanges: {
        thumb: FingerRange;
        index: FingerRange;
        middle: FingerRange;
        ring: FingerRange;
        pinky: FingerRange;
    };
    wristRange: WristRange;
    gripStrength: number;
    notes: string;
}

export interface FingerRange {
    flexion: number;
    extension: number;
    abduction: number;
}

export interface WristRange {
    flexion: number;
    extension: number;
    ulnarDeviation: number;
    radialDeviation: number;
}