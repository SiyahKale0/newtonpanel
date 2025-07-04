# Firebase Şeması ve Oyun Analizi Sistemi - Kullanım Kılavuzu

Bu dokümantasyon, Unity VR rehabilitasyon uygulaması için geliştirilen gelişmiş Firebase şeması ve oyun analizi sisteminin kullanımını açıklar.

## Sistem Özeti

Yeni sistem şu ana bileşenleri içerir:

1. **Gelişmiş Firebase Şeması**: FingerDance oyunu için detaylı veri yapıları
2. **Gerçek Zamanlı Logging**: position_log.json benzeri detaylı oyun kaydı
3. **Performans Analizi**: Seans bazında ve genel ilerleme analizi
4. **ROM Takibi**: Detaylı hareket aralığı izleme ve gelişim takibi
5. **Raporlama Sistemi**: Hasta ilerleme raporları ve öneriler

## Firebase Şeması Değişiklikleri

### Yeni/Güncellenmiş Veri Yapıları

#### FingerDanceConfig (Güncellenmiş)
```typescript
interface FingerDanceConfig {
    gameType: 'fingerDance';
    song: string;
    speed: number;
    targetFingers: number[];
    difficulty: 'easy' | 'medium' | 'hard';  // YENİ
    duration: number;                        // YENİ
    bpm: number;                            // YENİ
    notePattern: string;                    // YENİ
    targetAccuracy: number;                 // YENİ
}
```

#### FingerDanceResult (Büyük Genişletme)
```typescript
interface FingerDanceResult {
    gameType: 'fingerDance';
    combo: number;
    mistakes: number;
    notes: Array<{
        finger: number;
        hit: boolean;
        note: string;
        time: number;
        accuracy: number;        // YENİ: 0-100 doğruluk skoru
        reactionTime: number;    // YENİ: Millisaniye cinsinden tepki süresi
        position: {x, y, z};     // YENİ: Parmak pozisyonu
        velocity: number;        // YENİ: Hareket hızı
    }>;
    performance: {               // YENİ: Detaylı performans metrikleri
        accuracy: number;
        avgReactionTime: number;
        maxCombo: number;
        perfectHits: number;
        goodHits: number;
        missedHits: number;
        totalNotes: number;
        fingerAnalysis: {...};   // Parmak bazında analiz
    };
    timing: {...};               // YENİ: Zaman analizi
    romData: {...};              // YENİ: ROM verileri
}
```

#### ROM (Büyük Genişletme)
```typescript
interface Rom {
    id: string;
    patientID: string;           // YENİ
    createdDate: string;         // YENİ
    lastUpdated: string;         // YENİ
    arm: {
        // Mevcut alanlar korundu
        leftSpace: number;
        rightSpace: number;
        // YENİ: Detaylı kol hareketi verileri
        leftArm: {
            shoulder: {min, max, current, target};
            elbow: {min, max, current, target};
            wrist: {min, max, current, target};
        };
        rightArm: {...};
    };
    finger: {
        // Genişletilmiş parmak verileri
        leftFingers: Array<{
            min, max: number;
            current: number;     // YENİ
            target: number;      // YENİ
            improvement: number; // YENİ
            lastSession: number; // YENİ
        }>;
        rightFingers: Array<{...}>;
        fingerAnalysis: {        // YENİ: Parmak bazında detaylı analiz
            [fingerId]: {
                flexibility: number;
                strength: number;
                coordination: number;
                endurance: number;
                progressTrend: string;
                weeklyImprovement: number;
            };
        };
    };
    overallProgress: {...};      // YENİ: Genel ilerleme metrikleri
    sessionHistory: {...};       // YENİ: Seans bazında geçmiş
}
```

