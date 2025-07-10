// src/components/performance-analytics.tsx
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { getDatabase, ref, get } from 'firebase/database';
import { Patient, Session, Rom } from '@/types/firebase';
import PatientSelector from './performance-analytics/PatientSelector';
import SessionSelector from './performance-analytics/SessionSelector';
import ArmMeasurementCard from './performance-analytics/ArmMeasurementCard';
import FingerProgressTable from './performance-analytics/FingerProgressTable';
import Hand2D from './performance-analytics/Hand2D';

export default function PerformanceAnalytics({ selectedPatientId: propSelectedPatientId }: { selectedPatientId?: string | null }) {
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
        const [patientsSnapshot, sessionsSnapshot, romsSnapshot] = await Promise.all([
          get(ref(db, 'patients')),
          get(ref(db, 'sessions')),
          get(ref(db, 'roms'))
        ]);

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

  useEffect(() => {
    if (propSelectedPatientId) {
      const patient = patients.find(p => p.id === propSelectedPatientId) || null;
      setSelectedPatient(patient);
      setSelectedSession(null);
      setSelectedRom(null);
    }
  }, [propSelectedPatientId, patients]);

  const handlePatientChange = (patientId: string) => {
    const patient = patients.find(p => p.id === patientId) || null;
    setSelectedPatient(patient);
    setSelectedSession(null);
    setSelectedRom(null);
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

  const processedFingerData = useMemo(() => {
    if (!selectedRom || !selectedRom.finger || Array.isArray(selectedRom.finger)) {
        return [];
    }
    const { leftFingers, rightFingers } = selectedRom.finger;
    const FINGER_NAMES = [
        "Sol Serçe", "Sol Yüzük", "Sol Orta", "Sol İşaret", "Sol Başparmak",
        "Sağ Başparmak", "Sağ İşaret", "Sağ Orta", "Sağ Yüzük", "Sağ Serçe"
    ];
    const convert = (val: any): number => {
        const num = Number(val);
        if (isNaN(num)) return 0;
        return num < 2 ? Math.round(num * 100) : Math.round(num);
    };

    const process = (arr: {min: any, max: any}[] | undefined) => {
        if (!arr) return Array(5).fill({ min: 0, max: 0 });
        const data = arr.map(f => ({ min: convert(f.min), max: convert(f.max) }));
        while (data.length < 5) data.push({ min: 0, max: 0 });
        return data.slice(0, 5);
    };

    const leftData = process(leftFingers);
    const rightData = process(rightFingers);

    // Birleştir: Sol Serçe -> Sol Başparmak, sonra Sağ Başparmak -> Sağ Serçe
    const combined = [...leftData, ...[...rightData].reverse()];

    return combined.map((finger, i) => ({
        name: FINGER_NAMES[i],
        min: finger.min.toString(),
        max: finger.max.toString(),
    }));
  }, [selectedRom]);

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

      {selectedPatient && selectedSession && !selectedRom && !loading && (
        <div className="text-center text-gray-500 mt-8 p-8 bg-white rounded-lg shadow-md">
            <p>Bu seans için ROM (Hareket Açıklığı) verisi bulunamadı.</p>
        </div>
      )}
      
      {selectedRom && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div className="space-y-6">
                {selectedRom.arm && <ArmMeasurementCard leftSpace={selectedRom.arm.leftSpace} rightSpace={selectedRom.arm.rightSpace} />}
                {processedFingerData.length === 10 && <Hand2D fingerData={processedFingerData.map(f => Number(f.max))} />}
            </div>
            <div>
              {processedFingerData.length > 0 && <FingerProgressTable fingers={processedFingerData} />}
            </div>
        </div>
      )}
    </div>
  );
}