import { db } from './firebase';
import { ref, set, get, update, remove, push, child } from "firebase/database";
import { Session } from '@/types/firebase';

const collectionRef = ref(db, 'sessions');

export const createSession = async (data: Omit<Session, 'id'>): Promise<Session> => {
    const newRef = push(collectionRef);
    if (!newRef.key) throw new Error("ID oluşturulamadı.");
    await set(newRef, data);
    return { id: newRef.key, ...data };
};

export const getAllSessions = async (): Promise<Session[]> => {
    const snapshot = await get(collectionRef);
    if (!snapshot.exists()) return [];
    const data = snapshot.val();
    return Object.keys(data).map(key => ({ id: key, ...data[key] }));
};

export const getSessionById = async (id: string): Promise<Session | null> => {
    const snapshot = await get(child(collectionRef, id));
    if (!snapshot.exists()) return null;
    return { id: snapshot.key, ...snapshot.val() };
};

export const updateSession = async (id: string, updates: Partial<Omit<Session, 'id'>>): Promise<void> => {
    return update(child(collectionRef, id), updates);
};

export const deleteSession = async (id: string): Promise<void> => {
    return remove(child(collectionRef, id));
};