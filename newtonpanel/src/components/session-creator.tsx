// src/components/session-creator.tsx
"use client"

import React, { useState, useMemo, useEffect } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, Loader2 } from "lucide-react";

// Firebase Servisleri, Tipleri ve Dinleyici
import { getAllPatients } from "@/services/patientService";
import { updateDevice } from "@/services/deviceService";
import { onValue, ref } from "firebase/database";
import { db } from "@/services/firebase";
import { Patient as FirebasePatient, Device as FirebaseDevice } from "@/types/firebase";

// UI Tipleri
import type { DashboardPatient, DashboardApple, DashboardBasket } from "@/types/dashboard";

// Tab Component Imports
import { DeviceSelectionTab } from "./session-creator/tabs/DeviceSelectionTab";
import { PatientSelectionTab } from "./session-creator/tabs/PatientSelectionTab";
import { GameSelectionTab } from "./session-creator/tabs/GameSelectionTab";
import { ObjectPlacementTab } from "./session-creator/tabs/ObjectPlacementTab";
import { FingerSelection } from "@/components/finger-selection";
import { PreviewTab } from "./session-creator/tabs/PreviewTab";

// Veri formatlama fonksiyonu
function formatPatientForDashboard(patient: FirebasePatient): DashboardPatient {
    return { id: patient.id, name: patient.name, age: patient.age, diagnosis: patient.diagnosis, arm: patient.isFemale ? "Sol" : "Sağ", romLimit: 60, lastSession: "Mevcut", totalSessions: patient.sessions?.length ?? 0, avgScore: 85, improvement: "+10%", status: "active" };
}

