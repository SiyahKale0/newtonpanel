// src/utils/integrationExamples.ts

import { 
    RealTimeLogger, 
    GameTargetTracker, 
    normalizeHandData, 
    calculateInstantPerformanceMetrics,
    DataValidator 
} from './loggingUtils';
import { createPositionLog } from '@/services/positionLogService';
import { createSessionAnalysis, createProgressReport } from '@/services/analyticsService';
import { createGameResult, analyzeFingerDanceResult } from '@/services/gameResultService';
import { FingerDanceResult, PositionLog, GameTarget, HandData, GameState } from '@/types/firebase';

/**
 * FingerDance oyunu için entegrasyon örneği
 */
export class FingerDanceGameIntegration {
    private logger: RealTimeLogger | null = null;
    private targetTracker: GameTargetTracker = new GameTargetTracker();
    private sessionId: string;
    private gameStartTime: number = 0;
    private currentLogId: string | null = null;

    constructor(sessionId: string) {
        this.sessionId = sessionId;
    }

    /**
     * Oyunu başlatır ve logging'i aktifleştirir
     */
    async startGame(): Promise<void> {
        this.gameStartTime = Date.now();
        
        // Position log oluştur
        const positionLog: Omit<PositionLog, 'id'> = {
            sessionID: this.sessionId,
            gameType: 'fingerDance',
            startTime: this.gameStartTime,
            endTime: 0,
            samplingRate: 90, // 90 FPS
            data: []
        };

        const createdLog = await createPositionLog(positionLog);
        this.currentLogId = createdLog.id;

        // Real-time logger'ı başlat
        this.logger = new RealTimeLogger(createdLog.id, 50);
        this.logger.startLogging();

        // Target tracker'ı sıfırla
        this.targetTracker.reset();

        console.log(`FingerDance oyunu başlatıldı. Session: ${this.sessionId}, Log: ${createdLog.id}`);
    }

    /**
     * Oyun frame'i güncellemesi (Unity'den çağrılır)
     * @param unityData Unity'den gelen ham veri
     */
    async updateGameFrame(unityData: {
        hands: { left: any; right: any };
        gameState: {
            score: number;
            combo: number;
            activeNotes: any[];
            timeRemaining: number;
            isPaused: boolean;
        };
        targets: any[];
    }): Promise<void> {
        if (!this.logger || !this.logger.isCurrentlyLogging()) return;

        try {
            // Unity verilerini normalize et
            const hands = {
                left: normalizeHandData(unityData.hands.left),
                right: normalizeHandData(unityData.hands.right)
            };

            // Validate data
            if (!DataValidator.validateHandData(hands.left) || !DataValidator.validateHandData(hands.right)) {
                console.warn('Invalid hand data detected, skipping frame');
                return;
            }

            // Game state'i oluştur
            const gameState: GameState = {
                currentScore: unityData.gameState.score,
                currentLevel: 1,
                activeTargets: this.convertUnityTargets(unityData.targets),
                timeRemaining: unityData.gameState.timeRemaining,
                combo: unityData.gameState.combo,
                mistakes: 0,
                isPaused: unityData.gameState.isPaused,
                gamePhase: unityData.gameState.timeRemaining > 0 ? 'active' : 'finished'
            };

            // Performance metrics hesapla
            const performanceMetrics = calculateInstantPerformanceMetrics(hands, gameState);

            // Validate metrics
            if (!DataValidator.validateMetrics(performanceMetrics)) {
                console.warn('Invalid performance metrics, using default values');
                return;
            }

            // Log position
            await this.logger.logPosition(hands, gameState, performanceMetrics);

        } catch (error) {
            console.error('Frame update hatası:', error);
        }
    }

    /**
     * Nota vurulduğunda çağrılır
     * @param noteData Vurulan nota verisi
     */
    onNoteHit(noteData: {
        noteId: string;
        finger: number;
        accuracy: number;
        reactionTime: number;
        position: { x: number; y: number; z: number };
    }): void {
        this.targetTracker.hitTarget(noteData.noteId, noteData.accuracy);
        
        console.log(`Nota vuruldu: Parmak ${noteData.finger}, Doğruluk: ${noteData.accuracy}%`);
    }

