// src/components/patient-profile/GameConfigCard.tsx
import { GameConfig } from '@/types/firebase';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Settings, Clock, BarChart, Hand, Target, Music, FastForward, Gamepad2 } from 'lucide-react';

export function GameConfigCard({ config }: { config: GameConfig }) {

 
  const renderConfigDetails = () => {
    
    if (config.gameType === 'appleGame') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center">
            <Gamepad2 className="w-4 h-4 mr-2 text-primary" />
            <strong>Oyun Modu:</strong>
            <span className="ml-2 text-muted-foreground">{config.gameMode}</span>
          </div>
           <div className="flex items-center">
            <BarChart className="w-4 h-4 mr-2 text-primary" />
            <strong>Zorluk:</strong>
            <span className="ml-2 text-muted-foreground">{config.difficulty}</span>
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2 text-primary" />
            <strong>Süre:</strong>
            <span className="ml-2 text-muted-foreground">{config.duration} saniye</span>
          </div>
          <div className="flex items-center">
            <Hand className="w-4 h-4 mr-2 text-primary" />
            <strong>İzin Verilen El:</strong>
            <span className="ml-2 text-muted-foreground">{config.allowedHand}</span>
          </div>
          <div className="flex items-center">
            <Target className="w-4 h-4 mr-2 text-primary" />
            <strong>Maksimum Elma:</strong>
            <span className="ml-2 text-muted-foreground">{config.maxApples}</span>
          </div>
        </div>
      );
    }

    // Tip Koruması: 'fingerDance' için tüm ayarları render et
    if (config.gameType === 'fingerDance') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center">
            <Music className="w-4 h-4 mr-2 text-primary" />
            <strong>Şarkı:</strong>
            <span className="ml-2 text-muted-foreground">{config.song}</span>
          </div>
          <div className="flex items-center">
            <FastForward className="w-4 h-4 mr-2 text-primary" />
            <strong>Hız:</strong>
            <span className="ml-2 text-muted-foreground">{config.speed}x</span>
          </div>
        </div>
      );
    }
    
    // Eğer bilinen bir oyun tipi değilse bir mesaj göster
    return <p className="text-muted-foreground">Bu oyun tipi için yapılandırma detayı bulunamadı.</p>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center"><Settings className="mr-2" /> Oyun Yapılandırması</CardTitle>
      </CardHeader>
      <CardContent>
        {renderConfigDetails()}
      </CardContent>
    </Card>
  );
}