// src/services/sessionService.ts

import { db } from './firebase';
import { ref, set, get, update, remove, child, query, orderByChild, equalTo } from "firebase/database";
import { Session } from '@/types/firebase';

const collectionRef = ref(db, 'sessions');

/**
 * Yeni bir seans oluşturur.
 */
export const createNewSession = async (sessionId: string, initialData: Omit<Session, 'id'>): Promise<void> => {
    const sessionRef = child(collectionRef, sessionId);
    return set(sessionRef, initialData);
};

/**
 * Mevcut bir seansın oyun bilgilerini günceller.
 */
export const updateSessionGame = async (sessionId: string, gameType: 'appleGame' | 'fingerDance', gameConfigID: string): Promise<void> => {
    const sessionRef = child(collectionRef, sessionId);
    return update(sessionRef, {
        gameType: gameType,
        gameConfigID: gameConfigID
    });
};

/**
 * Veritabanındaki tüm seans kayıtlarını getirir.
 */
export const getAllSessions = async (): Promise<Session[]> => {
    const snapshot = await get(collectionRef);
    if (!snapshot.exists()) return [];
    const data = snapshot.val();
    return Object.keys(data).map(key => ({ id: key, ...data[key] }));
};

/**
 * Belirtilen ID'ye sahip tek bir seansı getirir.
 */
export const getSessionById = async (id: string): Promise<Session | null> => {
    const snapshot = await get(child(collectionRef, id));
    if (!snapshot.exists()) return null;
    return { id: snapshot.key, ...snapshot.val() };
};

/**
 * Bir seansın bilgilerini günceller.
 */
export const updateSession = async (id: string, updates: Partial<Omit<Session, 'id'>>): Promise<void> => {
    return update(child(collectionRef, id), updates);
};

/**
 * Bir seansı veritabanından siler.
 */
export const deleteSession = async (id: string): Promise<void> => {
    return remove(child(collectionRef, id));
};

/**
 * Belirli bir hastaya ait tüm seansları getirir. (Client-side filtreleme)
 */
export const getAllSessionsByPatientId_ClientFiltered = async (patientId: string): Promise<Session[]> => {
  const allSessions = await getAllSessions();
  const filteredSessions = allSessions.filter(session => session.patientID === patientId);
  return filteredSessions;
};