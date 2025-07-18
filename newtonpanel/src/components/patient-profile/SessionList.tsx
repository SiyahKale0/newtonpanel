// src/components/patient-profile/SessionList.tsx
"use client";

import { Session } from '@/types/firebase';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Gamepad2 } from 'lucide-react';

interface SessionListProps {
  sessions: Session[];
  selectedSessionId: string | null;
  onSessionSelect: (id: string) => void;
}

export function SessionList({ sessions, selectedSessionId, onSessionSelect }: SessionListProps) {
  const sortedSessions = [...sessions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Geçmiş Seanslar</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {sortedSessions.length > 0 ? (
          sortedSessions.map(session => (
            <Button
              key={session.id}
              variant={selectedSessionId === session.id ? 'default' : 'outline'}
              className="w-full justify-start h-auto p-3 text-left"
              onClick={() => onSessionSelect(session.id)}
            >
              <div className="flex flex-col">
                <div className="font-semibold flex items-center"><Calendar className="w-4 h-4 mr-2" /> {session.date} - {session.startTime}</div>
                <div className="text-sm text-muted-foreground flex items-center"><Gamepad2 className="w-4 h-4 mr-2" /> {session.gameType}</div>
              </div>
            </Button>
          ))
        ) : (
          <p className="text-muted-foreground text-center p-4">Bu hasta için kayıtlı seans bulunamadı.</p>
        )}
      </CardContent>
    </Card>
  );
}