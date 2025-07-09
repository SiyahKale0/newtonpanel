// src/components/performance-analytics.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get } from 'firebase/database';
import { Patient, Session, Rom } from '@/types/firebase';
import PatientSelector from './performance-analytics/PatientSelector';
import SessionSelector from './performance-analytics/SessionSelector';
import ArmMeasurementCard from './performance-analytics/ArmMeasurementCard';
import FingerProgressTable from './performance-analytics/FingerProgressTable';

export default function PerformanceAnalytics() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [roms, setRoms] = useState<Rom[]>([]);

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [selectedRom, setSelectedRom] = useState<Rom | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const db = getDatabase();
    const fetchData = async () => {
      setLoading(true);
      try {
        const patientsSnapshot = await get(ref(db, 'patients'));
        const sessionsSnapshot = await get(ref(db, 'sessions'));
        const romsSnapshot = await get(ref(db, 'roms'));

        if (patientsSnapshot.exists()) {
          const patientsData = patientsSnapshot.val();
          setPatients(Object.keys(patientsData).map(key => ({ id: key, ...patientsData[key] })));
        }
        if (sessionsSnapshot.exists()) {
          const sessionsData = sessionsSnapshot.val();
          setSessions(Object.keys(sessionsData).map(key => ({ id: key, ...sessionsData[key] })));
        }
        if (romsSnapshot.exists()) {
          const romsData = romsSnapshot.val();
          setRoms(Object.keys(romsData).map(key => ({ id: key, ...romsData[key] })));
        }
      } catch (err) {
        setError('Veriler yüklenirken bir hata oluştu.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handlePatientChange = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId) || null;
    setSelectedPatient(patient);
    setSelectedSession(null); // Hasta değiştiğinde seans seçimini sıfırla
    setSelectedRom(null); // Hasta değiştiğinde ROM seçimini sıfırla
  };

  const handleSessionChange = (sessionId: string) => {
    setLoading(true);
    const session = sessions.find(s => s.id === sessionId) || null;
    setSelectedSession(session);

    if (session && session.romID) {
      const rom = roms.find(r => r.id === session.romID) || null;
      setSelectedRom(rom);
    } else {
      setSelectedRom(null);
    }
    setLoading(false);
  };
  
  const patientSessions = selectedPatient ? sessions.filter(s => s.patientID === selectedPatient.id) : [];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Performans Analizi</h1>
      
      {error && <p className="text-red-500">{error}</p>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <PatientSelector patients={patients} onSelect={handlePatientChange} />
        {selectedPatient && (
          <SessionSelector sessions={patientSessions} onSelect={handleSessionChange} />
        )}
      </div>

      {loading && <p>Yükleniyor...</p>}

      {selectedSession && !selectedRom && !loading && (
        <p className="text-center text-gray-500 mt-8">Bu seans için ROM verisi bulunamadı.</p>
      )}

      {/* Bir seans ve ROM verisi seçilmişse, SONUÇLARI göster */}
      {selectedRom && !loading && (
        <div className="space-y-6">
          {selectedRom.arm && <ArmMeasurementCard leftSpace={selectedRom.arm.leftSpace} rightSpace={selectedRom.arm.rightSpace} />}
          
          {selectedRom.finger && (
            <FingerProgressTable fingers={
              // Gelen 'finger' verisinin dizi olup olmadığını kontrol et
              Array.isArray(selectedRom.finger)
                // Eğer dizi ise, her bir parmağı isimlendirerek yeni bir dizi oluştur
                ? selectedRom.finger.map((f, i) => ({ 
                    name: `Parmak ${i + 1}`, 
                    // Değerler 0-1 arasındaysa 100 ile çarp, değilse doğrudan kullan
                    min: (Number(f.min) < 2 ? (Number(f.min) * 100).toFixed(0) : Number(f.min).toString()),
                    max: (Number(f.max) < 2 ? (Number(f.max) * 100).toFixed(0) : Number(f.max).toString())
                  }))
                // Eğer dizi değilse (eski yapıdaysa), 'leftFingers' ve 'rightFingers' dizilerini birleştir
                : [
                    ...(selectedRom.finger.leftFingers || []).map((f, i) => ({ name: `Sol Parmak ${i + 1}`, min: f.min.toString(), max: f.max.toString() })),
                    ...(selectedRom.finger.rightFingers || []).map((f, i) => ({ name: `Sağ Parmak ${i + 1}`, min: f.min.toString(), max: f.max.toString() }))
                  ]
            }/>
          )}
        </div>
      )}
    </div>
  );
}