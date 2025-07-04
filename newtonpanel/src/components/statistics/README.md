# Apple Statistics Chart Component

Bu bileşen, Elma Oyunu (Apple Game) için istatistik grafiklerini Chart.js kullanarak gösterir.

## Kurulum ve Yapılandırma

Gerekli bağımlılıklar zaten yüklü:
- `chart.js`: ^4.5.0
- `react-chartjs-2`: ^5.3.0

## Kullanım

### Temel Kullanım

```tsx
import { AppleStatisticsChart } from '@/components/statistics/AppleStatisticsChart';

function MyComponent() {
  const sessionData = [
    {
      sessionId: "session_1",
      patientId: "patient_1", 
      date: "2024-01-15",
      totalApples: 10,
      applesCollected: 8,
      successRate: 80,
      averageTime: 12.5,
      positionData: []
    }
  ];

  return (
    <AppleStatisticsChart 
      sessionStats={sessionData}
      title="Elma Oyunu İstatistikleri"
      showTabs={true}
    />
  );
}
```

### Utility Fonksiyonları ile Kullanım

```tsx
import { 
  AppleStatisticsChart, 
  parsePositionLogData, 
  calculateSessionStats 
} from '@/components/statistics';

async function loadAndDisplayStats() {
  // position_log.json dosyasından veri yükleme
  const rawPositionData = await fetch('/api/position-logs/session_123.json')
    .then(r => r.json());
  
  // Veriyi parse etme
  const positionData = parsePositionLogData(rawPositionData);
  
  // Oturum istatistiklerini hesaplama
  const sessionStats = calculateSessionStats(
    'session_123',
    'patient_456', 
    '2024-01-15',
    positionData
  );

  return (
    <AppleStatisticsChart 
      sessionStats={[sessionStats]}
      title="Güncel Seans İstatistikleri"
      description="Position log verilerinden hesaplanan performans metrikleri"
    />
  );
}
```

## Prop Türleri

### AppleStatisticsChartProps

```typescript
interface AppleStatisticsChartProps {
  /** Oturum istatistikleri verisi */
  sessionStats: AppleSessionStats[];
  /** Grafik başlığı */
  title?: string;
  /** Grafik açıklaması */
  description?: string;
  /** Grafik yüksekliği (px) */
  height?: number;
  /** Farklı grafik türlerini sekmeler halinde göster */
  showTabs?: boolean;
}
```

### AppleSessionStats

```typescript
interface AppleSessionStats {
  sessionId: string;
  patientId: string;
  date: string;
  totalApples: number;
  applesCollected: number;
  successRate: number;
  averageTime: number;
  positionData: ApplePositionData[];
}
```

### ApplePositionData

```typescript
interface ApplePositionData {
  timestamp: number;
  appleId: number;
  position: {
    x: number;
    y: number;
    z: number;
  };
  status: 'spawned' | 'grabbed' | 'dropped' | 'collected';
  type: 'fresh' | 'rotten';
}
```

## position_log.json Formatı

Bileşen aşağıdaki formatta JSON verilerini bekler:

```json
[
  {
    "timestamp": 1642291200000,
    "appleId": 1,
    "position": {
      "x": 1.2,
      "y": 0.5,
      "z": 2.1
    },
    "status": "spawned",
    "type": "fresh"
  },
  {
    "timestamp": 1642291205000,
    "appleId": 1,
    "position": {
      "x": 0.8,
      "y": 0.3,
      "z": 1.5
    },
    "status": "collected",
    "type": "fresh"
  }
]
```

### Durum Değerleri (status)
- `spawned`: Elma oyun alanında belirdi
- `grabbed`: Elma kavrandı
- `dropped`: Elma bırakıldı
- `collected`: Elma başarıyla toplandı

### Tip Değerleri (type)
- `fresh`: Sağlam elma (toplanması gereken)
- `rotten`: Çürük elma (toplanmaması gereken)

## Grafik Türleri

Bileşen üç farklı grafik türü sunar:

1. **Başarı Oranı**: Zaman içindeki başarı oranı gelişimi (Çizgi grafik)
2. **Elma Toplama**: Toplanan vs toplam elma sayısı (Bar grafik)
3. **Genel Durum**: Başarılı vs kaçırılan elmaların dağılımı (Doughnut grafik)

## Örnek Import Yolları

```typescript
// Sadece ana bileşen
import { AppleStatisticsChart } from '@/components/statistics/AppleStatisticsChart';

// Tüm utilities ile birlikte
import { 
  AppleStatisticsChart,
  parsePositionLogData,
  calculateSessionStats,
  sampleAppleSessionStats
} from '@/components/statistics';

// Tip tanımlamaları
import type { 
  AppleStatisticsChartProps,
  AppleSessionStats,
  ApplePositionData 
} from '@/components/statistics/AppleStatisticsChart';
```

## Performance Analytics Entegrasyonu

Bu bileşen, mevcut performance analytics sistemine entegre edilebilir:

```tsx
// src/components/performance-analytics.tsx içinde
import { AppleStatisticsChart } from "@/components/statistics/AppleStatisticsChart";

export function PerformanceAnalytics({ selectedPatientId }: { selectedPatientId: string | null }) {
  return (
    <div className="space-y-6">
      {/* Mevcut bileşenler */}
      <PerformanceFilter selectedPatientId={selectedPatientId} />
      
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="detailed">Detaylı Analiz</TabsTrigger>
          <TabsTrigger value="progress">İlerleme Takibi</TabsTrigger>
          <TabsTrigger value="apple-game">Elma Oyunu</TabsTrigger>
        </TabsList>

        {/* Yeni Apple Game sekmesi */}
        <TabsContent value="apple-game" className="space-y-6">
          <AppleStatisticsChart 
            sessionStats={appleGameSessionData}
            title="Elma Oyunu İstatistikleri"
            description="Position tracking ve performans verileri"
            showTabs={true}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

## Chart.js Konfigürasyonu

Bileşen otomatik olarak Chart.js'i yapılandırır. Gerekli Chart.js bileşenleri:
- CategoryScale
- LinearScale  
- PointElement
- LineElement
- BarElement
- ArcElement
- Title, Tooltip, Legend

Bu bileşenler bileşen içinde otomatik olarak register edilir.