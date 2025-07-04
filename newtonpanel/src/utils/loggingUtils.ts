// src/utils/loggingUtils.ts

import { PositionLogEntry, HandData, FingerData, GameState, GameTarget, InstantPerformanceMetrics } from '@/types/firebase';
import { addPositionLogEntry, addMultiplePositionLogEntries } from '@/services/positionLogService';

/**
 * Gerçek zamanlı pozisyon logging için yardımcı sınıf
 */
export class RealTimeLogger {
    private logId: string;
    private isLogging: boolean = false;
    private frameNumber: number = 0;
    private logBuffer: PositionLogEntry[] = [];
    private bufferSize: number = 100; // Buffer boyutu
    private lastFlushTime: number = 0;
    private flushInterval: number = 5000; // 5 saniyede bir flush

    constructor(logId: string, bufferSize: number = 100) {
        this.logId = logId;
        this.bufferSize = bufferSize;
    }

    /**
     * Logging'i başlatır
     */
    startLogging(): void {
        this.isLogging = true;
        this.frameNumber = 0;
        this.logBuffer = [];
        this.lastFlushTime = Date.now();
    }

    /**
     * Logging'i durdurur ve kalan verileri gönderir
     */
    async stopLogging(): Promise<void> {
        this.isLogging = false;
        if (this.logBuffer.length > 0) {
            await this.flushBuffer();
        }
    }

    /**
     * Yeni bir pozisyon verisi ekler
     * @param hands El verileri
     * @param gameState Oyun durumu
     * @param performanceMetrics Performans metrikleri
     */
    async logPosition(
        hands: { left: HandData; right: HandData },
        gameState: GameState,
        performanceMetrics: InstantPerformanceMetrics
    ): Promise<void> {
        if (!this.isLogging) return;

        const entry: PositionLogEntry = {
            timestamp: Date.now(),
            frameNumber: this.frameNumber++,
            hands,
            gameState,
            performanceMetrics
        };

        this.logBuffer.push(entry);

        // Buffer dolunca veya belirli süre geçince flush et
        const now = Date.now();
        if (this.logBuffer.length >= this.bufferSize || 
            now - this.lastFlushTime >= this.flushInterval) {
            await this.flushBuffer();
        }
    }

    /**
     * Buffer'daki verileri veritabanına gönderir
     */
    private async flushBuffer(): Promise<void> {
        if (this.logBuffer.length === 0) return;

        try {
            await addMultiplePositionLogEntries(this.logId, this.logBuffer);
            this.logBuffer = [];
            this.lastFlushTime = Date.now();
        } catch (error) {
            console.error('Buffer flush hatası:', error);
        }
    }

    /**
     * Logging durumunu kontrol eder
     */
    isCurrentlyLogging(): boolean {
        return this.isLogging;
    }

    /**
     * Mevcut frame numarasını döndürür
     */
    getCurrentFrame(): number {
        return this.frameNumber;
    }
}

/**
 * VR el verilerini normalize eder
 * @param rawHandData Ham el verisi
 * @returns Normalize edilmiş el verisi
 */
export function normalizeHandData(rawHandData: any): HandData {
    return {
        isTracked: rawHandData.isTracked || false,
        position: {
            x: rawHandData.position?.x || 0,
            y: rawHandData.position?.y || 0,
            z: rawHandData.position?.z || 0
        },
        rotation: {
            x: rawHandData.rotation?.x || 0,
            y: rawHandData.rotation?.y || 0,
            z: rawHandData.rotation?.z || 0,
            w: rawHandData.rotation?.w || 1
        },
        velocity: {
            x: rawHandData.velocity?.x || 0,
            y: rawHandData.velocity?.y || 0,
            z: rawHandData.velocity?.z || 0
        },
        acceleration: {
            x: rawHandData.acceleration?.x || 0,
            y: rawHandData.acceleration?.y || 0,
            z: rawHandData.acceleration?.z || 0
        },
        fingers: normalizeFingerData(rawHandData.fingers || []),
        palmCenter: {
            x: rawHandData.palmCenter?.x || 0,
            y: rawHandData.palmCenter?.y || 0,
            z: rawHandData.palmCenter?.z || 0
        },
        palmNormal: {
            x: rawHandData.palmNormal?.x || 0,
            y: rawHandData.palmNormal?.y || 1,
            z: rawHandData.palmNormal?.z || 0
        },
        confidence: Math.max(0, Math.min(1, rawHandData.confidence || 0))
    };
}

