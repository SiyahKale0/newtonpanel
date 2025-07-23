"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Patient, Session, SessionResult } from '@/types/firebase';
import { DashboardPatient } from '@/types/dashboard';
import { getAllPatients, getAllSessions, getAllGameResults } from '@/services/firebaseServices';
import { calculatePerformanceMetrics } from '@/lib/analytics';

export const usePatientManagement = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [results, setResults] = useState<Record<string, SessionResult>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [patientData, sessionData, resultData] = await Promise.all([
        getAllPatients(),
        getAllSessions(),
        getAllGameResults(),
      ]);
      setPatients(patientData);
      setSessions(sessionData);
      setResults(resultData);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch patient management data:", err);
      setError("Veriler yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const dashboardPatients = useMemo((): DashboardPatient[] => {
    if (!patients.length) return [];

    return patients.map(patient => {
      const patientSessions = sessions.filter(s => s.patientID === patient.id);
      const metrics = patientSessions.length > 0 
        ? calculatePerformanceMetrics(patientSessions, results, {}, {}) 
        : null;

      const lastSession = patientSessions.length > 0
        ? new Date(patientSessions[0].date).toLocaleDateString('tr-TR')
        : 'Yok';

      return {
        id: patient.id,
        name: patient.name,
        age: patient.age,
        diagnosis: patient.diagnosis,
        arm: "Sağ", // Bu bilgi Patient tipinde yok, varsayılan değer
        romLimit: 0, // Bu bilgi Patient tipinde yok, varsayılan değer
        lastSession,
        totalSessions: patientSessions.length,
        avgScore: metrics?.averageScore ?? 0,
        improvement: `${metrics?.improvementTrend ?? 0}%`,
        status: 'active', // Bu bilgi Patient tipinde yok, varsayılan değer
      };
    });
  }, [patients, sessions, results]);

  const addPatient = (newPatient: Patient) => {
    setPatients(prev => [...prev, newPatient]);
  };

  return {
    patients, // Orijinal hasta listesini de döndür
    dashboardPatients,
    loading,
    error,
    addPatient,
    refreshData: fetchData,
  };
};