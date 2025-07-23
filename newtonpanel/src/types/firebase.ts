// src/types/firebase.ts

// Sahnedeki her bir nesnenin yapısını tanımlar.
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
    // YENİ: Terapist önerileri için alan
    recommendations?: Record<string, { text: string; date: string; therapistId: string }>;
    customGames: {
        appleGame: string;
        fingerDance: string;
    };
    devices: string[];
    romID: string;
    sessionCount: number;
    sessions: Record<string, boolean>;
}

// YENİ: Terapistler için ayrı bir veri modeli
export interface Therapist {
    id: string; // Firebase Auth UID ile aynı olacak
    name: string;
    email: string;
    role: 'therapist' | 'admin';
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

// YENİ: 3D pozisyon verisi için tip
export interface Vector3Data {
    x: number;
    y: number;
    z: number;
}

// YENİ: Hareket yörüngesi için tip
export interface Trajectory {
    toApple: Vector3Data[];
    toBasket: Vector3Data[];
}

export interface AppleGameResult {
    sessionID: string;
    gameType: 'appleGame';
    score?: number;
    successRate?: number;
<<<<<<< Updated upstream
=======
    // YENİ: Dinamik yörünge verisi
    trajectories?: Trajectory[];
>>>>>>> Stashed changes
}

interface NoteLog {
    noteID: string;
    finger: number;
    hit: boolean;
    time: number;
    // YENİ: Hangi elin kullanıldığı bilgisi
    hand: 'left' | 'right';
}

export interface FingerDanceResult {
    sessionID: string;
    gameType: 'fingerDance';
    notes?: NoteLog[];
    score?: number;
    combo?: number;
    mistakes?: number;
}

export type GameResult = AppleGameResult | FingerDanceResult;

// ===================================================================
//                       ROM TİPLERİ
// ===================================================================

interface FingerRom {
    min: number;
    max: number;
}

export interface Rom {
    id: string;
<<<<<<< Updated upstream
    arm: ArmRom;
    finger: {
        leftFingers: FingerRom[];
        rightFingers: FingerRom[];
    }
}
=======
    arm: {
        leftSpace: number;
        rightSpace: number;
    };
    finger: {
        leftFingers: FingerRom[];
        rightFingers: FingerRom[];
    };
}
>>>>>>> Stashed changes
