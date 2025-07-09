// src/components/session-creator.tsx
"use client"

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, Loader2 } from "lucide-react";

// Gerekli servisler, tipler ve dinleyiciler
import { getPatientById, incrementPatientSession } from "@/services/patientService";
import { createNewSession, updateSession } from "@/services/sessionService";
import { updateDevice } from "@/services/deviceService";
import { createOrUpdateGameConfig } from "@/services/gameConfigService";
import { onValue, ref } from "firebase/database";
import { db } from "@/services/firebase";
import { Patient as FirebasePatient, Device as FirebaseDevice, Session as FirebaseSession, FingerDanceConfig, AppleGameConfig } from "@/types/firebase";
import type { DashboardPatient, DashboardApple, DashboardBasket } from "@/types/dashboard";

// Diğer tab bileşenleri...
import { DeviceSelectionTab } from "./session-creator/tabs/DeviceSelectionTab";
import { PatientSelectionTab } from "./session-creator/tabs/PatientSelectionTab";
import { GameSelectionTab } from "./session-creator/tabs/GameSelectionTab";
import { ObjectPlacementTab } from "./session-creator/tabs/ObjectPlacementTab";
import { FingerSelection } from "@/components/finger-selection";
import { PreviewTab } from "./session-creator/tabs/PreviewTab";
import { CalibrationTab } from "./session-creator/tabs/CalibrationTab";
import { GameSettingsTab } from "./session-creator/tabs/GameSettingsTab";

const FINGER_MAP: { [key: string]: number } = {
    "Sol Serçe Parmağı": 0, "Sol Yüzük Parmağı": 1, "Sol Orta Parmak": 2, "Sol İşaret Parmağı": 3, "Sol Başparmak": 4,
    "Sağ Başparmak": 5, "Sağ İşaret Parmağı": 6, "Sağ Orta Parmak": 7, "Sağ Yüzük Parmağı": 8, "Sağ Serçe Parmağı": 9
};

function formatPatientForDashboard(patient: FirebasePatient): DashboardPatient {
    return { id: patient.id, name: patient.name, age: patient.age, diagnosis: patient.diagnosis, arm: patient.isFemale ? "Sol" : "Sağ", romLimit: 60, lastSession: "Mevcut", totalSessions: patient.sessionCount ?? 0, avgScore: 85, improvement: "+10%", status: "active" };
}

