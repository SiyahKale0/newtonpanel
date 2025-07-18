// src/components/patient-profile/PatientProfilePage.tsx
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Patient, Session, GameConfig, GameResult } from '@/types/firebase';

import { 
  getSessionsByPatientId, 
  getGameConfigsByIds, 
  getGameResultsByIds 
} from '@/services/firebaseServices'; // Bir önceki adımda oluşturduğumuz servisler
import { getPatientById } from '@/services/patientService'; // Bu fonksiyonun projenizde olduğunu varsayıyoruz

import { PatientHeader } from './PatientHeader';
import { SessionList } from './SessionList';
import { SessionDetails } from './SessionDetails';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, AlertTriangle } from 'lucide-react';

interface PatientProfilePageProps {
  patientId: string;
}

export default function PatientProfilePage({ patientId }: PatientProfilePageProps) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [gameConfigs, setGameConfigs] = useState<Record<string, GameConfig>>({});
  const [gameResults, setGameResults] = useState<Record<string, GameResult>>({});
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  useEffect(() => {
    const loadPatientData = async () => {
      if (!patientId) return;
      setLoading(true);
      setError(null);
      try {
        // 1. Hastanın kendi bilgilerini çek
        const patientData = await getPatientById(patientId);
        if (!patientData) {
          throw new Error("Hasta bulunamadı.");
        }
        setPatient(patientData);

        // 2. Hastaya ait seansları çek
        const sessionData = await getSessionsByPatientId(patientId);
        setSessions(sessionData); // Servis zaten sıralı getiriyor

        if (sessionData.length > 0) {
          const configIds = sessionData.map(s => s.gameConfigID).filter(Boolean) as string[];
          
          // 3. Veritabanı yapınıza uygun olarak sonuç ID'lerini oluştur
          const resultIds = sessionData.map(s => {
              const sessionNumber = s.id.split('_').pop();
              return `${s.patientID}_results_${sessionNumber}`;
          });

          // 4. Konfigürasyon ve sonuçları paralel olarak çek
          const [configData, resultData] = await Promise.all([
            getGameConfigsByIds(configIds),
            getGameResultsByIds(resultIds) 
          ]);
          setGameConfigs(configData);
          setGameResults(resultData);
          
          // 5. En yeni seansı (listenin ilk elemanı) varsayılan olarak seç
          setSelectedSessionId(sessionData[0]?.id || null);
        }
      } catch (err: any) {
        setError(err.message || 'Veri yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };
    loadPatientData();
  }, [patientId]);

  // Seçili seansa ait verileri bulan memoized fonksiyon
  const selectedSessionData = useMemo(() => {
    if (!selectedSessionId) return null;

    const session = sessions.find(s => s.id === selectedSessionId);
    if (!session) return null;

    const config = gameConfigs[session.gameConfigID as string];
    
    // Doğru result'ı bulmak için ID'yi tekrar oluştur
    const sessionNumber = session.id.split('_').pop();
    const resultId = `${session.patientID}_results_${sessionNumber}`;
    const result = gameResults[resultId];

    return { session, config, result };
  }, [selectedSessionId, sessions, gameConfigs, gameResults]);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-12 h-12 animate-spin text-primary" /><p className="ml-4">Hasta verileri yükleniyor...</p></div>;
  }

  if (error) {
    return <Card className="bg-destructive/10"><CardContent className="p-6 text-center text-destructive"><AlertTriangle className="mx-auto mb-2" />{error}</CardContent></Card>;
  }

  if (!patient) {
    return <p>Hasta bilgisi bulunamadı.</p>;
  }

  // JSX kısmı aynı kalabilir
  return (
    <div className="space-y-6 p-4 md:p-6">
      <PatientHeader patient={patient} sessionCount={sessions.length} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <SessionList
            sessions={sessions}
            selectedSessionId={selectedSessionId}
            onSessionSelect={setSelectedSessionId}
          />
        </div>
        <div className="lg:col-span-2">
          {selectedSessionData ? (
            <SessionDetails
              session={selectedSessionData.session}
              gameConfig={selectedSessionData.config}
              gameResult={selectedSessionData.result}
            />
          ) : (
            // Eğer seans varsa ama data yüklenemediyse bu mesaj gösterilir.
            sessions.length > 0 && <Card><CardContent className="p-12 text-center text-muted-foreground">İncelemek için bir seans seçin.</CardContent></Card>
          )}
        </div>
      </div>
    </div>
  );
}