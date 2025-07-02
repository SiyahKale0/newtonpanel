import { db } from './firebase';
import { ref, set, get, update, remove, child } from "firebase/database";
import { Rom } from '@/types/firebase';

const collectionRef = ref(db, 'roms');

export const createOrUpdateRom = async (id: string, data: Omit<Rom, 'id'>): Promise<Rom> => {
    const romRef = child(collectionRef, id);
    await set(romRef, data);
    return { id, ...data };
};

export const getAllRoms = async (): Promise<Rom[]> => {
    const snapshot = await get(collectionRef);
    if (!snapshot.exists()) return [];
    const data = snapshot.val();
    return Object.keys(data).map(key => ({ id: key, ...data[key] }));
};

export const getRomById = async (id: string): Promise<Rom | null> => {
    const snapshot = await get(child(collectionRef, id));
    if (!snapshot.exists()) return null;
    return { id: snapshot.key, ...snapshot.val() };
};

export const updateRom = async (id: string, updates: Partial<Omit<Rom, 'id'>>): Promise<void> => {
    return update(child(collectionRef, id), updates);
};

export const deleteRom = async (id: string): Promise<void> => {
    return remove(child(collectionRef, id));
};