#### Session (Büyük Genişletme)
```typescript
interface Session {
    // Mevcut alanlar korundu
    id: string;
    date: string;
    deviceID: string;
    patientID: string;
    startTime: string;
    endTime: string;
    romID: string;
    gameType?: 'appleGame' | 'fingerDance';
    gameConfigID?: string;
    gameResultID?: string;
    
    // YENİ: Detaylı seans analizi
    analytics: {
        totalDuration: number;
        activeDuration: number;
        pausedDuration: number;
        performanceScore: number;
        improvementScore: number;
        fatigueLevel: number;
        motivationLevel: number;
        difficultyRating: number;
        patientFeedback: string;
        therapistNotes: string;
    };
    
    // YENİ: Gerçek zamanlı veri logging
    realTimeData: {
        heartRate?: {...};
        stressLevel?: {...};
        movementQuality: {
            smoothness: number;
            precision: number;
            consistency: number;
        };
    };
    
    // YENİ: ROM gelişimi
    romProgress: {
        beforeSession: {...};
        afterSession: {...};
        improvements: {...};
        targetProgress: number;
    };
    
    // YENİ: Oyun spesifik veriler
    gameSpecificData?: {
        fingerDance?: {...};
        appleGame?: {...};
    };
}
```

### Yeni Koleksiyonlar

#### positionLogs
Gerçek zamanlı pozisyon verilerini saklar:
```typescript
interface PositionLog {
    id: string;
    sessionID: string;
    gameType: 'appleGame' | 'fingerDance';
    startTime: number;
    endTime: number;
    samplingRate: number;       // Hz cinsinden örnekleme hızı
    data: PositionLogEntry[];   // Frame bazında veri
}

interface PositionLogEntry {
    timestamp: number;
    frameNumber: number;
    hands: {
        left: HandData;         // Detaylı el verisi
        right: HandData;
    };
    gameState: GameState;       // Oyun durumu
    performanceMetrics: InstantPerformanceMetrics; // Anlık performans
}
```

#### performanceAnalyses
Seans bazında performans analizleri:
```typescript
interface PerformanceAnalysis {
    id: string;
    sessionID: string;
    patientID: string;
    analysisDate: string;
    analysisType: 'session' | 'weekly' | 'monthly' | 'progress';
    overallMetrics: {...};      // Genel performans metrikleri
    gameAnalysis: {...};        // Oyun spesifik analiz
    romAnalysis: {...};         // ROM analizi
    trendAnalysis: {...};       // Trend analizi
    recommendations: {...};     // Öneriler
}
```

#### progressReports
Hasta ilerleme raporları:
```typescript
interface PatientProgressReport {
    id: string;
    patientID: string;
    reportDate: string;
    reportPeriod: {
        startDate: string;
        endDate: string;
        totalSessions: number;
    };
    overallProgress: {...};     // Genel ilerleme
    romProgress: {...};         // ROM gelişimi
    gamePerformance: {...};     // Oyun performansı
    recommendations: {...};     // Öneriler ve sonraki adımlar
    chartData: {...};           // Grafik verileri
}
```

## Servis Katmanı

### Yeni Servisler

#### positionLogService.ts
```typescript
// Position log oluşturma
const log = await createPositionLog({
    sessionID: 'session_123',
    gameType: 'fingerDance',
    startTime: Date.now(),
    endTime: 0,
    samplingRate: 90,
    data: []
});

// Gerçek zamanlı veri ekleme
await addPositionLogEntry(log.id, {
    timestamp: Date.now(),
    frameNumber: 150,
    hands: { left: handDataLeft, right: handDataRight },
    gameState: currentGameState,
    performanceMetrics: metrics
});

// Seans bazında logları getirme
const sessionLogs = await getPositionLogsBySession('session_123');

// Özet istatistikler
const summary = await getPositionLogSummary(log.id);
```

#### analyticsService.ts
```typescript
// Seans analizi oluşturma
const analysis = await createSessionAnalysis('session_123');

// Haftalık analiz
const weeklyAnalysis = await createWeeklyAnalysis('patient_456', '2024-01-01');

// İlerleme raporu
const report = await createProgressReport('patient_456', '2024-01-01', '2024-01-31');

// Hasta analizlerini getirme
const analyses = await getAnalysesByPatient('patient_456');
```