    /**
     * Oyunu bitirir ve sonuçları kaydeder
     */
    async endGame(finalGameData: {
        totalNotes: number;
        combo: number;
        mistakes: number;
        score: number;
    }): Promise<string> {
        const gameEndTime = Date.now();

        // Logger'ı durdur
        if (this.logger) {
            await this.logger.stopLogging();
        }

        // Hit statistics al
        const hitStats = this.targetTracker.getHitStatistics();

        // FingerDance result oluştur
        const fingerDanceResult: Omit<FingerDanceResult, 'id'> = {
            gameType: 'fingerDance',
            score: finalGameData.score,
            sessionID: this.sessionId,
            combo: finalGameData.combo,
            mistakes: finalGameData.mistakes,
            notes: [], // Bu normalde oyun sırasında doldurulur
            performance: {
                accuracy: hitStats.averageAccuracy,
                avgReactionTime: hitStats.averageReactionTime,
                maxCombo: finalGameData.combo,
                perfectHits: Math.floor(hitStats.totalHits * 0.3), // Örnek değer
                goodHits: Math.floor(hitStats.totalHits * 0.5),
                missedHits: finalGameData.totalNotes - hitStats.totalHits,
                totalNotes: finalGameData.totalNotes,
                fingerAnalysis: this.generateFingerAnalysis()
            },
            timing: {
                gameStartTime: this.gameStartTime,
                gameEndTime: gameEndTime,
                pausedDuration: 0,
                activeDuration: gameEndTime - this.gameStartTime
            },
            romData: {
                fingerRanges: {},
                armMovement: {
                    leftArm: { minX: 0, maxX: 0, minY: 0, maxY: 0, minZ: 0, maxZ: 0 },
                    rightArm: { minX: 0, maxX: 0, minY: 0, maxY: 0, minZ: 0, maxZ: 0 }
                }
            }
        };

        // Game result'ı kaydet
        const savedResult = await createGameResult(fingerDanceResult);

        // Analiz yap
        const analysis = analyzeFingerDanceResult(savedResult as FingerDanceResult);
        console.log('Oyun analizi:', analysis);

        console.log(`FingerDance oyunu tamamlandı. Skor: ${finalGameData.score}`);
        return savedResult.id;
    }

    /**
     * Unity target'larını GameTarget formatına dönüştür
     */
    private convertUnityTargets(unityTargets: any[]): GameTarget[] {
        return unityTargets.map(target => ({
            id: target.id || `target_${Date.now()}_${Math.random()}`,
            type: 'note',
            position: target.position || { x: 0, y: 0, z: 0 },
            targetFinger: target.targetFinger || 0,
            targetHand: target.targetHand || 'right',
            spawnTime: target.spawnTime || Date.now(),
            hitTime: target.hitTime,
            isHit: target.isHit || false,
            accuracy: target.accuracy
        }));
    }

    /**
     * Parmak analizi oluştur (örnek veri)
     */
    private generateFingerAnalysis(): { [fingerId: number]: any } {
        const analysis: { [fingerId: number]: any } = {};
        
        for (let i = 0; i < 5; i++) {
            analysis[i] = {
                hits: Math.floor(Math.random() * 20),
                misses: Math.floor(Math.random() * 5),
                avgAccuracy: 70 + Math.random() * 30,
                avgReactionTime: 200 + Math.random() * 300
            };
        }
        
        return analysis;
    }
}

/**
 * Seans analizi için örnek kullanım
 */
export class SessionAnalysisExample {
    /**
     * Seans tamamlandıktan sonra analiz yapar
     */
    static async analyzeCompletedSession(sessionId: string): Promise<void> {
        try {
            console.log(`Seans analizi başlatılıyor: ${sessionId}`);
            
            // Performans analizi oluştur
            const analysis = await createSessionAnalysis(sessionId);
            console.log('Performans analizi tamamlandı:', analysis.id);
            
            // Önerileri yazdır
            console.log('Oyun ayar önerileri:', analysis.recommendations.gameSettings);
            console.log('Terapi odak alanları:', analysis.recommendations.therapyFocus);
            console.log('Sonraki seans hedefleri:', analysis.recommendations.nextSessionGoals);
            
        } catch (error) {
            console.error('Seans analizi hatası:', error);
        }
    }

    /**
     * Haftalık ilerleme raporu oluşturur
     */
    static async generateWeeklyReport(patientId: string): Promise<void> {
        try {
            const weekStart = new Date();
            weekStart.setDate(weekStart.getDate() - 7);
            const weekStartStr = weekStart.toISOString().split('T')[0];
            
            const endDate = new Date().toISOString().split('T')[0];
            
            console.log(`Haftalık rapor oluşturuluyor: ${patientId} (${weekStartStr} - ${endDate})`);
            
            const report = await createProgressReport(patientId, weekStartStr, endDate);
            console.log('Haftalık rapor tamamlandı:', report.id);
            
            // Rapor özetini yazdır
            console.log('Genel ilerleme:', report.overallProgress);
            console.log('Öneriler:', report.recommendations);
            
        } catch (error) {
            console.error('Haftalık rapor hatası:', error);
        }
    }
}

