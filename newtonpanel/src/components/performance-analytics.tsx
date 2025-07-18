// src/components/performance-analysis/PerformanceAnalysis.tsx
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Patient, Session, GameConfig, GameResult } from '@/types/firebase';

// Yeni oluşturulan servisleri import ediyoruz
import { 
  getAllPatients, 
  getSessionsByPatientId, 
  getGameConfigsByIds, 
  getGameResultsByIds 
} from '@/services/firebaseServices'; 

// Alt Bileşenler
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PatientHeader } from '../components/patient-profile/PatientHeader';
import { SessionList } from '../components/patient-profile/SessionList';
import { SessionDetails } from '../components/patient-profile/SessionDetails';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, User, BarChart3, AlertTriangle } from 'lucide-react';

export default function PerformanceAnalysis() {
  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [gameConfigs, setGameConfigs] = useState<Record<string, GameConfig>>({});
  const [gameResults, setGameResults] = useState<Record<string, GameResult>>({});
  
  const [loading, setLoading] = useState(true);
  const [loadingPatientData, setLoadingPatientData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        setAllPatients(await getAllPatients());
      } catch (err) { setError('Hastalar yüklenirken bir hata oluştu.'); } 
      finally { setLoading(false); }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const loadPatientSpecificData = async () => {
      if (!selectedPatientId) return;

      setLoadingPatientData(true);
      setError(null);
      setSessions([]);
      setGameConfigs({});
      setGameResults({});
      setSelectedSessionId(null);

      try {
        const sessionData = await getSessionsByPatientId(selectedPatientId);
        setSessions(sessionData);

        if (sessionData.length > 0) {
          const configIds = sessionData.map(s => s.gameConfigID).filter(Boolean) as string[];
          
          // Veritabanı yapınıza göre result ID'lerini oluşturuyoruz
          const resultIds = sessionData.map(s => {
              const sessionNumber = s.id.split('_').pop();
              return `${s.patientID}_results_${sessionNumber}`;
          }).filter(Boolean);

          const [configData, resultData] = await Promise.all([
            getGameConfigsByIds(configIds),
            getGameResultsByIds(resultIds) 
          ]);
          
          setGameConfigs(configData);
          setGameResults(resultData);
          
          // En yeni seansı varsayılan olarak seç
          setSelectedSessionId(sessionData[0]?.id || null);
        }
      } catch (err: any) {
        setError(err.message || 'Hastanın seans verileri yüklenirken bir hata oluştu.');
      } finally {
        setLoadingPatientData(false);
      }
    };
    
    loadPatientSpecificData();
  }, [selectedPatientId]);
  
  const selectedPatient = useMemo(() => allPatients.find(p => p.id === selectedPatientId), [selectedPatientId, allPatients]);

  const selectedData = useMemo(() => {
    if (!selectedSessionId) return null;

    const session = sessions.find(s => s.id === selectedSessionId);
    if (!session) return null;

    const config = gameConfigs[session.gameConfigID as string];
    
    // Doğru result'ı bulmak için ID'yi tekrar oluşturuyoruz
    const sessionNumber = session.id.split('_').pop();
    const resultId = `${session.patientID}_results_${sessionNumber}`;
    const result = gameResults[resultId];

    return { session, config, result };
  }, [selectedSessionId, sessions, gameConfigs, gameResults]);

  // Geri kalan JSX kısmı önceki cevaptaki ile aynı kalabilir.
  // ... (JSX kodunu buraya ekleyin)
  return (
    <div className="space-y-6 p-4 md:p-6 bg-gray-50 min-h-screen">
      <Card>
        <CardHeader>
            <CardTitle>Performans Analizi</CardTitle>
        </CardHeader>
        <CardContent>
            {loading ? (
                 <div className="flex items-center"><Loader2 className="w-5 h-5 animate-spin mr-2" /> Hastalar yükleniyor...</div>
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

      {selectedPatientId && !loadingPatientData && selectedPatient && (
         <div className="animate-in fade-in-50">
             <PatientHeader patient={selectedPatient} sessionCount={sessions.length} />
             
             <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <SessionList
                        sessions={sessions}
                        selectedSessionId={selectedSessionId}
                        onSessionSelect={setSelectedSessionId}
                    />
                </div>
                <div className="lg:col-span-2">
                    {selectedData ? (
                        <SessionDetails
                            session={selectedData.session}
                            gameConfig={selectedData.config}
                            gameResult={selectedData.result}
                        />
                    ) : (
                       sessions.length > 0 && <Card><CardContent className="p-12 text-center text-muted-foreground">İncelemek için bir seans seçin.</CardContent></Card>
                    )}
                </div>
             </div>
         </div>
      )}
      
      {loadingPatientData && (
        <div className="flex justify-center items-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /><p className="ml-4 text-lg text-muted-foreground">Hastanın verileri yükleniyor...</p></div>
      )}

      {!selectedPatientId && !loading && (
         <Card><CardContent className="text-center py-20"><BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" /><h3 className="text-lg font-medium">Analize Başlayın</h3><p className="text-muted-foreground">Lütfen yukarıdan bir hasta seçerek analize başlayın.</p></CardContent></Card>
      )}
    </div>
  );
}