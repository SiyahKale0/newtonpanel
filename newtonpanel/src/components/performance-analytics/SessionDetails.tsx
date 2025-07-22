// src/components/performance-analytics/SessionDetails.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from "@/components/ui/badge";
import { Session } from '@/types/firebase';
import { SessionResult } from '@/lib/analytics';
import { History } from 'lucide-react';

interface SessionDetailsProps {
  sessions: Session[];
  gameResults: Record<string, SessionResult>;
}

export const SessionDetails: React.FC<SessionDetailsProps> = ({ sessions, gameResults }) => {
  if (!sessions.length) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <History className="h-5 w-5" />
        Son Seanslar
      </h3>
      {sessions.slice(0, 5).map(session => {
        const sessionNumber = session.id.split('_').pop();
        const resultId = `${session.patientID}_results_${sessionNumber}`;
        const alternativeResultId = `${session.patientID}_result_${sessionNumber}`;
        const sessionResult = gameResults[resultId] || gameResults[alternativeResultId];

        return (
          <Card key={session.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  {new Date(session.date).toLocaleDateString('tr-TR')} - {session.startTime || 'Başlangıç saati yok'}
                </CardTitle>
                <Badge variant="secondary">
                  {session.gameType === 'fingerDance' ? 'Parmak Dansı' : 
                   session.gameType === 'appleGame' ? 'Elma Oyunu' : 
                   session.gameType || 'Bilinmiyor'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {sessionResult?.history && sessionResult.history.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Aktivite Sonuçları:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {sessionResult.history.slice(0, 4).map((item, index) => (
                      <div key={index} className="bg-gray-100 dark:bg-gray-800 rounded p-2 text-center">
                        <div className="text-lg font-bold text-primary">{item.percent}%</div>
                        <div className="text-xs text-muted-foreground truncate">{item.activity}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {sessionResult?.results && sessionResult.results.length > 0 && (
                <div className="mt-3">
                  <h4 className="font-medium text-sm">Oyun Sonuçları:</h4>
                  <div className="text-sm text-muted-foreground">
                    {sessionResult.results.length} oyun tamamlandı. Ortalama Skor: {sessionResult.results.length > 0 ? Math.round(sessionResult.results.reduce((acc, r) => acc + (r.totalScore || 0), 0) / sessionResult.results.length) : 0}%
                  </div>
                </div>
              )}

              {(!sessionResult || (!sessionResult.history?.length && !sessionResult.results?.length)) && (
                <p className="text-sm text-muted-foreground italic">Bu seans için detaylı sonuç verisi bulunmuyor.</p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};