/**
 * Gerçek zamanlı izleme için örnek
 */
export class RealTimeMonitoringExample {
    private static instance: RealTimeMonitoringExample;
    private activeLoggers: Map<string, RealTimeLogger> = new Map();

    static getInstance(): RealTimeMonitoringExample {
        if (!RealTimeMonitoringExample.instance) {
            RealTimeMonitoringExample.instance = new RealTimeMonitoringExample();
        }
        return RealTimeMonitoringExample.instance;
    }

    /**
     * Yeni bir seans için izleme başlatır
     */
    async startSessionMonitoring(sessionId: string): Promise<void> {
        console.log(`Gerçek zamanlı izleme başlatılıyor: ${sessionId}`);
        
        // Position log oluştur
        const positionLog: Omit<PositionLog, 'id'> = {
            sessionID: sessionId,
            gameType: 'fingerDance', // Varsayılan olarak
            startTime: Date.now(),
            endTime: 0,
            samplingRate: 60,
            data: []
        };

        const createdLog = await createPositionLog(positionLog);
        const logger = new RealTimeLogger(createdLog.id, 100);
        
        this.activeLoggers.set(sessionId, logger);
        logger.startLogging();
        
        console.log(`İzleme aktif: ${sessionId} -> ${createdLog.id}`);
    }

    /**
     * Seans izlemesini durdurur
     */
    async stopSessionMonitoring(sessionId: string): Promise<void> {
        const logger = this.activeLoggers.get(sessionId);
        if (logger) {
            await logger.stopLogging();
            this.activeLoggers.delete(sessionId);
            console.log(`İzleme durduruldu: ${sessionId}`);
        }
    }

    /**
     * Tüm aktif izlemeleri durdurur
     */
    async stopAllMonitoring(): Promise<void> {
        const promises = Array.from(this.activeLoggers.keys()).map(sessionId => 
            this.stopSessionMonitoring(sessionId)
        );
        await Promise.all(promises);
        console.log('Tüm izlemeler durduruldu');
    }

    /**
     * Aktif seans sayısını döndürür
     */
    getActiveSessionCount(): number {
        return this.activeLoggers.size;
    }
}

/**
 * Unity entegrasyonu için yardımcı fonksiyonlar
 */
export const UnityIntegrationHelpers = {
    /**
     * Unity'den gelen ham hand data'yı sisteme uygun formata çevirir
     */
    convertUnityHandData(unityHandData: any): HandData {
        return normalizeHandData({
            isTracked: unityHandData.IsTracked,
            position: {
                x: unityHandData.Position?.x || 0,
                y: unityHandData.Position?.y || 0,
                z: unityHandData.Position?.z || 0
            },
            rotation: {
                x: unityHandData.Rotation?.x || 0,
                y: unityHandData.Rotation?.y || 0,
                z: unityHandData.Rotation?.z || 0,
                w: unityHandData.Rotation?.w || 1
            },
            velocity: {
                x: unityHandData.Velocity?.x || 0,
                y: unityHandData.Velocity?.y || 0,
                z: unityHandData.Velocity?.z || 0
            },
            acceleration: {
                x: unityHandData.Acceleration?.x || 0,
                y: unityHandData.Acceleration?.y || 0,
                z: unityHandData.Acceleration?.z || 0
            },
            fingers: unityHandData.Fingers?.map((finger: any, index: number) => ({
                fingerId: index,
                isExtended: finger.IsExtended,
                joints: {
                    tip: finger.Joints?.Tip || { x: 0, y: 0, z: 0 },
                    pip: finger.Joints?.PIP || { x: 0, y: 0, z: 0 },
                    mcp: finger.Joints?.MCP || { x: 0, y: 0, z: 0 },
                    cmc: index === 0 ? finger.Joints?.CMC : undefined
                },
                flexion: finger.Flexion || 0,
                extension: finger.Extension || 0,
                abduction: finger.Abduction || 0,
                velocity: finger.Velocity || 0,
                isActive: finger.IsActive || false
            })) || [],
            palmCenter: unityHandData.PalmCenter || { x: 0, y: 0, z: 0 },
            palmNormal: unityHandData.PalmNormal || { x: 0, y: 1, z: 0 },
            confidence: unityHandData.Confidence || 0
        });
    },

    /**
     * Unity oyun durumunu sisteme uygun formata çevirir
     */
    convertUnityGameState(unityGameState: any): GameState {
        return {
            currentScore: unityGameState.CurrentScore || 0,
            currentLevel: unityGameState.CurrentLevel || 1,
            activeTargets: unityGameState.ActiveTargets?.map((target: any) => ({
                id: target.Id,
                type: target.Type || 'note',
                position: target.Position || { x: 0, y: 0, z: 0 },
                targetFinger: target.TargetFinger,
                targetHand: target.TargetHand,
                spawnTime: target.SpawnTime,
                hitTime: target.HitTime,
                isHit: target.IsHit || false,
                accuracy: target.Accuracy
            })) || [],
            timeRemaining: unityGameState.TimeRemaining || 0,
            combo: unityGameState.Combo || 0,
            mistakes: unityGameState.Mistakes || 0,
            isPaused: unityGameState.IsPaused || false,
            gamePhase: unityGameState.GamePhase || 'active'
        };
    },

    /**
     * Sistem verilerini Unity'ye gönderilecek formata çevirir
     */
    convertToUnityFormat(systemData: {
        performanceMetrics: any;
        recommendations: any;
        analysis: any;
    }): any {
        return {
            PerformanceMetrics: {
                CurrentAccuracy: systemData.performanceMetrics.currentAccuracy,
                ReactionTime: systemData.performanceMetrics.reactionTime,
                MovementSmoothness: systemData.performanceMetrics.movementSmoothness,
                HandCoordination: systemData.performanceMetrics.handCoordination,
                FingerCoordination: systemData.performanceMetrics.fingerCoordination,
                FatigueIndicator: systemData.performanceMetrics.fatigueIndicator,
                RomUtilization: systemData.performanceMetrics.romUtilization
            },
            Recommendations: {
                Difficulty: systemData.recommendations?.gameSettings?.difficulty,
                Duration: systemData.recommendations?.gameSettings?.duration,
                TherapyFocus: systemData.recommendations?.therapyFocus || [],
                NextGoals: systemData.recommendations?.nextSessionGoals || []
            },
            Analysis: systemData.analysis
        };
    }
};