### Güncellenmiş Servisler

#### gameResultService.ts (Genişletilmiş)
```typescript
// FingerDance analizi
const analysis = analyzeFingerDanceResult(fingerDanceResult);
// Sonuç: { accuracyStats, fingerEfficiency, timingConsistency, improvementAreas }

// AppleGame analizi  
const analysis = analyzeAppleGameResult(appleGameResult);
// Sonuç: { taskEfficiency, errorAnalysis, speedConsistency, improvementAreas }

// Performans karşılaştırması
const comparison = compareGamePerformance(results, 'fingerDance');
// Sonuç: { averageScore, bestScore, improvementTrend, sessionCount }
```

## Yardımcı Sınıflar ve Utilities

### RealTimeLogger
Gerçek zamanlı veri logging için:
```typescript
import { RealTimeLogger } from '@/utils/loggingUtils';

const logger = new RealTimeLogger('log_123', 100); // 100 frame buffer
logger.startLogging();

// Her frame'de
await logger.logPosition(hands, gameState, performanceMetrics);

// Oyun bitince
await logger.stopLogging();
```

### GameTargetTracker
Oyun hedeflerini takip eder:
```typescript
import { GameTargetTracker } from '@/utils/loggingUtils';

const tracker = new GameTargetTracker();
tracker.addTarget(newTarget);
tracker.hitTarget('target_123', 95); // 95% accuracy

const stats = tracker.getHitStatistics();
// { totalHits, averageAccuracy, averageReactionTime, hitRate }
```

### Data Validation
Veri doğrulama için:
```typescript
import { DataValidator } from '@/utils/loggingUtils';

if (DataValidator.validateHandData(handData)) {
    // Güvenli, veriyi kullan
}

if (DataValidator.validateMetrics(performanceMetrics)) {
    // Metrikler geçerli
}
```

## Unity Entegrasyonu

### FingerDance Oyunu Entegrasyonu
```typescript
import { FingerDanceGameIntegration } from '@/utils/integrationExamples';

// Oyun başlangıcında
const game = new FingerDanceGameIntegration('session_123');
await game.startGame();

// Her frame'de (Unity'den çağrılır)
await game.updateGameFrame({
    hands: { left: unityLeftHand, right: unityRightHand },
    gameState: unityGameState,
    targets: unityTargets
});

// Nota vurulduğunda
game.onNoteHit({
    noteId: 'note_123',
    finger: 2,
    accuracy: 95,
    reactionTime: 250,
    position: { x: 0.5, y: 1.2, z: 0.3 }
});

// Oyun bitince
const resultId = await game.endGame({
    totalNotes: 50,
    combo: 25,
    mistakes: 3,
    score: 850
});
```

### Unity Helper Fonksiyonları
```typescript
import { UnityIntegrationHelpers } from '@/utils/integrationExamples';

// Unity verilerini sisteme uygun formata çevir
const handData = UnityIntegrationHelpers.convertUnityHandData(unityHandData);
const gameState = UnityIntegrationHelpers.convertUnityGameState(unityGameState);

// Sistem verilerini Unity'ye gönderilecek formata çevir
const unityData = UnityIntegrationHelpers.convertToUnityFormat({
    performanceMetrics: metrics,
    recommendations: recommendations,
    analysis: analysis
});
```

## Analiz ve Raporlama Kullanımı

### Seans Analizi
```typescript
import { SessionAnalysisExample } from '@/utils/integrationExamples';

// Seans tamamlandıktan sonra
await SessionAnalysisExample.analyzeCompletedSession('session_123');

// Haftalık rapor
await SessionAnalysisExample.generateWeeklyReport('patient_456');
```

### Gerçek Zamanlı İzleme
```typescript
import { RealTimeMonitoringExample } from '@/utils/integrationExamples';

const monitor = RealTimeMonitoringExample.getInstance();

// İzleme başlat
await monitor.startSessionMonitoring('session_123');

// İzleme durdur
await monitor.stopSessionMonitoring('session_123');

// Aktif seans sayısı
const activeCount = monitor.getActiveSessionCount();
```

