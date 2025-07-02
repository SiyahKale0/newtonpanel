// src/services/sessionService.ts

import { db } from './firebase';
import { ref, set, get, update, remove, child } from "firebase/database";
import { Session } from '@/types/firebase';

// Veritabanındaki 'sessions' koleksiyonuna ana referans.
const collectionRef = ref(db, 'sessions');

/**
 * Yeni bir seans oluşturur. Bu fonksiyon, genellikle seans akışının başında,
 * temel bilgilerle boş bir seans kaydı yaratmak için kullanılır.
 * @param sessionId Oluşturulacak seans için benzersiz ID (örn: "session_1").
 * @param initialData Seansın başlangıç verileri (patientID, deviceID, date vb.).
 * @returns Promise<void>
 */
export const createNewSession = async (sessionId: string, initialData: Omit<Session, 'id'>): Promise<void> => {
    const sessionRef = child(collectionRef, sessionId);
    return set(sessionRef, initialData);
};

/**
 * Mevcut bir seansın oyun bilgilerini günceller.
 * @param sessionId Güncellenecek seansın ID'si.
 * @param gameType Seçilen oyunun türü ('appleGame' veya 'fingerDance').
 * @param gameConfigID Seçilen oyuna ait konfigürasyon ID'si.
 * @returns Promise<void>
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
 * @returns Tüm seansları içeren bir Session dizisi.
 */
export const getAllSessions = async (): Promise<Session[]> => {
    const snapshot = await get(collectionRef);
    if (!snapshot.exists()) return [];
    const data = snapshot.val();
    return Object.keys(data).map(key => ({ id: key, ...data[key] }));
};

/**
 * Belirtilen ID'ye sahip tek bir seansı getirir.
 * @param id Getirilecek seansın ID'si.
 * @returns Session nesnesi veya bulunamazsa null.
 */
export const getSessionById = async (id: string): Promise<Session | null> => {
    const snapshot = await get(child(collectionRef, id));
    if (!snapshot.exists()) return null;
    return { id: snapshot.key, ...snapshot.val() };
};

/**
 * Bir seansın bilgilerini günceller.
 * @param id Güncellenecek seansın ID'si.
 * @param updates Güncellenecek alanları içeren kısmi bir Session nesnesi.
 * @returns Promise<void>
 */
export const updateSession = async (id: string, updates: Partial<Omit<Session, 'id'>>): Promise<void> => {
    return update(child(collectionRef, id), updates);
};

/**
 * Bir seansı veritabanından siler.
 * @param id Silinecek seansın ID'si.
 * @returns Promise<void>
 */
export const deleteSession = async (id: string): Promise<void> => {
    return remove(child(collectionRef, id));
};