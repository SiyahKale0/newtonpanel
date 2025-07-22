// src/hooks/use-performance-analytics.ts
"use client";

import { useState, useEffect, useMemo } from 'react';
import { DateRange } from "react-day-picker";
import { addDays } from "date-fns";
import { Patient, Session, GameConfig, GameResult as GameResultType, Rom, SessionResult } from '@/types/firebase';
import {
  getAllPatients,
  getSessionsByPatientId,
  getGameConfigsByIds,
  getGameResultsByIds,
  getAllRoms
} from '@/services/firebaseServices';
import {
  calculatePerformanceMetrics,
  PerformanceMetrics,
} from '@/lib/analytics';

export const usePerformanceAnalytics = () => {
  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [gameConfigs, setGameConfigs] = useState<Record<string, GameConfig>>({});
  const [gameResults, setGameResults] = useState<Record<string, SessionResult>>({});
  const [roms, setRoms] = useState<Record<string, Rom>>({});
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [date, setDate] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  const [loading, setLoading] = useState(true);
  const [loadingPatientData, setLoadingPatientData] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // Fetch all patients on initial load
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const patients = await getAllPatients();
        setAllPatients(patients);
      } catch (err) {
        console.error("Failed to load patients:", err);
        setError('Failed to load patient list.');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Load data when a patient is selected
  useEffect(() => {
    const loadPatientSpecificData = async () => {
      if (!selectedPatientId) return;

      setLoadingPatientData(true);
      setError(null);
      setSessions([]);
      setGameConfigs({});
      setGameResults({});
      setRoms({});
      setPerformanceMetrics(null);

      try {
        const sessionData = await getSessionsByPatientId(selectedPatientId);
        setSessions(sessionData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

        if (sessionData.length > 0) {
          const configIds = sessionData.map(s => s.gameConfigID).filter(Boolean) as string[];
          const resultIds = sessionData.flatMap(s => {
            const sessionNumber = s.id.split('_').pop();
            if (!sessionNumber) return [];
            return [
              `${s.patientID}_result_${sessionNumber}`,
              `${s.patientID}_results_${sessionNumber}`
            ];
          });

          const [configData, resultData, romData] = await Promise.all([
            getGameConfigsByIds(configIds),
            getGameResultsByIds(resultIds),
            getAllRoms()
          ]);

          setGameConfigs(configData);
          setGameResults(resultData as Record<string, SessionResult>);
          setRoms(romData as Record<string, Rom>);
        }
      } catch (err: any) {
        console.error("Failed to load patient data:", err);
        setError(err.message || 'An error occurred while loading patient session data.');
      } finally {
        setLoadingPatientData(false);
      }
    };

    loadPatientSpecificData();
  }, [selectedPatientId]);

  // Calculate filtered data based on date range
  const filteredData = useMemo(() => {
    if (!sessions.length) return { filteredSessions: [], filteredResults: {}, filteredConfigs: {}, filteredRoms: {} };

    const filteredSessions = sessions.filter(session => {
        const sessionDate = new Date(session.date);
        if (date?.from && sessionDate < date.from) return false;
        if (date?.to && sessionDate > date.to) return false;
        return true;
    });

    const filteredSessionIds = new Set(filteredSessions.map(s => s.id));
    const filteredResults: Record<string, SessionResult> = {};
    const filteredConfigs: Record<string, GameConfig> = {};
    const filteredRoms: Record<string, Rom> = {};

    for (const key in gameResults) {
        const parts = key.split('_');
        if (parts.length < 3) continue;

        const sessionNumber = parts[parts.length - 1];
        const patientId = key.substring(0, key.indexOf(`_result`));
        
        const sessionId = `${patientId}_session_${sessionNumber}`;

        if (filteredSessionIds.has(sessionId)) {
            filteredResults[key] = gameResults[key];
        }
    }
    
    for (const key in gameConfigs) {
        filteredConfigs[key] = gameConfigs[key];
    }

    for (const key in roms) {
        filteredRoms[key] = roms[key];
    }

    return { filteredSessions, filteredResults, filteredConfigs, filteredRoms };
  }, [sessions, gameResults, gameConfigs, roms, date]);

  // Calculate metrics based on filtered data
  useEffect(() => {
    if (filteredData.filteredSessions.length > 0) {
        const metrics = calculatePerformanceMetrics(
            filteredData.filteredSessions,
            filteredData.filteredResults,
            filteredData.filteredConfigs,
            filteredData.filteredRoms
        );
        setPerformanceMetrics(metrics);
    } else {
        setPerformanceMetrics(null);
    }
  }, [filteredData]);

  const selectedPatient = useMemo(() => 
    allPatients.find(p => p.id === selectedPatientId), 
    [selectedPatientId, allPatients]
  );

  return {
    allPatients,
    selectedPatient,
    selectedPatientId,
    setSelectedPatientId,
    date,
    setDate,
    loading,
    loadingPatientData,
    error,
    filteredData,
    performanceMetrics,
  };
};