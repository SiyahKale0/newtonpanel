// src/components/session-creator.tsx
"use client"

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, Loader2 } from "lucide-react";

// Gerekli tüm servisler, tipler ve dinleyiciler
import { getPatientById, incrementPatientSession } from "@/services/patientService";
import { createNewSession, updateSessionGame } from "@/services/sessionService";
import { updateDevice } from "@/services/deviceService";
import { onValue, ref } from "firebase/database";
import { db } from "@/services/firebase";
import { Patient as FirebasePatient, Device as FirebaseDevice, Session as FirebaseSession } from "@/types/firebase";
import type { DashboardPatient, DashboardApple, DashboardBasket } from "@/types/dashboard";

// Diğer tab bileşenleri...
import { DeviceSelectionTab } from "./session-creator/tabs/DeviceSelectionTab";
import { PatientSelectionTab } from "./session-creator/tabs/PatientSelectionTab";
import { GameSelectionTab } from "./session-creator/tabs/GameSelectionTab";
import { ObjectPlacementTab } from "./session-creator/tabs/ObjectPlacementTab";
import { FingerSelection } from "@/components/finger-selection";
import { PreviewTab } from "./session-creator/tabs/PreviewTab";


function formatPatientForDashboard(patient: FirebasePatient): DashboardPatient {
    return { id: patient.id, name: patient.name, age: patient.age, diagnosis: patient.diagnosis, arm: patient.isFemale ? "Sol" : "Sağ", romLimit: 60, lastSession: "Mevcut", totalSessions: patient.sessionCount ?? 0, avgScore: 85, improvement: "+10%", status: "active" };
}

export function SessionCreator() {
    const [activeTab, setActiveTab] = useState("device");
    const [isLoading, setIsLoading] = useState(false);
    
    // Veri state'leri
    const [allDevices, setAllDevices] = useState<FirebaseDevice[]>([]);
    const [allPatients, setAllPatients] = useState<DashboardPatient[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    // Seçim state'leri
    const [selectedDevice, setSelectedDevice] = useState<FirebaseDevice | null>(null);
    const [selectedPatient, setSelectedPatient] = useState<DashboardPatient | null>(null);
    const [selectedGame, setSelectedGame] = useState<"apple" | "piano" | null>(null);
    
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

    // Arama, sıralama ve oyun objeleri
    const [apples, setApples] = useState<DashboardApple[]>([]);
    const [baskets, setBaskets] = useState<DashboardBasket[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "name">("name");

    // Veri dinleyicileri
    useEffect(() => {
        setLoadingData(true);
        const devicesRef = ref(db, 'devices');
        const patientsRef = ref(db, 'patients');

        const unsubscribeDevices = onValue(devicesRef, (snapshot) => {
            const list: FirebaseDevice[] = [];
            snapshot.forEach(child => { list.push({ id: child.key, ...child.val() }); });
            setAllDevices(list);
        });
        const unsubscribePatients = onValue(patientsRef, (snapshot) => {
            const list: FirebasePatient[] = [];
            snapshot.forEach(child => { list.push({ id: child.key, ...child.val() }); });
            setAllPatients(list.map(formatPatientForDashboard));
            if(loadingData) setLoadingData(false);
        });
        return () => { unsubscribeDevices(); unsubscribePatients(); };
    }, []);

    const filteredAndSortedPatients = useMemo(() => {
        const unassignedPatientIDs = new Set(allDevices.filter(d => d.patientID).map(d => d.patientID));
        return allPatients.filter(p => !unassignedPatientIDs.has(p.id))
            .filter(p => p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .sort((a, b) => sortOrder === 'asc' ? a.age - b.age : sortOrder === 'desc' ? b.age - a.age : a.name.localeCompare(b.name));
    }, [allPatients, allDevices, searchTerm, sortOrder]);


    // OYUN SEÇİMİ İÇİN YENİ FONKSİYON
    const handleGameSelection = async (game: "apple" | "piano") => {
        setSelectedGame(game);
        if (!currentSessionId) {
            console.error("Seans ID'si bulunamadı, oyun seçimi kaydedilemedi.");
            return;
        }
        try {
            // HATA ÇÖZÜMÜ: Bileşen içindeki tipi ("apple") veritabanı tipine ("appleGame") dönüştür.
            const gameTypeForDB: 'appleGame' | 'fingerDance' = game === 'apple' ? 'appleGame' : 'fingerDance';
            const gameConfigID = game === 'apple' ? 'gameConfig_1' : 'gameConfig_2';
            
            // Servis fonksiyonuna doğru tiple veri gönder.
            await updateSessionGame(currentSessionId, gameTypeForDB, gameConfigID);

        } catch (error) {
            console.error("Oyun seçimi güncellenirken hata:", error);
        }
    };

    const handleNext = async () => {
        setIsLoading(true);
        try {
            if (activeTab === "device" && selectedDevice) {
                setActiveTab("patient");
            } 
            else if (activeTab === "patient" && selectedPatient && selectedDevice) {
                const patientData = await getPatientById(selectedPatient.id);
                const currentSessionCount = patientData?.sessionCount ?? 0;
                const newSessionId = `${selectedPatient.id}_session_${currentSessionCount + 1}`; // Daha benzersiz bir ID
                setCurrentSessionId(newSessionId);

                const sessionData: Omit<FirebaseSession, 'id'> = {
                    patientID: selectedPatient.id,
                    deviceID: selectedDevice.id,
                    date: new Date().toISOString().split('T')[0],
                    startTime: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
                    endTime: "", romID: ""
                };
                
                await Promise.all([
                    createNewSession(newSessionId, sessionData),
                    incrementPatientSession(selectedPatient.id, newSessionId),
                    updateDevice(selectedDevice.id, { patientID: selectedPatient.id })
                ]);

                setActiveTab("setup");
            } 
            else if (activeTab === "setup" && selectedGame) {
                setActiveTab("game-details");
            } 
            else if (activeTab === "game-details") {
                setActiveTab("preview");
            }
        } catch (error) {
            console.error("İleri adıma geçerken hata:", error);
            alert("İşlem sırasında bir hata oluştu.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = useCallback(async () => { 
        if (activeTab === 'setup' && selectedDevice?.patientID) {
             await updateDevice(selectedDevice.id, { patientID: "" });
        }
        if (activeTab === "preview") setActiveTab("game-details");
        else if (activeTab === "game-details") setActiveTab("setup");
        else if (activeTab === "setup") setActiveTab("patient");
        else if (activeTab === "patient") setActiveTab("device");
     }, [activeTab, selectedDevice]);
    
    // ... (addRandomObject, removeObject fonksiyonları aynı kalır)
    const addRandomObject = (type: 'fresh' | 'rotten' | 'basket') => { /* ... */ };
    const removeObject = (id: number, type: 'apple' | 'basket') => { /* ... */ };


    const renderContent = () => {
        if (loadingData) {
            return (<Card className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /><p className="ml-4 text-muted-foreground">Veriler Yükleniyor...</p></Card>);
        }
        
        switch(activeTab) {
            case 'device':
                return <DeviceSelectionTab devices={allDevices} selectedDevice={selectedDevice} onSelectDevice={setSelectedDevice} />;
            case 'patient':
                return <PatientSelectionTab patients={filteredAndSortedPatients} selectedPatient={selectedPatient} onSelectPatient={setSelectedPatient} searchTerm={searchTerm} onSearchTermChange={setSearchTerm} sortOrder={sortOrder} onSortOrderChange={setSortOrder as any} />;
            case 'setup':
                return <GameSelectionTab selectedGame={selectedGame} onSelectGame={handleGameSelection} />;
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