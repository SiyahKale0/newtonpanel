export interface Patient {
    id: string;
    age: number;
    customGames: {
        appleGame: string;
        fingerDance: string;
    };
    devices: string[];
    diagnosis: string;
    isFemale: boolean;
    name: string;
    note: string;
    romID: string;
    sessionCount: number;
    sessions?: { [sessionId: string]: boolean };
    rom?: Rom;
    // YENİ: Her oyun modunun en son %100 tamamlanan seviyesini saklar.
    // Örnek: { "appleGame_Reach": 3, "appleGame_Sort": 1 }
    lastCompletedLevels?: { [gameMode: string]: number };
}

export interface Session {
    id: string;
    date: string;
    deviceID: string;
    patientID: string;
    startTime: string;
    endTime: string;
    romID: string;
    // DEĞİŞİKLİK: Tek bir gameConfigID ve gameType yerine,
    // seans içindeki tüm oyun yapılandırmalarını tutan bir nesne.
    gameConfigIDs?: { [configId: string]: boolean };
    // Seans içinde o anda aktif olan, yani VR cihazında oynanan oyunu belirtir.
    activeGameConfigID?: string;
    maxRomClibre: boolean;
    minRomClibre: boolean;
}

export interface Device {
    id:string;
    connectionStatus: 'online' | 'offline';
    deviceName: string;
    enable: boolean;
    patientID: string;
}

export interface BaseGameConfig {
    id: string;
    gameType: 'appleGame' | 'fingerDance';
}

export interface AppleGameConfig extends BaseGameConfig {
    gameType: 'appleGame';
    // DEĞİŞİKLİK: Seviyeler 5'e çıkarıldı ve yeni mod/durum eklendi.
    level: 1 | 2 | 3 | 4 | 5;
    gameMode: "Reach" | "Grip" | "Carry" | "Sort" | "Manual"; // YENİ: Manuel mod
    status: "idle" | "playing" | "finish" | "restarting"; // YENİ: Yeniden başlatma durumu
    allowedHand: 'right' | 'left' | 'both';
    difficulty: 'easy' | 'medium' | 'hard';
    duration: number;
    maxApples: number;
    handPerHundred: number;
    // YENİ: Manuel mod için terapistin girdiği elma koordinatları
    manualApples?: { x: number, y: number, z: number }[];
}

export interface FingerDanceGameConfig extends BaseGameConfig {
    gameType: 'fingerDance';
    song: string;
    speed: number;
    targetFingers: number[];
    handPerHundred: number;
    status: "idle" | "playing" | "finish" | "restarting"; // YENİ: Yeniden başlatma durumu
}

export type GameConfig = AppleGameConfig | FingerDanceGameConfig;


export interface BaseGameResult {
    id: string;
    sessionID: string;
    gameType: 'appleGame' | 'fingerDance';
    score: number;
    successRate: number;
}

export interface Apple {
    index: number;
    status: 'picked' | 'dropped' | 'missed';
    time?: number;
}

export interface AppleGameResult extends BaseGameResult {
    gameType: 'appleGame';
    apples: Apple[];
}

export interface Note {
    finger: number;
    hit: boolean;
    time: number;
    note: string;
}

export interface FingerDanceGameResult extends BaseGameResult {
    gameType: 'fingerDance';
    mistakes: number;
    notes: Note[];
    takes: number;
}

export type GameResult = AppleGameResult | FingerDanceGameResult;

export interface Finger {
    min: number;
    max: number;
}

export interface Arm {
    leftSpace: number;
    rightSpace: number;
}

export interface Rom {
    id: string;
    finger: Finger[];
    arm: Arm;
}