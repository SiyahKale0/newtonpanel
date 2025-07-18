// src/components/patient-profile/GameResultCard.tsx
import { GameResult } from '@/types/firebase';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Trophy, Activity, CheckCircle, Percent } from 'lucide-react';

// Gelen 'history' objesinin tipini daha belirgin hale getiriyoruz
interface HistoryEvent {
  activity: string;
  level: number;
  percent: number;
  timestamp: string;
}

export function GameResultCard({ result }: { result: GameResult }) {
  
  const renderResultDetails = () => {
    // 1. TypeScript'e 'result' nesnesinde 'history' anahtarının olup olmadığını kontrol ettiriyoruz.
    // 2. 'Array.isArray' ile 'history'nin bir dizi olduğunu doğruluyoruz.
    // 3. Dizinin boş olmadığını kontrol ediyoruz.
    if ('history' in result && Array.isArray(result.history) && result.history.length > 0) {
      
      // Tip güvenliği sağlandıktan sonra sonuca erişiyoruz.
      const lastEvent: HistoryEvent = result.history[result.history.length - 1];
      
      return (
        <div className="space-y-3">
          <div className="flex items-center">
            <Activity className="w-4 h-4 mr-3 text-primary" />
            <div>
              <strong>Son Aktivite:</strong>
              <p className="text-muted-foreground">{lastEvent.activity || "Belirtilmemiş"}</p>
            </div>
          </div>
          <div className="flex items-center">
            <Percent className="w-4 h-4 mr-3 text-primary" />
            <div>
              <strong>Başarı Yüzdesi:</strong>
              <p className="text-muted-foreground">{lastEvent.percent.toFixed(0)}%</p>
            </div>
          </div>
           <div className="flex items-center">
            <CheckCircle className="w-4 h-4 mr-3 text-primary" />
            <div>
              <strong>Seviye:</strong>
              <p className="text-muted-foreground">{lastEvent.level}</p>
            </div>
          </div>
        </div>
      );
    }
    
    // Eğer 'history' verisi yoksa veya formatı uygun değilse gösterilecek mesaj.
    return <p className="text-muted-foreground text-center p-4">Bu seans için detaylı oyun sonucu verisi bulunamadı.</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center"><Trophy className="mr-2" /> Oyun Sonuçları</CardTitle>
      </CardHeader>
      <CardContent>
        {renderResultDetails()}
      </CardContent>
    </Card>
  );
}