export function SessionCreator() {
    const [activeTab, setActiveTab] = useState("device");
    const [isLoading, setIsLoading] = useState(false);

    // Cihaz State'leri (Artık gerçek zamanlı güncellenecek)
    const [allDevices, setAllDevices] = useState<FirebaseDevice[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [selectedDevice, setSelectedDevice] = useState<FirebaseDevice | null>(null);

    // Hasta State'leri
    const [allPatients, setAllPatients] = useState<DashboardPatient[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<DashboardPatient | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "name">("name");

    // Oyun ve Seans State'leri
    const [selectedGame, setSelectedGame] = useState<"apple" | "piano" | null>(null);
    const [apples, setApples] = useState<DashboardApple[]>([]);
    const [baskets, setBaskets] = useState<DashboardBasket[]>([]);

    // Verileri Çekme ve Dinleme
    useEffect(() => {
        setLoadingData(true);
        // Cihazları gerçek zamanlı dinle
        const devicesRef = ref(db, 'devices');
        const unsubscribeDevices = onValue(devicesRef, (snapshot) => {
            const deviceList: FirebaseDevice[] = [];
            if (snapshot.exists()) {
                const data = snapshot.val();
                for (const key in data) {
                    deviceList.push({ id: key, ...data[key] });
                }
            }
            setAllDevices(deviceList);
        });

        // Hastaları bir kerelik çek (eğer anlık dinlemeye gerek yoksa)
        getAllPatients().then(patients => {
            setAllPatients(patients.map(formatPatientForDashboard));
        }).finally(() => {
            setLoadingData(false);
        });

        // Component DOM'dan kaldırıldığında dinleyiciyi temizle
        return () => {
            unsubscribeDevices();
        };
    }, []);
    
    // Seçili cihazın hala müsait olup olmadığını kontrol et
    useEffect(() => {
        if (selectedDevice) {
            const isStillAvailable = allDevices.some(d => d.id === selectedDevice.id && d.enable && !d.patientID);
            if (!isStillAvailable) {
                setSelectedDevice(null);
                alert("Seçtiğiniz cihaz başka bir seans için atandığından seçiminiz kaldırıldı.");
            }
        }
    }, [allDevices, selectedDevice]);


    const filteredAndSortedPatients = useMemo(() => {
        return allPatients
            .filter(patient => patient.name && patient.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .sort((a, b) => sortOrder === 'asc' ? a.age - b.age : sortOrder === 'desc' ? b.age - a.age : a.name.localeCompare(b.name));
    }, [allPatients, searchTerm, sortOrder]);


    const handleNext = async () => {
        setIsLoading(true);
        try {
            if (activeTab === "device" && selectedDevice) {
                setActiveTab("patient");
            } else if (activeTab === "patient" && selectedPatient && selectedDevice) {
                await updateDevice(selectedDevice.id, { patientID: selectedPatient.id });
                setActiveTab("setup");
            } else if (activeTab === "setup" && selectedGame) {
                setActiveTab("game-details");
            } else if (activeTab === "game-details") {
                setActiveTab("preview");
            }
        } catch (error) {
            console.error("İleri adıma geçerken hata:", error);
            alert("İşlem sırasında bir hata oluştu.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = () => {
        if (activeTab === "preview") setActiveTab("game-details");
        else if (activeTab === "game-details") setActiveTab("setup");
        else if (activeTab === "setup") setActiveTab("patient");
        else if (activeTab === "patient") {
            // Geri giderken cihazdaki hasta atamasını (varsa) temizlemek iyi bir pratik olabilir.
            // if (selectedDevice?.patientID) {
            //     updateDevice(selectedDevice.id, { patientID: "" });
            // }
            setSelectedPatient(null);
            setActiveTab("device");
        }
    };
    
    // Diğer fonksiyonlar (addRandomObject, removeObject) değişmeden kalır...
    const addRandomObject = (type: 'fresh' | 'rotten' | 'basket') => {
        const romGrid = (selectedPatient?.romLimit ?? 60) / 20;
        const x = parseFloat((Math.random() * romGrid * (Math.random() > 0.5 ? 1 : -1)).toFixed(1));
        const y = parseFloat((Math.random() * romGrid).toFixed(1));
        const z = parseFloat((Math.random() * romGrid * (Math.random() > 0.5 ? 1 : -1)).toFixed(1));

        if (type === 'basket') {
            const newBasket: DashboardBasket = { id: Date.now(), type: 'fresh', position: { x, y: 0, z } };
            setBaskets(prev => [...prev, newBasket]);
        } else {
            const newApple: DashboardApple = { id: Date.now(), type, position: { x, y, z }, realDistance: Math.sqrt(x*x + y*y + z*z) * 20 };
            setApples(prev => [...prev, newApple]);
        }
    };

    const removeObject = (id: number, type: 'apple' | 'basket') => {
        if (type === 'apple') setApples(apples.filter(a => a.id !== id));
        else setBaskets(baskets.filter(b => b.id !== id));
    };


    const renderContent = () => {
        if (loadingData) {
            return (<Card className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /><p className="ml-4 text-muted-foreground">Veriler Yükleniyor...</p></Card>);
        }
        
        switch(activeTab) {
            case 'device':
                // `DeviceSelectionTab`'a her zaman güncel `allDevices` listesini gönderiyoruz.
                return <DeviceSelectionTab devices={allDevices} selectedDevice={selectedDevice} onSelectDevice={setSelectedDevice} />;
            case 'patient':
                return <PatientSelectionTab patients={filteredAndSortedPatients} selectedPatient={selectedPatient} onSelectPatient={setSelectedPatient} searchTerm={searchTerm} onSearchTermChange={setSearchTerm} sortOrder={sortOrder} onSortOrderChange={setSortOrder as any} />;
            case 'setup':
                return <GameSelectionTab selectedGame={selectedGame} onSelectGame={setSelectedGame} />;
            case 'game-details':
                if (selectedGame === 'apple') return <ObjectPlacementTab apples={apples} baskets={baskets} romLimit={selectedPatient?.romLimit ?? 0} onAddObject={addRandomObject} onRemoveObject={removeObject} />;
                if (selectedGame === 'piano') return <FingerSelection />;
                return null;
            case 'preview':
                return <PreviewTab selectedPatient={selectedPatient} selectedGame={selectedGame} apples={apples} baskets={baskets} />;
            default:
                return null;
        }
    }

    const isNextDisabled = () => {
        if (isLoading) return true;
        if (activeTab === 'device') return !selectedDevice;
        if (activeTab === 'patient') return !selectedPatient;
        if (activeTab === 'setup') return !selectedGame;
        return false;
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Target className="h-5 w-5" /> Yeni Rehabilitasyon Seansı</CardTitle><CardDescription>Hastanıza özel bir rehabilitasyon seansı oluşturmak için adımları takip edin.</CardDescription></CardHeader>
            </Card>

            <Tabs value={activeTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="device" onClick={() => setActiveTab('device')}>1. Cihaz</TabsTrigger>
                    <TabsTrigger value="patient" disabled={!selectedDevice} onClick={() => setActiveTab('patient')}>2. Hasta</TabsTrigger>
                    <TabsTrigger value="setup" disabled={!selectedDevice || !selectedPatient} onClick={() => setActiveTab('setup')}>3. Oyun</TabsTrigger>
                    <TabsTrigger value="game-details" disabled={!selectedDevice || !selectedPatient || !selectedGame} onClick={() => setActiveTab('game-details')}>4. Oyun Detay</TabsTrigger>
                    <TabsTrigger value="preview" disabled={!selectedDevice || !selectedPatient || !selectedGame} onClick={() => setActiveTab('preview')}>5. Önizleme</TabsTrigger>
                </TabsList>

                <div className="animate-in fade-in-20 transition-opacity duration-300">{renderContent()}</div>
            </Tabs>

            <div className="flex justify-between mt-6">
                <Button variant="outline" onClick={handleBack} disabled={activeTab === 'device' || isLoading}>Geri</Button>
                {activeTab !== 'preview' ? (
                    <Button onClick={handleNext} disabled={isNextDisabled()}>
                        {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> İşleniyor...</> : "Devam"}
                    </Button>
                ) : (
                    <Button>Seansı Başlat ve Kaydet</Button>
                )}
            </div>
        </div>
    );
}