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
    
    // Detaylı seans analizi
    analytics: {
        totalDuration: number;          // Toplam süre (dakika)
        activeDuration: number;         // Aktif oyun süresi (dakika)
        pausedDuration: number;         // Duraklama süresi (dakika)
        performanceScore: number;       // Genel performans skoru (0-100)
        improvementScore: number;       // Gelişim skoru (önceki seansla karşılaştırma)
        fatigueLevel: number;          // Yorgunluk seviyesi (0-100)
        motivationLevel: number;        // Motivasyon seviyesi (0-100)
        difficultyRating: number;      // Zorluk değerlendirmesi (0-10)
        patientFeedback: string;       // Hasta geri bildirimi
        therapistNotes: string;        // Terapist notları
    };
    
    // Gerçek zamanlı veri logging
    realTimeData: {
        heartRate?: {                  // Kalp atış hızı (isteğe bağlı)
            min: number;
            max: number;
            avg: number;
            data: { time: number; rate: number; }[];
        };
        stressLevel?: {               // Stres seviyesi (isteğe bağlı)
            avg: number;
            data: { time: number; level: number; }[];
        };
        movementQuality: {            // Hareket kalitesi
            smoothness: number;       // Akıcılık skoru (0-100)
            precision: number;        // Hassasiyet skoru (0-100)
            consistency: number;      // Tutarlılık skoru (0-100)
        };
    };
    
    // ROM gelişimi
    romProgress: {
        beforeSession: {              // Seans öncesi ROM değerleri
            [metric: string]: number;
        };
        afterSession: {               // Seans sonrası ROM değerleri
            [metric: string]: number;
        };
        improvements: {               // Seans içindeki gelişimler
            [metric: string]: number;
        };
        targetProgress: number;       // Hedeflere göre ilerleme yüzdesi
    };
    
    // Oyun spesifik veriler
    gameSpecificData?: {
        fingerDance?: {
            songsPlayed: string[];
            difficultyLevels: string[];
            avgAccuracy: number;
            totalNotes: number;
            perfectHits: number;
            fingerUsageStats: {
                [fingerId: number]: {
                    usage: number;      // Kullanım yüzdesi
                    accuracy: number;   // Doğruluk
                };
            };
        };
        appleGame?: {
            applesTotal: number;
            applesCollected: number;
            successRate: number;
            avgCollectionTime: number;
            handUsageStats: {
                left: number;
                right: number;
                both: number;
            };
        };
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
    speed: number;
    targetFingers: number[];
    difficulty: 'easy' | 'medium' | 'hard';
    duration: number;           // Saniye cinsinden
    bpm: number;               // Beats per minute
    notePattern: string;       // Nota deseni referansı
    targetAccuracy: number;    // Hedef doğruluk yüzdesi
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
        accuracy: number;       // 0-100 arası doğruluk skoru
        reactionTime: number;   // Millisaniye cinsinden tepki süresi
        position: {             // Parmak pozisyonu
            x: number;
            y: number;
            z: number;
        };
        velocity: number;       // Hareket hızı
    }[];
    performance: {
        accuracy: number;           // Genel doğruluk yüzdesi
        avgReactionTime: number;    // Ortalama tepki süresi
        maxCombo: number;          // En yüksek kombo
        perfectHits: number;       // Mükemmel vuruş sayısı
        goodHits: number;          // İyi vuruş sayısı
        missedHits: number;        // Kaçırılan vuruş sayısı
        totalNotes: number;        // Toplam nota sayısı
        fingerAnalysis: {          // Parmak bazında analiz
            [fingerId: number]: {
                hits: number;
                misses: number;
                avgAccuracy: number;
                avgReactionTime: number;
            };
        };
    };
    timing: {
        gameStartTime: number;     // Oyun başlangıç zamanı (timestamp)
        gameEndTime: number;       // Oyun bitiş zamanı (timestamp)
        pausedDuration: number;    // Toplam duraklama süresi
        activeDuration: number;    // Aktif oyun süresi
    };
    romData: {                     // ROM verileri
        fingerRanges: {
            [fingerId: number]: {
                minAngle: number;
                maxAngle: number;
                avgAngle: number;
                rangeImprovement: number; // Önceki seansla karşılaştırma
            };
        };
        armMovement: {
            leftArm: {
                minX: number; maxX: number;
                minY: number; maxY: number;
                minZ: number; maxZ: number;
            };
            rightArm: {
                minX: number; maxX: number;
                minY: number; maxY: number;
                minZ: number; maxZ: number;
            };
        };
    };
}

export type GameResult = AppleGameResult | FingerDanceResult;