## Veri Akışı

### Tipik Oyun Seansı
1. **Seans Başlangıcı**: Session kaydı oluşturulur
2. **Oyun Başlangıcı**: PositionLog başlatılır, RealTimeLogger aktif edilir
3. **Oyun Sırasında**: Her frame'de veri loglanır
4. **Oyun Bitişi**: GameResult kaydedilir, PositionLog tamamlanır
5. **Seans Bitişi**: Session güncellenri, analiz başlatılır
6. **Analiz**: PerformanceAnalysis oluşturulur
7. **Raporlama**: Gerekirse ProgressReport oluşturulur

### Veri Boyutları ve Optimizasyon
- **60 FPS**: Dakikada ~3600 frame
- **Buffer System**: 100 frame'lik gruplar halinde veritabanına gönderim
- **Compression**: Pozisyon verileri 3 decimal hassasiyetle sıkıştırılır
- **Validation**: Her veri giriş öncesi doğrulanır

## Performans Metrikleri

### Anlık Metrikler
- **currentAccuracy**: Mevcut doğruluk (0-100)
- **reactionTime**: Tepki süresi (ms)
- **movementSmoothness**: Hareket akıcılığı (0-100)
- **handCoordination**: El koordinasyonu (0-100)
- **fingerCoordination**: Parmak koordinasyonu (0-100)
- **fatigueIndicator**: Yorgunluk göstergesi (0-100)
- **romUtilization**: ROM kullanım yüzdesi (0-100)

### Seans Metrikleri
- **performanceScore**: Genel performans skoru
- **improvementScore**: Gelişim skoru (önceki seansla karşılaştırma)
- **consistencyScore**: Tutarlılık skoru
- **enduranceScore**: Dayanıklılık skoru
- **motivationScore**: Motivasyon skoru

## Öneriler ve Gelecek Geliştirmeler

### Mevcut Sistem Avantajları
- Detaylı veri toplama ve analiz
- Gerçek zamanlı performans izleme
- Kapsamlı raporlama sistemi
- Unity entegrasyonu için hazır altyapı
- Ölçeklenebilir veri yapısı

### Gelecek Geliştirme Alanları
- Machine Learning entegrasyonu
- Predictive analytics
- Real-time feedback sistemleri
- Advanced visualization
- Multi-patient comparison tools

## Örnek Kullanım Senaryoları

### Senaryo 1: Yeni Hasta Kayıt
```typescript
// 1. Hasta kaydı oluştur
const patient = await createPatient(patientData);

// 2. ROM profili oluştur
const rom = await createOrUpdateRom(patient.id, initialRomData);

// 3. İlk seans planla
const session = await createNewSession('session_001', {
    patientID: patient.id,
    deviceID: 'device_123',
    romID: rom.id,
    date: '2024-01-15',
    startTime: '10:00',
    endTime: '',
});
```

### Senaryo 2: FingerDance Oyunu
```typescript
// 1. Oyun entegrasyonu başlat
const game = new FingerDanceGameIntegration(session.id);
await game.startGame();

// 2. Unity loop'ta her frame
await game.updateGameFrame(unityFrameData);

// 3. Oyun bitişinde
const gameResultId = await game.endGame(finalStats);

// 4. Seans analizi
await SessionAnalysisExample.analyzeCompletedSession(session.id);
```

### Senaryo 3: Haftalık Değerlendirme
```typescript
// 1. Haftalık ilerleme raporu
const report = await createProgressReport(
    patient.id, 
    '2024-01-08', 
    '2024-01-14'
);

// 2. ROM güncellemesi
await updateRom(rom.id, newRomData);

// 3. Oyun zorluğu ayarlaması
const recommendation = report.recommendations.gameSettings;
// { difficulty: 'harder', duration: 'longer', frequency: 'more' }
```

Bu sistem ile VR rehabilitasyon uygulamanız için kapsamlı veri toplama, analiz ve raporlama altyapısı hazır!