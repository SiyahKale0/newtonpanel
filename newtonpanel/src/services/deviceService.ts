import { db } from './firebase';
import { ref, set, get, update, remove, child } from "firebase/database";
import { Device } from '@/types/firebase';

const collectionRef = ref(db, 'devices');

// Cihazlar genelde belirli bir ID ile (örn: device_1) eklendiği için push yerine set kullanılır.
export const createOrUpdateDevice = async (id: string, data: Omit<Device, 'id'>): Promise<Device> => {
    const deviceRef = child(collectionRef, id);
    await set(deviceRef, data);
    return { id, ...data };
};

export const getAllDevices = async (): Promise<Device[]> => {
    const snapshot = await get(collectionRef);
    if (!snapshot.exists()) return [];
    const data = snapshot.val();
    return Object.keys(data).map(key => ({ id: key, ...data[key] }));
};

export const getDeviceById = async (id: string): Promise<Device | null> => {
    const snapshot = await get(child(collectionRef, id));
    if (!snapshot.exists()) return null;
    return { id: snapshot.key, ...snapshot.val() };
};

export const updateDevice = async (id: string, updates: Partial<Omit<Device, 'id'>>): Promise<void> => {
    return update(child(collectionRef, id), updates);
};

export const deleteDevice = async (id: string): Promise<void> => {
    return remove(child(collectionRef, id));
};