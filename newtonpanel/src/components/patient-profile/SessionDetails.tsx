// src/components/patient-profile/SessionDetails.tsx
import { Session, GameConfig, GameResult } from '@/types/firebase';
import { GameConfigCard } from './GameConfigCard';
import { GameResultCard } from './GameResultCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface SessionDetailsProps {
  session: Session;
  gameConfig?: GameConfig;
  gameResult?: GameResult;
}

export function SessionDetails({ session, gameConfig, gameResult }: SessionDetailsProps) {
  return (
    <div className="space-y-6">
       <Card>
        <CardHeader>
            <CardTitle>Seans Detayları</CardTitle>
            <CardDescription>{session.date} tarihindeki seansın özeti.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm">
            <p><strong>Cihaz ID:</strong> {session.deviceID}</p>
            <p><strong>Başlangıç:</strong> {session.startTime || "N/A"}</p>
            <p><strong>Bitiş:</strong> {session.endTime || "N/A"}</p>
        </CardContent>
       </Card>

      {gameConfig ? (
        <GameConfigCard config={gameConfig} />
      ) : (
        <Card><CardContent className="p-6 text-muted-foreground">Oyun yapılandırması bulunamadı.</CardContent></Card>
      )}

      {gameResult ? (
        <GameResultCard result={gameResult} />
      ) : (
        <Card><CardContent className="p-6 text-muted-foreground">Oyun sonucu bulunamadı.</CardContent></Card>
      )}
    </div>
  );
}