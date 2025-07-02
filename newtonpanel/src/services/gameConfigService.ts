import { db } from './firebase';
import { ref, set, get, update, remove, child } from "firebase/database";
import { GameConfig } from '@/types/firebase';

const collectionRef = ref(db, 'gameConfigs');

export const createOrUpdateGameConfig = async (id: string, data: Omit<GameConfig, 'id'>): Promise<GameConfig> => {
    const configRef = child(collectionRef, id);
    await set(configRef, data);
    return { id, ...data } as GameConfig;
};

export const getAllGameConfigs = async (): Promise<GameConfig[]> => {
    const snapshot = await get(collectionRef);
    if (!snapshot.exists()) return [];
    const data = snapshot.val();
    return Object.keys(data).map(key => ({ id: key, ...data[key] }));
};

export const getGameConfigById = async (id: string): Promise<GameConfig | null> => {
    const snapshot = await get(child(collectionRef, id));
    if (!snapshot.exists()) return null;
    return { id: snapshot.key, ...snapshot.val() };
};

export const updateGameConfig = async (id: string, updates: Partial<Omit<GameConfig, 'id'>>): Promise<void> => {
    return update(child(collectionRef, id), updates);
};

export const deleteGameConfig = async (id: string): Promise<void> => {
    return remove(child(collectionRef, id));
};