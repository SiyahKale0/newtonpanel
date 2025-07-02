// src/components/device-management.tsx
"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Wifi, WifiOff, Loader2 } from "lucide-react";
import { AddDeviceDialog } from "./device-management/AddDeviceDialog";

// Firebase ve Tipler
import { onValue, ref } from "firebase/database";
import { db } from "@/services/firebase";
import type { Device, Patient } from "@/types/firebase";

// Ayrı bir servis dosyası oluşturmak yerine, bu bileşene özel olduğu için
// hasta bilgisini çekme fonksiyonunu burada tanımlayabiliriz.
import { getPatientById } from '@/services/patientService';

// Arayüzde kullanılacak birleşik bir tip oluşturalım.
interface ActiveDeviceInfo extends Device {
    patientName?: string;
    gameName?: string;
}

export function DeviceManagement() {
    const [allDevices, setAllDevices] = useState<Device[]>([]);
    const [patients, setPatients] = useState<Map<string, Patient>>(new Map());
    const [loading, setLoading] = useState(true);

    // Cihazları ve hastaları gerçek zamanlı dinle
    useEffect(() => {
        // Cihazları dinle
        const devicesRef = ref(db, 'devices');
        const unsubscribeDevices = onValue(devicesRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const deviceList: Device[] = Object.keys(data).map(key => ({ id: key, ...data[key] }));
                setAllDevices(deviceList);
            } else {
                setAllDevices([]);
            }
            setLoading(false);
        });

        // Hastaları dinle (cihazlara atanan hastaların isimlerini göstermek için)
        const patientsRef = ref(db, 'patients');
        const unsubscribePatients = onValue(patientsRef, (snapshot) => {
             if (snapshot.exists()) {
                const data = snapshot.val();
                const patientsMap = new Map<string, Patient>();
                Object.keys(data).forEach(key => {
                    patientsMap.set(key, { id: key, ...data[key] });
                });
                setPatients(patientsMap);
            } else {
                setPatients(new Map());
            }
        });


        // Component kaldırıldığında dinleyicileri temizle
        return () => {
            unsubscribeDevices();
            unsubscribePatients();
        };
    }, []);

    // Cihazları aktif ve pasif olarak ayır
    const activeDevices: ActiveDeviceInfo[] = allDevices
        .filter(d => d.patientID)
        .map(d => ({
            ...d,
            patientName: patients.get(d.patientID)?.name ?? 'Bilinmeyen Hasta',
            gameName: 'Bilinmiyor' // Bu bilgi session'lardan türetilebilir
        }));
        
    const passiveDevices: Device[] = allDevices.filter(d => !d.patientID);

    if (loading) {
         return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="ml-4 text-lg text-muted-foreground">Cihazlar Yükleniyor...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Cihaz Yönetimi</h1>
                {/* TODO: Bu dialog'a da onDeviceAdded callback'i eklenebilir. */}
                <AddDeviceDialog />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Aktif Cihazlar */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Wifi className="text-green-500" />
                            Aktif Cihazlar ({activeDevices.length})
                        </CardTitle>
                        <CardDescription>Şu anda bir hasta tarafından kullanılan cihazlar.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {activeDevices.map(device => (
                            <div key={device.id} className="p-4 border rounded-lg bg-green-50 dark:bg-green-900/20">
                                <p className="font-semibold">{device.deviceName}</p>
                                <div className="text-sm text-muted-foreground">
                                    <p><span className="font-medium">Hasta:</span> {device.patientName}</p>
                                    <p><span className="font-medium">Oyun:</span> {device.gameName}</p>
                                </div>
                            </div>
                        ))}
                        {activeDevices.length === 0 && (
                            <p className="text-center text-sm text-muted-foreground py-8">Aktif cihaz bulunmuyor.</p>
                        )}
                    </CardContent>
                </Card>

                {/* Pasif Cihazlar */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <WifiOff className="text-gray-400" />
                            Pasif Cihazlar ({passiveDevices.length})
                        </CardTitle>
                        <CardDescription>Kullanıma hazır, boşta bekleyen cihazlar.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {passiveDevices.map(device => (
                            <div key={device.id} className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <p className="font-semibold">{device.deviceName}</p>
                                <p className="text-sm text-green-600 dark:text-green-400">Kullanıma hazır</p>
                            </div>
                        ))}
                        {passiveDevices.length === 0 && (
                            <p className="text-center text-sm text-muted-foreground py-8">Pasif cihaz bulunmuyor.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}