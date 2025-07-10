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
    rom?: Rom;
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
    gameType?: 'appleGame' | 'fingerDance' | 'operaScene';
    gameConfigID?: string;
    gameResultID?: string;
    // YENİ EKLENEN/GÜNCELLENEN ALANLAR
    maxRomClibre: boolean;
    minRomClibre: boolean;
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
    handPerHundred: number;
}

export interface FingerDanceConfig extends BaseGameConfig {
    gameType: 'fingerDance';
    song: string;
    speed: number;
    targetFingers: number[];
    handPerHundred: number;
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
    combo: number;
    mistakes: number;
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
    arm: {
        leftSpace: number;
        rightSpace: number;
    };
    finger: {
        leftFingers: { max: number; min: number }[];
        rightFingers: { max: number; min: number }[];
    };
}