/**
 * Test ve demo verileri oluşturmak için yardımcı
 */
export const DemoDataGenerator = {
    /**
     * Demo hand data oluşturur
     */
    generateDemoHandData(): { left: HandData; right: HandData } {
        const generateRandomPosition = () => ({
            x: (Math.random() - 0.5) * 2,
            y: Math.random() * 2,
            z: (Math.random() - 0.5) * 2
        });

        const generateRandomFingers = (): any[] => {
            return Array.from({ length: 5 }, (_, index) => ({
                fingerId: index,
                isExtended: Math.random() > 0.5,
                joints: {
                    tip: generateRandomPosition(),
                    pip: generateRandomPosition(),
                    mcp: generateRandomPosition(),
                    cmc: index === 0 ? generateRandomPosition() : undefined
                },
                flexion: Math.random() * 180,
                extension: Math.random() * 90,
                abduction: Math.random() * 45,
                velocity: Math.random() * 2,
                isActive: Math.random() > 0.3
            }));
        };

        return {
            left: normalizeHandData({
                isTracked: true,
                position: generateRandomPosition(),
                rotation: { x: 0, y: 0, z: 0, w: 1 },
                velocity: generateRandomPosition(),
                acceleration: generateRandomPosition(),
                fingers: generateRandomFingers(),
                palmCenter: generateRandomPosition(),
                palmNormal: { x: 0, y: 1, z: 0 },
                confidence: 0.8 + Math.random() * 0.2
            }),
            right: normalizeHandData({
                isTracked: true,
                position: generateRandomPosition(),
                rotation: { x: 0, y: 0, z: 0, w: 1 },
                velocity: generateRandomPosition(),
                acceleration: generateRandomPosition(),
                fingers: generateRandomFingers(),
                palmCenter: generateRandomPosition(),
                palmNormal: { x: 0, y: 1, z: 0 },
                confidence: 0.8 + Math.random() * 0.2
            })
        };
    },

    /**
     * Demo game state oluşturur
     */
    generateDemoGameState(): GameState {
        return {
            currentScore: Math.floor(Math.random() * 1000),
            currentLevel: Math.floor(Math.random() * 5) + 1,
            activeTargets: Array.from({ length: Math.floor(Math.random() * 5) }, (_, i) => ({
                id: `target_${i}`,
                type: 'note' as const,
                position: {
                    x: (Math.random() - 0.5) * 4,
                    y: Math.random() * 3,
                    z: (Math.random() - 0.5) * 2
                },
                targetFinger: Math.floor(Math.random() * 5),
                targetHand: Math.random() > 0.5 ? 'left' : 'right',
                spawnTime: Date.now() - Math.random() * 2000,
                isHit: false
            })),
            timeRemaining: Math.random() * 120,
            combo: Math.floor(Math.random() * 50),
            mistakes: Math.floor(Math.random() * 10),
            isPaused: false,
            gamePhase: 'active' as const
        };
    }
};