/**
 * Parmak verilerini normalize eder
 * @param rawFingerData Ham parmak verileri
 * @returns Normalize edilmiş parmak verileri
 */
export function normalizeFingerData(rawFingerData: any[]): FingerData[] {
    return rawFingerData.map((finger, index) => ({
        fingerId: index,
        isExtended: finger.isExtended || false,
        joints: {
            tip: finger.joints?.tip || { x: 0, y: 0, z: 0 },
            pip: finger.joints?.pip || { x: 0, y: 0, z: 0 },
            mcp: finger.joints?.mcp || { x: 0, y: 0, z: 0 },
            cmc: index === 0 ? finger.joints?.cmc || { x: 0, y: 0, z: 0 } : undefined
        },
        flexion: Math.max(0, Math.min(180, finger.flexion || 0)),
        extension: Math.max(0, Math.min(180, finger.extension || 0)),
        abduction: Math.max(0, Math.min(90, finger.abduction || 0)),
        velocity: Math.max(0, finger.velocity || 0),
        isActive: finger.isActive || false
    }));
}

/**
 * Performans metriklerini hesaplar
 * @param hands El verileri
 * @param gameState Oyun durumu
 * @param previousMetrics Önceki metrikler (trend hesaplama için)
 * @returns Anlık performans metrikleri
 */
export function calculateInstantPerformanceMetrics(
    hands: { left: HandData; right: HandData },
    gameState: GameState,
    previousMetrics?: InstantPerformanceMetrics
): InstantPerformanceMetrics {
    // Mevcut doğruluk (oyun durumuna göre)
    const currentAccuracy = calculateCurrentAccuracy(gameState);
    
    // Tepki süresi (hedeflerin spawn zamanına göre)
    const reactionTime = calculateReactionTime(gameState);
    
    // Hareket akıcılığı
    const movementSmoothness = calculateMovementSmoothness(hands, previousMetrics);
    
    // El koordinasyonu
    const handCoordination = calculateHandCoordination(hands);
    
    // Parmak koordinasyonu
    const fingerCoordination = calculateFingerCoordination(hands);
    
    // Yorgunluk göstergesi
    const fatigueIndicator = calculateFatigueIndicator(hands, previousMetrics);
    
    // ROM kullanımı
    const romUtilization = calculateRomUtilization(hands);

    return {
        currentAccuracy,
        reactionTime,
        movementSmoothness,
        handCoordination,
        fingerCoordination,
        fatigueIndicator,
        romUtilization
    };
}

/**
 * Mevcut doğruluğu hesaplar
 */
function calculateCurrentAccuracy(gameState: GameState): number {
    const totalTargets = gameState.activeTargets.length;
    if (totalTargets === 0) return 100;
    
    const hitTargets = gameState.activeTargets.filter(target => target.isHit).length;
    return (hitTargets / totalTargets) * 100;
}

/**
 * Tepki süresini hesaplar
 */
function calculateReactionTime(gameState: GameState): number {
    const recentHits = gameState.activeTargets
        .filter(target => target.isHit && target.hitTime && target.spawnTime)
        .map(target => target.hitTime! - target.spawnTime);
    
    if (recentHits.length === 0) return 0;
    
    return recentHits.reduce((sum, time) => sum + time, 0) / recentHits.length;
}

/**
 * Hareket akıcılığını hesaplar
 */
function calculateMovementSmoothness(
    hands: { left: HandData; right: HandData },
    previousMetrics?: InstantPerformanceMetrics
): number {
    // Hız değişimi analizi
    const leftVelocity = Math.sqrt(
        hands.left.velocity.x ** 2 + 
        hands.left.velocity.y ** 2 + 
        hands.left.velocity.z ** 2
    );
    
    const rightVelocity = Math.sqrt(
        hands.right.velocity.x ** 2 + 
        hands.right.velocity.y ** 2 + 
        hands.right.velocity.z ** 2
    );
    
    // Basit akıcılık skoru (gerçek uygulamada daha karmaşık olabilir)
    const velocityScore = 100 - Math.min(100, (leftVelocity + rightVelocity) * 10);
    
    return Math.max(0, velocityScore);
}

