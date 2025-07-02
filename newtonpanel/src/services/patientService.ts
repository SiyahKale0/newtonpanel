// src/services/patientService.ts

import { db } from './firebase';
import { ref, set, get, update, remove, push, child, increment } from "firebase/database";
import { Patient } from '@/types/firebase';

// Veritabanındaki 'patients' koleksiyonuna ana referans.
const collectionRef = ref(db, 'patients');

/**
 * Yeni bir hasta oluşturur.
 * @param data 'id' hariç hasta bilgilerini içeren nesne.
 * @returns Oluşturulan hastanın tam verisi (Firebase'den gelen ID dahil).
 */
export const createPatient = async (data: Omit<Patient, 'id'>): Promise<Patient> => {
    const newRef = push(collectionRef);
    if (!newRef.key) {
        throw new Error("Firebase için benzersiz bir ID oluşturulamadı.");
    }
    await set(newRef, data);
    return { id: newRef.key, ...data };
};

/**
 * Veritabanındaki tüm hastaları getirir.
 * @returns Tüm hastaları içeren bir Patient dizisi.
 */
export const getAllPatients = async (): Promise<Patient[]> => {
    const snapshot = await get(collectionRef);
    if (!snapshot.exists()) return [];
    const data = snapshot.val();
    return Object.keys(data).map(key => ({ id: key, ...data[key] }));
};

/**
 * Belirtilen ID'ye sahip tek bir hastayı getirir.
 * @param id Getirilecek hastanın ID'si.
 * @returns Patient nesnesi veya bulunamazsa null.
 */
export const getPatientById = async (id: string): Promise<Patient | null> => {
    const snapshot = await get(child(collectionRef, id));
    if (!snapshot.exists()) return null;
    return { id: snapshot.key, ...snapshot.val() };
};

/**
 * Bir hastanın bilgilerini günceller.
 * @param id Güncellenecek hastanın ID'si.
 * @param updates Güncellenecek alanları içeren kısmi bir Patient nesnesi.
 * @returns Promise<void>
 */
export const updatePatient = async (id: string, updates: Partial<Omit<Patient, 'id'>>): Promise<void> => {
    return update(child(collectionRef, id), updates);
};

/**
 * Bir hastanın seans sayısını bir artırır ve yeni seans ID'sini hastanın listesine ekler.
 * Bu işlem, iki güncellemenin de aynı anda yapılmasını garanti eden atomik bir operasyondur.
 * @param patientId Güncellenecek hastanın ID'si.
 * @param newSessionId Hastanın 'sessions' listesine eklenecek yeni seansın ID'si.
 * @returns Promise<void>
 */
export const incrementPatientSession = async (patientId: string, newSessionId: string): Promise<void> => {
    const updates: { [key: string]: any } = {};
    
    // sessionCount alanını sunucu tarafında 1 artır.
    updates[`/patients/${patientId}/sessionCount`] = increment(1);
    
    // Yeni session ID'sini hastanın sessions listesine ekle.
    updates[`/patients/${patientId}/sessions/${newSessionId}`] = true;

    // Tüm güncellemeleri tek bir atomik işlem olarak veritabanına gönder.
    return update(ref(db), updates);
};

/**
 * Bir hastayı veritabanından siler.
 * @param id Silinecek hastanın ID'si.
 * @returns Promise<void>
 */
export const deletePatient = async (id: string): Promise<void> => {
    return remove(child(collectionRef, id));
};