// src/components/performance-analysis/PerformanceAnalysis.tsx
"use client";

import React, { useState, useEffect, useMemo } from 'react';
// Tiplerin doğru yerden import edildiğinden emin olun
import { Patient, Session, GameConfig, GameResult as GameResultType } from '@/types/firebase';

// Gerekli servislerin doğru yerden import edildiğinden emin olun
import {
  getAllPatients,
  getSessionsByPatientId,
  getGameConfigsByIds,
  getGameResultsByIds
} from '@/services/firebaseServices';

// Kullandığınız arayüz bileşenleri
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PatientHeader } from '../components/patient-profile/PatientHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, User, BarChart3, AlertTriangle, History, Gamepad2 } from 'lucide-react';

/**
 * Bir seans sonucunun yapısını tanımlar.
 * Firebase'deki '..._results_1' veya '..._result_1' objelerine karşılık gelir.
 * Bu objeler 'history' (aktivite geçmişi) veya 'results' (oyun sonuçları) dizilerini içerebilir.
 */
export interface SessionResult {
    history?: any[];
    results?: GameResultType[];
}

export default function PerformanceAnalysis() {
  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [gameConfigs, setGameConfigs] = useState<Record<string, GameConfig>>({});
  const [gameResults, setGameResults] = useState<Record<string, SessionResult>>({});

  const [loading, setLoading] = useState(true);
  const [loadingPatientData, setLoadingPatientData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // Başlangıçta tüm hastaları yükler
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        setAllPatients(await getAllPatients());
      } catch (err) {
        console.error("Hastalar yüklenemedi:", err);
        setError('Hastalar yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Seçili hasta değiştiğinde o hastaya ait tüm verileri yükler
  useEffect(() => {
    const loadPatientSpecificData = async () => {
      if (!selectedPatientId) return;

      setLoadingPatientData(true);
      setError(null);
      setSessions([]);
      setGameConfigs({});
      setGameResults({});

      try {
        // 1. Hastanın tüm seanslarını al
        const sessionData = await getSessionsByPatientId(selectedPatientId);
        setSessions(sessionData);

        if (sessionData.length > 0) {
          const configIds = sessionData.map(s => s.gameConfigID).filter(Boolean) as string[];

          // 2. Hem 'result' hem de 'results' formatındaki ID'leri oluştur
          const resultIds = sessionData.flatMap(s => {
              const sessionNumber = s.id.split('_').pop();
              if (!sessionNumber) return [];
              return [
                  `${s.patientID}_result_${sessionNumber}`,  // Örn: ..._result_1
                  `${s.patientID}_results_${sessionNumber}` // Örn: ..._results_1
              ];
          });

          // 3. Konfigürasyonları ve sonuçları paralel olarak çek
          const [configData, resultData] = await Promise.all([
            getGameConfigsByIds(configIds),
            getGameResultsByIds(resultIds) // Bu fonksiyonun SessionResult tipine uygun veri döndürmesi gerekir
          ]);

          setGameConfigs(configData);
          setGameResults(resultData);
        }
      } catch (err: any) {
        console.error("Hasta verileri yüklenemedi:", err);
        setError(err.message || 'Hastanın seans verileri yüklenirken bir hata oluştu.');
      } finally {
        setLoadingPatientData(false);
      }
    };

    loadPatientSpecificData();
  }, [selectedPatientId]);

  const selectedPatient = useMemo(() => allPatients.find(p => p.id === selectedPatientId), [selectedPatientId, allPatients]);

  // Oyun sonucu detaylarını dinamik olarak render eden fonksiyon
  const renderGameResultDetails = (data: object) => {
    return (
        <div className="pl-4 mt-2 space-y-1 text-xs text-gray-700 dark:text-gray-300">
            {Object.entries(data).map(([key, value]) => {
                // 'gameType' zaten başlıkta var, null değerleri gösterme
                if (key === 'gameType' || value === null || value === undefined) return null;

                 if (Array.isArray(value)) {
                    // 'notes' gibi dizileri daha okunaklı göster
                    return (
                        <div key={key}>
                            <strong className="capitalize">{key}:</strong>
                            <div className="pl-4 mt-1 space-y-2">
                                {value.map((item, i) => (
                                     <div key={i} className="text-xs p-2 border-l-2 my-1 bg-gray-100 dark:bg-gray-700/50 rounded-r-md">
                                         {Object.entries(item).map(([k,v]) => <p key={k}><strong className="capitalize">{k}:</strong> {String(v)}</p>)}
                                     </div>
                                ))}
                            </div>
                        </div>
                    )
                 }
                return <p key={key}><strong className="capitalize">{key}:</strong> {String(value)}</p>
            })}
        </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <Card>
        <CardHeader>
            <CardTitle>Performans Analizi</CardTitle>
            <CardDescription>Bir hasta seçerek tüm seanslarının detaylı dökümünü görüntüleyin.</CardDescription>
        </CardHeader>
        <CardContent>
            {loading ? (
                 <div className="flex items-center text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin mr-2" /> Hastalar yükleniyor...</div>
            ) : (
                <div className="flex items-center gap-2">
                    <User className="text-muted-foreground"/>
                    <Select value={selectedPatientId || ""} onValueChange={setSelectedPatientId}>
                        <SelectTrigger className="w-full max-w-sm">
                            <SelectValue placeholder="Analiz için bir hasta seçin..." />
                        </SelectTrigger>
                        <SelectContent>
                            {allPatients.map(patient => (
                                <SelectItem key={patient.id} value={patient.id}>
                                    {patient.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
        </CardContent>
      </Card>

      {error && <Card className="bg-destructive/10"><CardContent className="p-4 text-center text-destructive"><AlertTriangle className="mx-auto mb-2" />{error}</CardContent></Card>}

      {loadingPatientData && (
        <div className="flex justify-center items-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /><p className="ml-4 text-lg text-muted-foreground">Hastanın verileri yükleniyor...</p></div>
      )}

      {selectedPatientId && !loadingPatientData && selectedPatient && (
         <div className="animate-in fade-in-50 space-y-6">
             <PatientHeader patient={selectedPatient} sessionCount={sessions.length} />

             {sessions.length > 0 ? (
                sessions.slice().reverse().map(session => { // Seansları en yeniden en eskiye sırala
                    const sessionNumber = session.id.split('_').pop();
                    const resultId = `${session.patientID}_results_${sessionNumber}`;
                    const alternativeResultId = `${session.patientID}_result_${sessionNumber}`;
                    const sessionResult = gameResults[resultId] || gameResults[alternativeResultId];

                    return (
                        <Card key={session.id}>
                            <CardHeader>
                                <CardTitle className="text-lg">Seans: {session.date} - {session.startTime || 'Başlangıç saati yok'}</CardTitle>
                                <CardDescription>Oynanan Oyun: {session.gameType || 'Bilinmiyor'}</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {sessionResult?.history && sessionResult.history.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold flex items-center gap-2 mb-2"><History className="w-5 h-5 text-primary"/> Aktivite Geçmişi</h4>
                                        <div className="space-y-2">
                                        {sessionResult.history.map((item, index) => (
                                            <div key={index} className="p-3 border rounded-md bg-gray-50 dark:bg-gray-800/50">
                                                <p><strong>Aktivite:</strong> {item.activity}</p>
                                                <p><strong>Seviye:</strong> {item.level}</p>
                                                <p><strong>Başarı:</strong> {item.percent}%</p>
                                                <p className="text-xs text-muted-foreground mt-1">{item.timestamp}</p>
                                            </div>
                                        ))}
                                        </div>
                                    </div>
                                )}

                                {sessionResult?.results && sessionResult.results.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold flex items-center gap-2 mb-2"><Gamepad2 className="w-5 h-5 text-primary"/> Oynanan Oyunların Detayları</h4>
                                        <div className="space-y-3">
                                        {sessionResult.results.map((game, index) => (
                                            <div key={index} className="p-3 border rounded-md bg-gray-50 dark:bg-gray-800/50">
                                                <p className='font-bold text-base mb-2'>Oyun Tipi: {game.gameType}</p>
                                                {renderGameResultDetails(game)}
                                            </div>
                                        ))}
                                        </div>
                                    </div>
                                )}

                                {(!sessionResult || (!sessionResult.history?.length && !sessionResult.results?.length)) && (
                                    <p className="text-muted-foreground text-center p-4">Bu seans için gösterilecek sonuç verisi bulunmuyor.</p>
                                )}
                            </CardContent>
                        </Card>
                    );
                })
             ) : (
                <Card><CardContent className="p-12 text-center text-muted-foreground">Bu hasta için seans bulunamadı.</CardContent></Card>
             )}
         </div>
      )}

      {!selectedPatientId && !loading && !error && (
         <Card><CardContent className="text-center py-20"><BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" /><h3 className="text-lg font-medium">Analize Başlayın</h3><p className="text-muted-foreground">Lütfen yukarıdan bir hasta seçerek analize başlayın.</p></CardContent></Card>
      )}
    </div>
  );
}