/**
 * El koordinasyonunu hesaplar
 */
function calculateHandCoordination(hands: { left: HandData; right: HandData }): number {
    if (!hands.left.isTracked || !hands.right.isTracked) return 0;
    
    // El pozisyonları arasındaki simetriyi analiz et
    const positionDiff = Math.abs(hands.left.position.y - hands.right.position.y);
    const symmetryScore = Math.max(0, 100 - positionDiff * 50);
    
    return symmetryScore;
}

/**
 * Parmak koordinasyonunu hesaplar
 */
function calculateFingerCoordination(hands: { left: HandData; right: HandData }): number {
    let coordinationScore = 0;
    let activeFingers = 0;
    
    [hands.left, hands.right].forEach(hand => {
        hand.fingers.forEach(finger => {
            if (finger.isActive) {
                activeFingers++;
                // Parmak hareketi doğruluğu
                const fingerScore = 100 - Math.abs(finger.flexion - finger.extension);
                coordinationScore += Math.max(0, fingerScore);
            }
        });
    });
    
    return activeFingers > 0 ? coordinationScore / activeFingers : 75;
}

/**
 * Yorgunluk göstergesini hesaplar
 */
function calculateFatigueIndicator(
    hands: { left: HandData; right: HandData },
    previousMetrics?: InstantPerformanceMetrics
): number {
    // Titreme analizi (velocity değişimi)
    let tremorScore = 0;
    
    [hands.left, hands.right].forEach(hand => {
        const velocityMagnitude = Math.sqrt(
            hand.velocity.x ** 2 + hand.velocity.y ** 2 + hand.velocity.z ** 2
        );
        
        // Yüksek hız değişimi yorgunluk göstergesi olabilir
        tremorScore += Math.min(100, velocityMagnitude * 20);
    });
    
    return Math.min(100, tremorScore / 2);
}

/**
 * ROM kullanımını hesaplar
 */
function calculateRomUtilization(hands: { left: HandData; right: HandData }): number {
    let romUsage = 0;
    let fingerCount = 0;
    
    [hands.left, hands.right].forEach(hand => {
        hand.fingers.forEach(finger => {
            fingerCount++;
            // Parmağın mevcut pozisyonunu ROM aralığına göre değerlendir
            const flexionUsage = (finger.flexion / 180) * 100;
            const extensionUsage = (finger.extension / 180) * 100;
            romUsage += Math.max(flexionUsage, extensionUsage);
        });
    });
    
    return fingerCount > 0 ? romUsage / fingerCount : 0;
}

/**
 * Oyun hedeflerini takip eder ve analiz eder
 */
export class GameTargetTracker {
    private targets: GameTarget[] = [];
    private hitHistory: { timestamp: number; accuracy: number; reactionTime: number }[] = [];

    /**
     * Yeni hedef ekler
     */
    addTarget(target: GameTarget): void {
        this.targets.push(target);
    }

    /**
     * Hedefi vuruldu olarak işaretler
     */
    hitTarget(targetId: string, accuracy: number): void {
        const target = this.targets.find(t => t.id === targetId);
        if (target) {
            target.isHit = true;
            target.hitTime = Date.now();
            target.accuracy = accuracy;
            
            const reactionTime = target.hitTime - target.spawnTime;
            this.hitHistory.push({ 
                timestamp: target.hitTime, 
                accuracy, 
                reactionTime 
            });
        }
    }

    /**
     * Aktif hedefleri döndürür
     */
    getActiveTargets(): GameTarget[] {
        return this.targets.filter(target => !target.isHit);
    }

    /**
     * Vuruş istatistiklerini döndürür
     */
    getHitStatistics(): {
        totalHits: number;
        averageAccuracy: number;
        averageReactionTime: number;
        hitRate: number;
    } {
        const totalTargets = this.targets.length;
        const hitTargets = this.targets.filter(t => t.isHit);
        
        if (hitTargets.length === 0) {
            return {
                totalHits: 0,
                averageAccuracy: 0,
                averageReactionTime: 0,
                hitRate: 0
            };
        }
        
        const totalAccuracy = hitTargets.reduce((sum, target) => sum + (target.accuracy || 0), 0);
        const totalReactionTime = hitTargets.reduce((sum, target) => {
            return sum + (target.hitTime ? target.hitTime - target.spawnTime : 0);
        }, 0);
        
        return {
            totalHits: hitTargets.length,
            averageAccuracy: totalAccuracy / hitTargets.length,
            averageReactionTime: totalReactionTime / hitTargets.length,
            hitRate: (hitTargets.length / totalTargets) * 100
        };
    }

