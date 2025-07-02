export interface Patient {
    id: string;
    age: number;
    customGames: string
    devices: string[];          
    diagnosis: string;
    isFemale: boolean;
    name: string;
    note: string;
    romID: string;             
    sessions: string[];         
}

export interface Session {
    id: string;
    date: string;              
    deviceID: string;
    endTime: string;            
    gamesPlayed: {
        gameID: string;
        gameResultID: string;
    }[];
    patientID: string;
    romID: string;
    startTime: string;          
}

export interface Device {
    id: string;
    connectionStatus: 'online' | 'offline';
    deviceName: string;
    enable: boolean;
    patientID: string;
}

// GameConfig için birleşik bir tip (Union Type)
interface BaseGameConfig {
    id: string;
    gameType: 'appleGame' | 'fingerDance';
}

export interface AppleGameConfig extends BaseGameConfig {
    gameType: 'appleGame';
    allowedHand: 'right' | 'left' | 'both';
    difficulty: 'easy' | 'medium' | 'hard';
    duration: number;           
    maxApples: number;
}

export interface FingerDanceConfig extends BaseGameConfig {
    gameType: 'fingerDance';
    song: string;
    speed: number;
    targetFingers: number[];
}

export type GameConfig = AppleGameConfig | FingerDanceConfig;



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