// Gerçek zamanlı pozisyon logging sistemi (position_log.json benzeri)
export interface PositionLog {
    id: string;
    sessionID: string;
    gameType: 'appleGame' | 'fingerDance';
    startTime: number;              // Başlangıç timestamp
    endTime: number;                // Bitiş timestamp
    samplingRate: number;           // Örnekleme hızı (Hz)
    data: PositionLogEntry[];
}

export interface PositionLogEntry {
    timestamp: number;              // Zaman damgası
    frameNumber: number;            // Kare numarası
    hands: {
        left: HandData;
        right: HandData;
    };
    gameState: GameState;
    performanceMetrics: InstantPerformanceMetrics;
}

export interface HandData {
    isTracked: boolean;
    position: { x: number; y: number; z: number; };
    rotation: { x: number; y: number; z: number; w: number; };
    velocity: { x: number; y: number; z: number; };
    acceleration: { x: number; y: number; z: number; };
    fingers: FingerData[];
    palmCenter: { x: number; y: number; z: number; };
    palmNormal: { x: number; y: number; z: number; };
    confidence: number;             // Tracking güvenilirliği (0-1)
}

export interface FingerData {
    fingerId: number;               // 0: Thumb, 1: Index, 2: Middle, 3: Ring, 4: Pinky
    isExtended: boolean;
    joints: {
        tip: { x: number; y: number; z: number; };
        pip: { x: number; y: number; z: number; };
        mcp: { x: number; y: number; z: number; };
        cmc?: { x: number; y: number; z: number; }; // Sadece başparmak için
    };
    flexion: number;                // Parmak büküm açısı (0-180 derece)
    extension: number;              // Parmak açılma açısı
    abduction: number;              // Parmak açma açısı
    velocity: number;               // Hareket hızı
    isActive: boolean;              // Aktif hareket durumu
}

export interface GameState {
    currentScore: number;
    currentLevel: number;
    activeTargets: GameTarget[];
    timeRemaining: number;
    combo: number;
    mistakes: number;
    isPaused: boolean;
    gamePhase: 'warmup' | 'active' | 'cooldown' | 'finished';
}

export interface GameTarget {
    id: string;
    type: 'note' | 'apple' | 'basket';
    position: { x: number; y: number; z: number; };
    targetFinger?: number;          // FingerDance için hedef parmak
    targetHand?: 'left' | 'right';  // Hedef el
    spawnTime: number;              // Oluşturulma zamanı
    hitTime?: number;               // Vuruş zamanı
    isHit: boolean;
    accuracy?: number;              // Vuruş doğruluğu
}

export interface InstantPerformanceMetrics {
    currentAccuracy: number;
    reactionTime: number;
    movementSmoothness: number;
    handCoordination: number;
    fingerCoordination: number;
    fatigueIndicator: number;
    romUtilization: number;         // ROM kullanım yüzdesi
}

// Analiz ve raporlama için veri yapıları
export interface PerformanceAnalysis {
    id: string;
    sessionID: string;
    patientID: string;
    analysisDate: string;
    analysisType: 'session' | 'weekly' | 'monthly' | 'progress';
    
    // Genel performans metrikleri
    overallMetrics: {
        totalScore: number;
        improvementRate: number;
        consistencyScore: number;
        enduranceScore: number;
        motivationScore: number;
    };
    
    // Oyun spesifik analiz
    gameAnalysis: {
        fingerDance?: FingerDanceAnalysis;
        appleGame?: AppleGameAnalysis;
    };
    
    // ROM analizi
    romAnalysis: {
        currentRanges: { [joint: string]: number; };
        improvements: { [joint: string]: number; };
        targetProgress: { [joint: string]: number; };
        recommendations: string[];
    };
    
    // Trend analizi
    trendAnalysis: {
        performanceTrend: 'improving' | 'stable' | 'declining';
        weeklyChange: number;
        monthlyChange: number;
        projectedImprovement: number;
        nextMilestone: {
            description: string;
            estimatedDate: string;
            confidenceLevel: number;
        };
    };
    
    // Öneriler
    recommendations: {
        gameSettings: {
            difficulty: 'easier' | 'maintain' | 'harder';
            duration: 'shorter' | 'maintain' | 'longer';
            frequency: 'less' | 'maintain' | 'more';
        };
        therapyFocus: string[];
        nextSessionGoals: string[];
    };
}

export interface FingerDanceAnalysis {
    fingerPerformance: {
        [fingerId: number]: {
            accuracy: number;
            speed: number;
            consistency: number;
            improvement: number;
            recommendedExercises: string[];
        };
    };
    coordinationScore: number;
    rhythmAccuracy: number;
    reactionTimeStats: {
        min: number;
        max: number;
        avg: number;
        stdDev: number;
    };
    difficultyProgression: {
        currentLevel: string;
        recommendedNext: string;
        readinessScore: number;
    };
}

