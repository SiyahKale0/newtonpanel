// src/types/firebase.ts

// Sahnedeki her bir nesnenin yapısını tanımlar.
// 'type' özelliği artık 'apple_fresh', 'apple_rotten' ve 'basket' olabilir.
export interface SceneObject {
    id: string;
    type: string;
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
}

// ===================================================================
//              OYUN KONFİGÜRASYON TİPLERİ
// ===================================================================

export interface AppleGameConfig {
    id: string;
    gameType: 'appleGame';
    gameMode: "Reach" | "Grip" | "Carry" | "Sort";
    level: number; // 0-4 arası (Çok Kolay -> Çok Zor)
    status: "idle" | "playing" | "finish";
    allowedHand: "both" | "left" | "right";
    difficulty: "easy" | "medium" | "hard";
    duration: number; // saniye
    maxApples: number;
    handPerHundred: number;
    // YENİ: Özel yerleşim seviyesi için sahne nesnelerini tutar.
    appleDirectory?: SceneObject[];
}

export interface FingerDanceConfig {
    id: string;
    gameType: 'fingerDance';
    song: string;
    speed: number;
    targetFingers: number[];
    handPerHundred: number;
    status: "idle" | "playing" | "finish";
}

export type GameConfig = AppleGameConfig | FingerDanceConfig;


// ===================================================================
//              GENEL VERİ TİPLERİ
// ===================================================================

export interface Patient {
    id: string;
    name: string;
    age: number;
    diagnosis: string;
    isFemale: boolean;
    note?: string;
    customGames: {
        appleGame: string;
        fingerDance: string;
    };
    devices: string[];
    romID: string;
    sessionCount: number;
    sessions: Record<string, boolean>; // { "session_id_1": true, ... }
}

export interface Session {
    id: string;
    patientID: string;
    deviceID: string;
    date: string; // "YYYY-MM-DD"
    startTime: string; // "HH:MM:SS"
    endTime: string; // "HH:MM:SS"
    gameType?: 'appleGame' | 'fingerDance';
    gameConfigID?: string;
    romID: string;
    minRomClibre: boolean;
    maxRomClibre: boolean;
}

export interface Device {
    id: string;
    connectionStatus: 'online' | 'offline';
    deviceName: string;
    enable: boolean;
    patientID: string;
}

// ===================================================================
//                  OYUN SONUÇ TİPLERİ
// ===================================================================

interface AppleLog {
    appleID: string;
    status: 'picked' | 'missed' | 'dropped';
    basketID: string | null;
    time: number;
}

export interface AppleGameResult {
    sessionID: string;
    gameType: 'appleGame';
    apples?: AppleLog[];
    score?: number;
    successRate?: number;
    totalScore?: number;
}

interface NoteLog {
    finger: number;
    hit: boolean;
    note: string;
    time: number;
}

export interface FingerDanceResult {
    sessionID: string;
    gameType: 'fingerDance';
    notes?: NoteLog[];
    score?: number;
    combo?: number;
    mistakes?: number;
    takes?: number;
    totalScore?: number;
    fingerAccuracy?: Record<string, number>;
}

export type GameResult = AppleGameResult | FingerDanceResult;

export interface SessionHistoryItem {
    activity: string;
    level: number;
    percent: number;
    timestamp: string;
}

export type SessionResult = {
    history?: SessionHistoryItem[];
    results?: GameResult[];
};

// ===================================================================
//                       ROM TİPLERİ
// ===================================================================

interface ArmRom {
    leftSpace: number;
    rightSpace: number;
}

interface FingerRom {
    min: number;
    max: number;
}

export interface Rom {
    id: string;
    finger: FingerRom[];
}