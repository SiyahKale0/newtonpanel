// src/components/performance-analytics/PerformanceAnalysis.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, AlertTriangle, Gamepad2, History } from 'lucide-react';

// Veri tiplerini tanımlayalım
interface GameResult {
    gameType: string;
    score?: number;
    mistakes?: number;
    successRate?: number;
    [key: string]: any; 
}

interface HistoryResult {
    activity: string;
    level: number;
    percent: number;
    timestamp: string;
}

interface SessionResult {
    history?: HistoryResult[];
    results?: GameResult[];
}

interface GameResultsContainer {
    [key: string]: SessionResult;
}

export function PerformanceAnalysis() {
  const [gameResults, setGameResults] = useState<GameResultsContainer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      // JSON verisini doğrudan import ettiğimiz için burada "default" anahtarını kullanıyoruz.
      // @ts-ignore
      const data: { gameResults: GameResultsContainer } = jsonData.default || jsonData;
      setGameResults(data.gameResults);
    } catch (err) {
      setError('Veri yüklenirken bir hata oluştu. Lütfen JSON dosyasının formatını kontrol edin.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-12 h-12 animate-spin text-primary" /><p className="ml-4">Performans verileri yükleniyor...</p></div>;
  }

  if (error) {
    return <Card className="bg-destructive/10"><CardContent className="p-6 text-center text-destructive"><AlertTriangle className="mx-auto mb-2" />{error}</CardContent></Card>;
  }

  if (!gameResults) {
    return <Card><CardContent className="p-12 text-center text-muted-foreground">Oyun sonucu verisi bulunamadı.</CardContent></Card>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Seans Performans Analizi</CardTitle>
          <CardDescription>Her seans içinde oynanan tüm oyunların ve aktivitelerin detayı.</CardDescription>
        </CardHeader>
      </Card>

      {Object.entries(gameResults).map(([sessionId, sessionData]) => (
        <Card key={sessionId}>
          <CardHeader>
            <CardTitle className="text-lg">Seans: {sessionId.replace(/_/g, ' ')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* History Results */}
            {sessionData.history && sessionData.history.length > 0 && (
              <div>
                <h4 className="font-semibold flex items-center gap-2 mb-2"><History className="w-5 h-5 text-primary"/> Aktivite Geçmişi</h4>
                <div className="space-y-2">
                  {sessionData.history.map((item, index) => (
                    <div key={index} className="p-3 border rounded-md bg-gray-50 dark:bg-gray-800/50">
                        <p><strong>Aktivite:</strong> {item.activity}</p>
                        <p><strong>Seviye:</strong> {item.level}</p>
                        <p><strong>Yüzde:</strong> {item.percent}%</p>
                        <p className="text-xs text-muted-foreground">{item.timestamp}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Game Results */}
            {sessionData.results && sessionData.results.length > 0 && (
                <div>
                    <h4 className="font-semibold flex items-center gap-2 mb-2"><Gamepad2 className="w-5 h-5 text-primary"/> Oynanan Oyunlar</h4>
                    <div className="space-y-2">
                        {sessionData.results.map((game, index) => (
                             <div key={index} className="p-3 border rounded-md bg-gray-50 dark:bg-gray-800/50">
                                <p><strong>Oyun Tipi:</strong> {game.gameType}</p>
                                {game.score !== undefined && <p><strong>Skor:</strong> {game.score}</p>}
                                {game.mistakes !== undefined && <p><strong>Hatalar:</strong> {game.mistakes}</p>}
                                {game.successRate !== undefined && <p><strong>Başarı Oranı:</strong> %{game.successRate.toFixed(2)}</p>}
                           </div>
                        ))}
                    </div>
                </div>
            )}

            {!sessionData.history && !sessionData.results && (
                 <p className="text-muted-foreground text-center p-4">Bu seans için gösterilecek veri bulunmuyor.</p>
            )}

          </CardContent>
        </Card>
      ))}
    </div>
  );
}