export interface AppleGameAnalysis {
    handPreference: 'left' | 'right' | 'balanced';
    reachAnalysis: {
        comfortableReach: number;
        maxReach: number;
        reachImprovement: number;
    };
    grabAccuracy: number;
    releaseControl: number;
    spatialAwareness: number;
    taskCompletionEfficiency: number;
}

// Hasta ilerleme raporu
export interface PatientProgressReport {
    id: string;
    patientID: string;
    reportDate: string;
    reportPeriod: {
        startDate: string;
        endDate: string;
        totalSessions: number;
    };
    
    // Genel ilerleme
    overallProgress: {
        totalImprovement: number;
        weeklyAverage: number;
        monthlyAverage: number;
        goalAchievement: number;
        nextGoals: string[];
    };
    
    // ROM gelişimi
    romProgress: {
        [joint: string]: {
            baseline: number;
            current: number;
            improvement: number;
            target: number;
            progressPercentage: number;
        };
    };
    
    // Oyun performansı
    gamePerformance: {
        fingerDance?: {
            accuracyTrend: number[];
            speedTrend: number[];
            consistencyTrend: number[];
            favoriteLevel: string;
            challengingAreas: string[];
        };
        appleGame?: {
            successRateTrend: number[];
            reachTrend: number[];
            coordinationTrend: number[];
            preferredHand: string;
            improvementAreas: string[];
        };
    };
    
    // Öneriler ve sonraki adımlar
    recommendations: {
        therapyAdjustments: string[];
        gameSettings: {
            difficulty: string;
            duration: string;
            frequency: string;
        };
        homeExercises: string[];
        nextMilestones: {
            description: string;
            targetDate: string;
            metrics: string[];
        }[];
    };
    
    // Grafik verileri
    chartData: {
        performanceOverTime: { date: string; score: number; }[];
        romOverTime: { date: string; [joint: string]: number; }[];
        gameScoresOverTime: { date: string; [gameType: string]: number; }[];
        weeklyProgress: { week: string; improvement: number; }[];
    };
}


// ROM (Range of Motion - Hareket Aralığı) Profili
export interface Rom {
    id: string;
    patientID: string;          // ROM'un ait olduğu hasta
    createdDate: string;        // ROM profilinin oluşturulma tarihi
    lastUpdated: string;        // Son güncelleme tarihi
    arm: {
        leftSpace: number;
        rightSpace: number;
        // Detaylı kol hareketi verileri
        leftArm: {
            shoulder: { min: number; max: number; current: number; target: number; };
            elbow: { min: number; max: number; current: number; target: number; };
            wrist: { min: number; max: number; current: number; target: number; };
        };
        rightArm: {
            shoulder: { min: number; max: number; current: number; target: number; };
            elbow: { min: number; max: number; current: number; target: number; };
            wrist: { min: number; max: number; current: number; target: number; };
        };
    };
    finger: {
        leftFingers: { 
            min: number; 
            max: number; 
            current: number;    // Mevcut değer
            target: number;     // Hedef değer
            improvement: number; // Gelişim yüzdesi
            lastSession: number; // Son seanstaki değer
        }[];
        rightFingers: { 
            min: number; 
            max: number; 
            current: number;
            target: number;
            improvement: number;
            lastSession: number;
        }[];
        // Parmak bazında detaylı analiz
        fingerAnalysis: {
            [fingerId: number]: {
                flexibility: number;        // Esneklik skoru (0-100)
                strength: number;          // Güç skoru (0-100)
                coordination: number;      // Koordinasyon skoru (0-100)
                endurance: number;         // Dayanıklılık skoru (0-100)
                progressTrend: 'improving' | 'stable' | 'declining';
                weeklyImprovement: number; // Haftalık gelişim yüzdesi
            };
        };
    };
    // Genel ilerleme metrikleri
    overallProgress: {
        totalImprovement: number;      // Toplam gelişim yüzdesi
        weeklyAverage: number;         // Haftalık ortalama gelişim
        monthlyAverage: number;        // Aylık ortalama gelişim
        sessionsCompleted: number;     // Tamamlanan seans sayısı
        targetAchievement: number;     // Hedef başarı yüzdesi
        nextMilestone: {               // Bir sonraki kilometre taşı
            description: string;
            targetDate: string;
            progressPercentage: number;
        };
    };
    // Seans bazında geçmiş
    sessionHistory: {
        [sessionId: string]: {
            date: string;
            improvements: {
                [metric: string]: number; // Hangi metrikte ne kadar gelişim
            };
            notes: string;
        };
    };
}