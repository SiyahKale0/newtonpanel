import { db } from './firebase';
import { ref, set, get, update, remove, push, child } from "firebase/database";
import { GameResult } from '@/types/firebase';

const collectionRef = ref(db, 'gameResults');

export const createGameResult = async (data: Omit<GameResult, 'id'>): Promise<GameResult> => {
    const newRef = push(collectionRef);
    if (!newRef.key) throw new Error("ID oluşturulamadı.");
    await set(newRef, data);
    return { id: newRef.key, ...data } as GameResult;
};

export const getAllGameResults = async (): Promise<GameResult[]> => {
    const snapshot = await get(collectionRef);
    if (!snapshot.exists()) return [];
    const data = snapshot.val();
    return Object.keys(data).map(key => ({ id: key, ...data[key] }));
};

export const getGameResultById = async (id: string): Promise<GameResult | null> => {
    const snapshot = await get(child(collectionRef, id));
    if (!snapshot.exists()) return null;
    return { id: snapshot.key, ...snapshot.val() };
};

export const updateGameResult = async (id: string, updates: Partial<Omit<GameResult, 'id'>>): Promise<void> => {
    return update(child(collectionRef, id), updates);
};

export const deleteGameResult = async (id: string): Promise<void> => {
    return remove(child(collectionRef, id));
};