    /**
     * Tracker'ı temizler
     */
    reset(): void {
        this.targets = [];
        this.hitHistory = [];
    }
}

/**
 * Data validation ve sanitization fonksiyonları
 */
export const DataValidator = {
    /**
     * Pozisyon verilerini doğrular
     */
    validatePosition(position: { x: number; y: number; z: number }): boolean {
        return typeof position.x === 'number' && 
               typeof position.y === 'number' && 
               typeof position.z === 'number' &&
               !isNaN(position.x) && !isNaN(position.y) && !isNaN(position.z);
    },

    /**
     * El verilerini doğrular
     */
    validateHandData(hand: HandData): boolean {
        return this.validatePosition(hand.position) &&
               this.validatePosition(hand.velocity) &&
               this.validatePosition(hand.acceleration) &&
               hand.confidence >= 0 && hand.confidence <= 1 &&
               Array.isArray(hand.fingers) && hand.fingers.length === 5;
    },

    /**
     * Zaman damgasını doğrular
     */
    validateTimestamp(timestamp: number): boolean {
        const now = Date.now();
        const oneHourAgo = now - (60 * 60 * 1000);
        const oneHourLater = now + (60 * 60 * 1000);
        
        return timestamp >= oneHourAgo && timestamp <= oneHourLater;
    },

    /**
     * Performans metriklerini doğrular
     */
    validateMetrics(metrics: InstantPerformanceMetrics): boolean {
        return metrics.currentAccuracy >= 0 && metrics.currentAccuracy <= 100 &&
               metrics.reactionTime >= 0 &&
               metrics.movementSmoothness >= 0 && metrics.movementSmoothness <= 100 &&
               metrics.handCoordination >= 0 && metrics.handCoordination <= 100 &&
               metrics.fingerCoordination >= 0 && metrics.fingerCoordination <= 100 &&
               metrics.fatigueIndicator >= 0 && metrics.fatigueIndicator <= 100 &&
               metrics.romUtilization >= 0 && metrics.romUtilization <= 100;
    }
};

/**
 * Veri sıkıştırma ve optimizasyon yardımcıları
 */
export const DataOptimizer = {
    /**
     * Pozisyon verilerini sıkıştırır (hassasiyeti azaltır)
     */
    compressPosition(position: { x: number; y: number; z: number }, precision: number = 3): { x: number; y: number; z: number } {
        return {
            x: Number(position.x.toFixed(precision)),
            y: Number(position.y.toFixed(precision)),
            z: Number(position.z.toFixed(precision))
        };
    },

    /**
     * Log entry'yi optimize eder
     */
    optimizeLogEntry(entry: PositionLogEntry): PositionLogEntry {
        return {
            ...entry,
            hands: {
                left: this.optimizeHandData(entry.hands.left),
                right: this.optimizeHandData(entry.hands.right)
            }
        };
    },

    /**
     * El verilerini optimize eder
     */
    optimizeHandData(hand: HandData): HandData {
        return {
            ...hand,
            position: this.compressPosition(hand.position),
            velocity: this.compressPosition(hand.velocity),
            acceleration: this.compressPosition(hand.acceleration),
            palmCenter: this.compressPosition(hand.palmCenter),
            palmNormal: this.compressPosition(hand.palmNormal),
            fingers: hand.fingers.map(finger => ({
                ...finger,
                joints: {
                    tip: this.compressPosition(finger.joints.tip),
                    pip: this.compressPosition(finger.joints.pip),
                    mcp: this.compressPosition(finger.joints.mcp),
                    cmc: finger.joints.cmc ? this.compressPosition(finger.joints.cmc) : undefined
                },
                flexion: Number(finger.flexion.toFixed(1)),
                extension: Number(finger.extension.toFixed(1)),
                abduction: Number(finger.abduction.toFixed(1)),
                velocity: Number(finger.velocity.toFixed(2))
            }))
        };
    }
};