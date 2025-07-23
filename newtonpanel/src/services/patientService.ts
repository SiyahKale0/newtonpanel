// src/services/patientService.ts

import { db } from './firebase';
import { ref, set, get, update, remove, push, child, increment } from "firebase/database";
import { Patient } from '@/types/firebase';

const collectionRef = ref(db, 'patients');

export const createPatient = async (data: Omit<Patient, 'id'>): Promise<Patient> => {
    const newRef = push(collectionRef);
    if (!newRef.key) {
        throw new Error("Firebase için benzersiz bir ID oluşturulamadı.");
    }
    await set(newRef, data);
    return { id: newRef.key, ...data };
};

export const getAllPatients = async (): Promise<Patient[]> => {
    const snapshot = await get(collectionRef);
    if (!snapshot.exists()) return [];
    const data = snapshot.val();
    return Object.keys(data).map(key => ({ id: key, ...data[key] }));
};

export const getPatientById = async (id: string): Promise<Patient | null> => {
    const snapshot = await get(child(collectionRef, id));
    if (!snapshot.exists()) return null;
    return { id: snapshot.key, ...snapshot.val() };
};

export const updatePatient = async (id: string, updates: Partial<Omit<Patient, 'id'>>): Promise<void> => {
    return update(child(collectionRef, id), updates);
};

export const incrementPatientSession = async (patientId: string, newSessionId: string): Promise<void> => {
    const updates: { [key: string]: any } = {};
    updates[`/patients/${patientId}/sessionCount`] = increment(1);
    updates[`/patients/${patientId}/sessions/${newSessionId}`] = true;
    return update(ref(db), updates);
};

// YENİ: Hastaya yeni bir öneri ekleyen fonksiyon
export const addRecommendationToPatient = async (patientId: string, recommendation: { text: string; therapistId: string; }) => {
    const recommendationRef = push(ref(db, `patients/${patientId}/recommendations`));
    const newRecommendation = {
        ...recommendation,
        date: new Date().toISOString()
    };
    return set(recommendationRef, newRecommendation);
};

export const deletePatient = async (id: string): Promise<void> => {
    return remove(child(collectionRef, id));
};
