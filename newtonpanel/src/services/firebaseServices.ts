// src/services/firebaseServices.ts
import { db } from './firebase'; // Firebase konfigürasyonunuzu buradan import edin
import { ref, get, child } from 'firebase/database';
import { Patient, Session, GameConfig, GameResult } from '@/types/firebase'; // Tiplerinizin yolunu güncelleyin

// Tüm hastaları getiren fonksiyon
export const getAllPatients = async (): Promise<Patient[]> => {
    const snapshot = await get(ref(db, 'patients'));
    if (snapshot.exists()) {
        const data = snapshot.val();
        return Object.keys(data).map(key => ({ id: key, ...data[key] }));
    }
    return [];
};

// Belirli bir hastanın tüm seanslarını getiren fonksiyon
export const getSessionsByPatientId = async (patientId: string): Promise<Session[]> => {
    const snapshot = await get(ref(db, 'sessions'));
    if (snapshot.exists()) {
        const allSessions = snapshot.val();
        const patientSessions = Object.keys(allSessions)
            .filter(key => allSessions[key].patientID === patientId)
            .map(key => ({ id: key, ...allSessions[key] }));
        
        // Seansları tarihe göre en yeniden eskiye sırala
        return patientSessions.sort((a, b) => {
             const dateA = new Date(`${a.date}T${a.startTime || '00:00:00'}`).getTime();
             const dateB = new Date(`${b.date}T${b.startTime || '00:00:00'}`).getTime();
             return dateB - dateA;
        });
    }
    return [];
};

// ID listesine göre oyun konfigürasyonlarını getiren fonksiyon
export const getGameConfigsByIds = async (configIds: string[]): Promise<Record<string, GameConfig>> => {
    const configs: Record<string, GameConfig> = {};
    const uniqueConfigIds = [...new Set(configIds)]; // Tekrarları engelle
    
    for (const id of uniqueConfigIds) {
        const snapshot = await get(child(ref(db, 'gameConfigs'), id));
        if (snapshot.exists()) {
            configs[id] = snapshot.val();
        }
    }
    return configs;
};

// ID listesine göre oyun sonuçlarını getiren fonksiyon
export const getGameResultsByIds = async (resultIds: string[]): Promise<Record<string, GameResult>> => {
    const results: Record<string, GameResult> = {};
    const uniqueResultIds = [...new Set(resultIds)]; // Tekrarları engelle

    for (const id of uniqueResultIds) {
        const snapshot = await get(child(ref(db, 'gameResults'), id));
        if (snapshot.exists()) {
            results[id] = { id, ...snapshot.val() };
        }
    }
    return results;
};