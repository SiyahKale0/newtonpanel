"use client";

import React, { useEffect, useState } from "react";
import { getPatientById, getAllPatients } from "@/services/patientService";
import { getRomById } from "@/services/romService";
import { getAllSessionsByPatientId_ClientFiltered } from "@/services/sessionService"; 
import ArmMeasurementCard from "@/components/performance-analytics/ArmMeasurementCard";
import FingerProgressTable from "@/components/performance-analytics/FingerProgressTable";
import { Patient, Rom, Session } from "@/types/firebase";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CalendarClock } from "lucide-react";

// --- YARDIMCI BİLEŞENLER ---
const LoadingIndicator = () => (
    <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="ml-4 text-gray-600">Veriler yükleniyor...</p>
    </div>
);

const ErrorCard = ({ message }: { message: string }) => (
    <Card className="m-4 bg-destructive text-destructive-foreground">
        <CardHeader><CardTitle>Bir Hata Oluştu</CardTitle></CardHeader>
        <CardContent><p>{message}</p></CardContent>
    </Card>
);

// --- ANA BİLEŞEN ---
interface PerformanceAnalyticsProps {
  selectedPatientId: string | null;
}

export default function PerformanceAnalytics({ selectedPatientId }: PerformanceAnalyticsProps) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [patientSessions, setPatientSessions] = useState<Session[]>([]);
  const [selectedRom, setSelectedRom] = useState<Rom | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPatientId, setCurrentPatientId] = useState<string | null>(selectedPatientId);

  // 1. Başlangıçta tüm hastaları yükle
  useEffect(() => {
    const fetchAllPatients = async () => {
      try {
        const patients = await getAllPatients();
        setAllPatients(patients);
      } catch (err) {
        setError("Hasta listesi yüklenirken bir sorun oluştu.");
      }
    };
    fetchAllPatients();
  }, []);
  
  // Props'tan gelen ID değişirse state'i güncelle
  useEffect(() => {
    setCurrentPatientId(selectedPatientId);
  }, [selectedPatientId]);

  // 2. Hasta ID'si değiştiğinde, o hastaya ait detayları ve seansları çek
  useEffect(() => {
    if (!currentPatientId) {
      setPatient(null);
      setPatientSessions([]);
      setSelectedRom(null);
      return;
    }
    
    const fetchPatientDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const [patientData, sessionsData] = await Promise.all([
          getPatientById(currentPatientId),
          getAllSessionsByPatientId_ClientFiltered(currentPatientId)
        ]);
        
        if (!patientData) throw new Error("Hasta bulunamadı.");

        const sortedSessions = sessionsData.sort((a, b) => 
            new Date(b.date + 'T' + b.startTime).getTime() - new Date(a.date + 'T' + a.startTime).getTime()
        );

        setPatient(patientData);
        setPatientSessions(sortedSessions);
        setSelectedRom(null);

      } catch (err: any) {
        setError(err.message || "Veriler yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    };
    fetchPatientDetails();
  }, [currentPatientId]);

  // 3. Bir seans seçildiğinde, o seansa ait ROM verisini çek
  const handleSessionChange = async (sessionId: string) => {
    const selectedSession = patientSessions.find(s => s.id === sessionId);
    if (selectedSession && selectedSession.romID) {
      setLoading(true);
      try {
        const romData = await getRomById(selectedSession.romID);
        setSelectedRom(romData);
      } catch (error) {
        setError("ROM verisi alınırken hata oluştu.");
        setSelectedRom(null);
      } finally {
        setLoading(false);
      }
    } else {
      setSelectedRom(null);
    }
  };
  
  // Hata varsa göster
  if (error) {
    return <ErrorCard message={error} />;
  }

  // --- RENDER KISMI ---
  return (
    <div className="space-y-6 p-6">
      {/* HASTA SEÇİMİ KARTI (Her zaman görünür, seçili hasta varsa ismi yazar) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users /> Hasta Seçimi</CardTitle>
          <CardDescription>
            {currentPatientId && patient ? `Seçili Hasta: ${patient.name}` : "Analiz yapmak için bir hasta seçin."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={currentPatientId ?? ""} onValueChange={setCurrentPatientId}>
            <SelectTrigger className="w-full max-w-sm">
              <SelectValue placeholder="Hasta seçin..." />
            </SelectTrigger>
            <SelectContent>
              {allPatients.length > 0 ? (
                allPatients.map(p => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))
              ) : <SelectItem value="loading" disabled>Yükleniyor...</SelectItem>}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Yükleniyorsa animasyon göster */}
      {loading && <LoadingIndicator />}

      {/* Bir hasta seçilmişse ve yükleme bittiyse, SEANS SEÇİMİ KARTINI göster */}
      {currentPatientId && !loading && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CalendarClock /> Seans Seçimi</CardTitle>
            <CardDescription>Analiz etmek istediğiniz seansı seçin. Seanslar en yeni tarihten eskiye doğru sıralanmıştır.</CardDescription>
          </CardHeader>
          <CardContent>
            {patientSessions.length > 0 ? (
              <Select onValueChange={handleSessionChange}>
                <SelectTrigger className="w-full max-w-md"><SelectValue placeholder="Bir seans seçin..." /></SelectTrigger>
                <SelectContent>{patientSessions.map(session => (<SelectItem key={session.id} value={session.id} disabled={!session.romID}>{session.date} {session.startTime} - (Oyun: {session.gameType}) {!session.romID && " - ROM verisi yok"}</SelectItem>))}</SelectContent>
              </Select>
            ) : <p className="text-sm text-gray-500">Bu hasta için kayıtlı seans bulunamadı.</p>}
          </CardContent>
        </Card>
      )}

      {/* Bir seans ve ROM verisi seçilmişse, SONUÇLARI göster */}
      {selectedRom && !loading && (
        <>
          {selectedRom.arm && <ArmMeasurementCard leftSpace={selectedRom.arm.leftSpace} rightSpace={selectedRom.arm.rightSpace} />}
          {selectedRom.finger && (
            <FingerProgressTable fingers={[...selectedRom.finger.leftFingers.map((f, i) => ({ name: `Sol Parmak ${i + 1}`, min: f.min.toString(), max: f.max.toString() })), ...selectedRom.finger.rightFingers.map((f, i) => ({ name: `Sağ Parmak ${i + 1}`, min: f.min.toString(), max: f.max.toString() }))]}/>
          )}
        </>
      )}
    </div>
  );
}