export function SessionCreator() {
    const [activeTab, setActiveTab] = useState("device");
    const [isLoading, setIsLoading] = useState(false);
    
    // Data states
    const [allDevices, setAllDevices] = useState<FirebaseDevice[]>([]);
    const [allPatients, setAllPatients] = useState<DashboardPatient[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    // Selection states
    const [selectedDevice, setSelectedDevice] = useState<FirebaseDevice | null>(null);
    const [selectedPatient, setSelectedPatient] = useState<DashboardPatient | null>(null);
    const [selectedGame, setSelectedGame] = useState<"apple" | "piano" | null>(null);
    const [selectedFingers, setSelectedFingers] = useState<string[]>([]);
    
    // Calibration states
    const [minRomCalibre, setMinRomCalibre] = useState(false);
    const [maxRomCalibre, setMaxRomCalibre] = useState(false);
    
    // Game Settings states
    const [gameDuration, setGameDuration] = useState(5);
    const [gameSpeed, setGameSpeed] = useState(1.0);
    
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

    // Dummy states for apple/basket props
    const [apples, setApples] = useState<DashboardApple[]>([]);
    const [baskets, setBaskets] = useState<DashboardBasket[]>([]);

    // Search & Sort states
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "name">("name");

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

    const handleNext = async () => {
        setIsLoading(true);
        try {
            if (activeTab === "device" && selectedDevice) {
                setActiveTab("patient");
            } else if (activeTab === "patient" && selectedPatient && selectedDevice) {
                const patientData = await getPatientById(selectedPatient.id);
                const newSessionId = `${selectedPatient.id}_session_${(patientData?.sessionCount ?? 0) + 1}`;
                setCurrentSessionId(newSessionId);
                const sessionData: Omit<FirebaseSession, 'id'> = {
                    patientID: selectedPatient.id, deviceID: selectedDevice.id, date: new Date().toISOString().split('T')[0],
                    startTime: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
                    endTime: "", romID: "", maxRomClibre: false, minRomClibre: false,
                };
                await Promise.all([
                    createNewSession(newSessionId, sessionData),
                    incrementPatientSession(selectedPatient.id, newSessionId),
                    updateDevice(selectedDevice.id, { patientID: selectedPatient.id })
                ]);
                setActiveTab("setup");
            } else if (activeTab === "setup" && selectedGame) {
                setActiveTab("game-details");
            } else if (activeTab === "game-details") {
                setActiveTab("calibration");
            } else if (activeTab === "calibration") {
                setActiveTab("game-settings");
            } else if (activeTab === "game-settings" && currentSessionId) {
                console.log("Oyun ayarlarına göre seansa özel konfigürasyon oluşturuluyor...");
                
                const newConfigId = `config_${currentSessionId}`;
                let newConfigData: Omit<AppleGameConfig, 'id'> | Omit<FingerDanceConfig, 'id'>;

                if (selectedGame === 'piano') {
                    const numericFingerIds = selectedFingers.map(fingerName => FINGER_MAP[fingerName]).filter(id => id !== undefined);
                    newConfigData = {
                        gameType: "fingerDance",
                        song: "fur_elise",
                        speed: gameSpeed,
                        targetFingers: numericFingerIds,
                    };
                } else if (selectedGame === 'apple') {
                     newConfigData = {
                        gameType: "appleGame",
                        duration: gameDuration,
                        difficulty: "medium",
                        maxApples: 20,
                        allowedHand: "right"
                     };
                } else {
                    throw new Error("Geçersiz oyun tipi seçildi.");
                }

                await Promise.all([
                    createOrUpdateGameConfig(newConfigId, newConfigData),
                    updateSession(currentSessionId, { gameConfigID: newConfigId, gameType: selectedGame === 'piano' ? 'fingerDance' : 'appleGame' })
                ]);
                
                console.log(`Yeni oyun konfigürasyonu (${newConfigId}) oluşturuldu ve seansa (${currentSessionId}) bağlandı.`);
                setActiveTab("preview");
            }
        } catch (error) {
            console.error("İleri adıma geçerken hata:", error);
            alert(`İşlem sırasında bir hata oluştu: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBack = useCallback(async () => { 
        if (activeTab === 'setup' && selectedDevice?.patientID) {
             await updateDevice(selectedDevice.id, { patientID: "" });
        }
        if (activeTab === "preview") setActiveTab("game-settings");
        else if (activeTab === "game-settings") setActiveTab("calibration");
        else if (activeTab === "calibration") setActiveTab("game-details");
        else if (activeTab === "game-details") setActiveTab("setup");
        else if (activeTab === "setup") setActiveTab("patient");
        else if (activeTab === "patient") setActiveTab("device");
     }, [activeTab, selectedDevice]);
    
    const renderContent = () => {
        if (loadingData) return (<Card className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /><p className="ml-4 text-muted-foreground">Veriler Yükleniyor...</p></Card>);
        
        switch(activeTab) {
            case 'device': 
                return <DeviceSelectionTab devices={allDevices} selectedDevice={selectedDevice} onSelectDevice={setSelectedDevice} />;
            case 'patient': 
                return <PatientSelectionTab 
                            patients={filteredAndSortedPatients} 
                            selectedPatient={selectedPatient} 
                            onSelectPatient={setSelectedPatient} 
                            searchTerm={searchTerm} 
                            onSearchTermChange={setSearchTerm} 
                            sortOrder={sortOrder} 
                            onSortOrderChange={setSortOrder} // <<< FIX 1: Corrected prop name
                        />;
            case 'setup': 
                return <GameSelectionTab selectedGame={selectedGame} onSelectGame={setSelectedGame} />;
            case 'game-details':
                if (selectedGame === 'apple') return <ObjectPlacementTab apples={apples} baskets={baskets} romLimit={0} onAddObject={()=>{}} onRemoveObject={()=>{}} />;
                if (selectedGame === 'piano') return <FingerSelection selectedFingers={selectedFingers} onSelectionChange={setSelectedFingers} />;
                return null;
            case 'calibration': 
                return <CalibrationTab minRomCalibre={minRomCalibre} maxRomCalibre={maxRomCalibre} onToggle={()=>{}} />;
            case 'game-settings':
                 return <GameSettingsTab 
                            duration={gameDuration}
                            setDuration={setGameDuration}
                            speed={gameSpeed}
                            setSpeed={setGameSpeed}
                            gameType={selectedGame === 'piano' ? 'fingerDance' : 'appleGame'}
                        />;
            case 'preview': 
                return <PreviewTab 
                            selectedPatient={selectedPatient} 
                            selectedGame={selectedGame} 
                            apples={apples} 
                            baskets={baskets} // <<< FIX 2: Added missing props
                        />;
            default: return null;
        }
    }

    const isNextDisabled = () => {
        if (isLoading) return true;
        if (activeTab === 'device') return !selectedDevice;
        if (activeTab === 'patient') return !selectedPatient;
        if (activeTab === 'setup') return !selectedGame;
        if (activeTab === 'game-details' && selectedGame === 'piano' && selectedFingers.length === 0) return true;
        return false;
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Target className="h-5 w-5" /> Yeni Rehabilitasyon Seansı</CardTitle><CardDescription>Hastanıza özel bir rehabilitasyon seansı oluşturmak için adımları takip edin.</CardDescription></CardHeader>
            </Card>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-7"> 
                    <TabsTrigger value="device">1. Cihaz</TabsTrigger>
                    <TabsTrigger value="patient" disabled={!selectedDevice}>2. Hasta</TabsTrigger>
                    <TabsTrigger value="setup" disabled={!selectedPatient}>3. Oyun</TabsTrigger>
                    <TabsTrigger value="game-details" disabled={!selectedGame}>4. Oyun Detay</TabsTrigger>
                    <TabsTrigger value="calibration" disabled={!selectedGame}>5. Kalibrasyon</TabsTrigger>
                    <TabsTrigger value="game-settings" disabled={!selectedGame}>6. Oyun Ayarları</TabsTrigger>
                    <TabsTrigger value="preview" disabled={!selectedGame}>7. Önizleme</TabsTrigger>
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