// src/components/session-creator/tabs/DeviceSelectionTab.tsx
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Wifi, WifiOff } from "lucide-react";
import type { Device } from "@/types/firebase";

interface DeviceSelectionTabProps {
    // Bu prop artık her zaman en güncel listeyi parent'tan alacak.
    devices: Device[]; 
    selectedDevice: Device | null;
    onSelectDevice: (device: Device | null) => void;
}

export function DeviceSelectionTab({
    devices,
    selectedDevice,
    onSelectDevice,
}: DeviceSelectionTabProps) {
    // Filtreleme doğrudan gelen prop üzerinden yapılır.
    const availableDevices = devices.filter(d => d.enable && !d.patientID);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Cihaz Seçimi</CardTitle>
                <CardDescription>Seansı başlatmak için müsait bir cihaz seçin. Liste anlık olarak güncellenir.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2 pt-4">
                    <Label>Müsait Cihazlar ({availableDevices.length})</Label>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {availableDevices.map((device) => (
                            <Card
                                key={device.id}
                                className={`cursor-pointer transition-all ${
                                    selectedDevice?.id === device.id
                                        ? "border-primary ring-2 ring-primary"
                                        : "hover:border-primary/50"
                                }`}
                                onClick={() => onSelectDevice(device)}
                            >
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold">{device.deviceName}</h3>
                                        {device.connectionStatus === 'online' ? (
                                            <Wifi className="h-5 w-5 text-green-500" />
                                        ) : (
                                            <WifiOff className="h-5 w-5 text-gray-400" />
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground truncate" title={device.id}>
                                       ID: {device.id}
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                       Durum: {device.connectionStatus === 'online' ? 'Çevrimiçi' : 'Çevrimdışı'}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    {availableDevices.length === 0 && (
                        <p className="pt-4 text-center text-sm text-muted-foreground">
                            Şu anda müsait bir cihaz bulunmuyor.
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}