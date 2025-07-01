// src/components/device-management.tsx
"use client"

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Wifi, WifiOff } from "lucide-react";
import { AddDeviceDialog } from "./device-management/AddDeviceDialog";

// Örnek veri tipleri
interface ActiveDevice {
    id: string;
    name: string;
    patientName: string;
    gameName: string;
}

interface PassiveDevice {
    id: string;
    name: string;
}

// Örnek veriler
const initialActiveDevices: ActiveDevice[] = [
    { id: 'MQ001', name: 'MetaQuest-01', patientName: 'Ahmet Yılmaz', gameName: 'Elma Toplama' },
    { id: 'MQ002', name: 'MetaQuest-02', patientName: 'Fatma Kaya', gameName: 'Piyano Egzersizi' },
];

const initialPassiveDevices: PassiveDevice[] = [
    { id: 'MQ003', name: 'MetaQuest-03' },
    { id: 'MQ004', name: 'MetaQuest-04' },
    { id: 'MQ005', name: 'MetaQuest-05' },
];

export function DeviceManagement() {
    const [activeDevices, setActiveDevices] = useState<ActiveDevice[]>(initialActiveDevices);
    const [passiveDevices, setPassiveDevices] = useState<PassiveDevice[]>(initialPassiveDevices);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Cihaz Yönetimi</h1>
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
                            <div key={device.id} className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <p className="font-semibold">{device.name}</p>
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
                                <p className="font-semibold">{device.name}</p>
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