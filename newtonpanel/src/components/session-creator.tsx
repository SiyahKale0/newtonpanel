// src/components/session-creator.tsx
"use client"

import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, Loader2, Gamepad2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

// Servisler, tipler ve diğer bileşenler
import { getPatientById, incrementPatientSession } from "@/services/patientService";
import { createNewSession, updateSession } from "@/services/sessionService";
import { updateDevice } from "@/services/deviceService";
import { createOrUpdateGameConfig, updateGameConfig } from "@/services/gameConfigService";
import { onValue, ref } from "firebase/database";
import { db } from "@/services/firebase";
import { Patient as FirebasePatient, Device as FirebaseDevice, Session as FirebaseSession, FingerDanceConfig, AppleGameConfig, SceneObject } from "@/types/firebase";
import type { DashboardPatient } from "@/types/dashboard";

import { DeviceSelectionTab } from "./session-creator/tabs/DeviceSelectionTab";
import { PatientSelectionTab } from "./session-creator/tabs/PatientSelectionTab";
import { GameSelectionTab } from "./session-creator/tabs/GameSelectionTab";
import { FingerSelection } from "@/components/finger-selection";
import { PreviewTab } from "./session-creator/tabs/PreviewTab";
import { CalibrationTab } from "./session-creator/tabs/CalibrationTab";
import { AppleGameDetailsTab } from "./session-creator/tabs/AppleGameDetailsTab";
import { AppleGameCalibrationTab } from "./session-creator/tabs/AppleGameCalibration";

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
    const [selectedGame, setSelectedGame] = useState<"appleGame" | "fingerDance" | null>(null);
    const [selectedFingers, setSelectedFingers] = useState<string[]>([]);
    const [sceneObjects, setSceneObjects] = useState<SceneObject[]>([]);


    // Apple Game states
    const [appleGameMode, setAppleGameMode] = useState<"Reach" | "Grip" | "Carry" | "Sort" | null>(null);
    // Seviye tipini 5'li sisteme geri döndürdük
    const [appleGameLevel, setAppleGameLevel] = useState<1 | 2 | 3 | 4 | 5 | null>(null);


    // Calibration states
    const [minRomCalibre, setMinRomCalibre] = useState(false);
    const [maxRomCalibre, setMaxRomCalibre] = useState(false);

    // Game Settings states
    const [handAperture, setHandAperture] = useState(50);
    const [gameSpeed, setGameSpeed] = useState(1.0);

    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [currentGameConfigId, setCurrentGameConfigId] = useState<string | null>(null);
    const [sessionState, setSessionState] = useState<"configuring" | "running" | "finished">("configuring");
    const [timer, setTimer] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const [isFinishGameModalOpen, setIsFinishGameModalOpen] = useState(false);

    // Search & Sort states
    const [searchTerm, setSearchTerm] = useState("");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "name">("name");

    useEffect(() => {
        setLoadingData(true);
        const devicesRef = ref(db, 'devices');
        const patientsRef = ref(db, 'patients');

        const unsubscribeDevices = onValue(devicesRef, (snapshot) => {
            const list: FirebaseDevice[] = [];
            snapshot.forEach(child => { list.push({ id: child.key!, ...child.val() }); });
            setAllDevices(list);
        });
        const unsubscribePatients = onValue(patientsRef, (snapshot) => {
            const list: FirebasePatient[] = [];
            snapshot.forEach(child => { list.push({ id: child.key!, ...child.val() }); });
            setAllPatients(list.map(formatPatientForDashboard));
            if(loadingData) setLoadingData(false);
        });
        return () => { unsubscribeDevices(); unsubscribePatients(); };
    }, []);

    const filteredAndSortedPatients = useMemo(() => {
        const assignedPatientIDs = new Set(allDevices.filter(d => d.patientID).map(d => d.patientID));
        return allPatients.filter(p => !assignedPatientIDs.has(p.id))
            .filter(p => p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .sort((a, b) => sortOrder === 'asc' ? a.age - b.age : sortOrder === 'desc' ? b.age - a.age : a.name.localeCompare(b.name));
    }, [allPatients, allDevices, searchTerm, sortOrder]);

    const updateGameStatus = async (status: "idle" | "playing" | "finish") => {
        if (currentGameConfigId) {
            try {
                await updateGameConfig(currentGameConfigId, { status });
            } catch (error) {
                console.error(`Oyun durumu (${status}) güncellenirken hata:`, error);
            }
        }
    };

    const handleFinishGame = async () => {
        if (timerRef.current) clearInterval(timerRef.current);
        await updateGameStatus("finish");
        setIsFinishGameModalOpen(true);
    };

    const handleFinalizeSession = async () => {
        if (currentSessionId && selectedDevice) {
            try {
                await updateSession(currentSessionId, {
                    endTime: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                });
                await updateDevice(selectedDevice.id, { patientID: "" });
                setSessionState("finished");
                setIsFinishGameModalOpen(false);
                alert("Seans başarıyla bitirildi ve kaydedildi!");
                // Reset to initial tab
                setActiveTab("device");
                // Reset all states
                // ... (add full reset logic here if needed)
            } catch (error) {
                console.error("Seans bitirilirken hata:", error);
                alert("Seans bitirilirken bir hata oluştu.");
            }
        }
    };

    const handlePlayAgain = async () => {
        await updateGameStatus("idle");
        setTimer(0);
        setSessionState("configuring");
        setActiveTab("game-details");
        setIsFinishGameModalOpen(false);
    };


    const startTimer = async () => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (currentSessionId) {
            try {
                await updateSession(currentSessionId, {
                    startTime: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                });
                await updateGameStatus("playing");
                setSessionState("running");
                timerRef.current = setInterval(() => {
                    setTimer(prev => prev + 1);
                }, 1000);
            } catch (error) {
                console.error("Seans başlatılırken zaman kaydedilemedi:", error);
                alert("Hata: Seans başlangıç zamanı kaydedilemedi.");
            }
        }
    };

    const stopTimer = async () => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (currentSessionId && selectedDevice) {
            try {
                await updateSession(currentSessionId, {
                    endTime: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                });
                await updateDevice(selectedDevice.id, { patientID: "" });
                await updateGameStatus("finish");
                setSessionState("finished");
                alert("Seans başarıyla bitirildi ve kaydedildi!");
            } catch (error) {
                console.error("Seans bitirilirken hata:", error);
                alert("Seans bitirilirken bir hata oluştu.");
            }
        }
    };

    const handleCalibrationToggle = async (type: 'min' | 'max') => {
        if (!currentSessionId) {
            console.error("Kalibrasyon yapılamadı: Aktif seans ID'si yok.");
            alert("Hata: Aktif seans bulunamadığı için kalibrasyon durumu güncellenemedi.");
            return;
        }

        const isMin = type === 'min';
        const newStatus = isMin ? !minRomCalibre : !maxRomCalibre;
        const fieldToUpdate = isMin ? { minRomClibre: newStatus } : { maxRomClibre: newStatus };

        try {
            await updateSession(currentSessionId, fieldToUpdate);
            if (isMin) { setMinRomCalibre(newStatus); } else { setMaxRomCalibre(newStatus); }
        } catch (error) {
            console.error("Firebase kalibrasyon durumu güncellenirken hata oluştu:", error);
            alert("Kalibrasyon durumu güncellenirken bir sunucu hatası oluştu. Lütfen tekrar deneyin.");
        }
    };

    const handleSelectGame = async (game: "appleGame" | "fingerDance") => {
        setSelectedGame(game);
        if (currentSessionId) {
            const configId = `config_${currentSessionId}`;
            setCurrentGameConfigId(configId);
            let configData: Omit<AppleGameConfig, 'id'> | Omit<FingerDanceConfig, 'id'>;

            if(game === 'appleGame') {
                configData = {
                    gameType: "appleGame",
                    gameMode: "Reach",
                    level: 0, // Varsayılan seviye (0-4 aralığında)
                    status: "idle",
                    allowedHand: "both",
                    difficulty: "medium",
                    duration: 120,
                    maxApples: 30,
                    handPerHundred: 50,
                };
            } else { // fingerDance
                configData = {
                    gameType: "fingerDance",
                    song: "fur_elise",
                    speed: 1.0,
                    targetFingers: [],
                    handPerHundred: 50,
                    status: "idle",
                };
            }
            await createOrUpdateGameConfig(configId, configData);
            await updateSession(currentSessionId, { gameConfigID: configId, gameType: game });
        }
    };

    const handleSelectAppleGameMode = async (mode: "Reach" | "Grip" | "Carry" | "Sort") => {
        setAppleGameMode(mode);
        if (currentGameConfigId) {
            await updateGameConfig(currentGameConfigId, { gameMode: mode });
        }
    };

    const handleSelectAppleGameLevel = async (level: 1 | 2 | 3 | 4 | 5) => {
        setAppleGameLevel(level);
        if (currentGameConfigId) {
            // Panelde 1-5 arası seçilen değeri, Firebase'e 0-4 arası kaydet
            await updateGameConfig(currentGameConfigId, { level: level - 1 });
        }
    };

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
                    startTime: "", endTime: "", romID: `${selectedPatient.id}_rom_${(patientData?.sessionCount)}`,
                    maxRomClibre: false, minRomClibre: false,
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
                if (selectedGame === 'appleGame') {
                    if (appleGameLevel === 5) {
                        setActiveTab("apple-game-calibration");
                    } else {
                        await updateGameStatus("idle");
                        setActiveTab("preview");
                    }
                } else if (selectedGame === 'fingerDance') {

                    if (currentGameConfigId) {
                        const numericFingerIds = selectedFingers.map(fingerName => FINGER_MAP[fingerName]).filter(id => id !== undefined);
                        await updateGameConfig(currentGameConfigId, { targetFingers: numericFingerIds, speed: gameSpeed, handPerHundred: handAperture });
                    }
                    setActiveTab("calibration");
                }
            } else if (activeTab === "apple-game-calibration") {
                setActiveTab("preview");
            } else if (activeTab === "calibration") {
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
        if (activeTab === "preview") {
            if (selectedGame === 'appleGame') {
                if (appleGameLevel === 5) {
                    setActiveTab("apple-game-calibration");
                } else {
                    setActiveTab("game-details");
                }
            } else {
                setActiveTab("calibration");
            }
        }
        else if (activeTab === "apple-game-calibration") setActiveTab("game-details");
        else if (activeTab === "calibration") setActiveTab("game-details");
        else if (activeTab === "game-details") setActiveTab("setup");
        else if (activeTab === "setup") setActiveTab("patient");
        else if (activeTab === "patient") setActiveTab("device");
    }, [activeTab, selectedDevice, selectedGame, appleGameLevel]);

    const GameSettingsCard = () => (
        <Card className="h-full">
            <CardHeader><CardTitle className="flex items-center gap-2"><Gamepad2 className="h-5 w-5" /> Oyun Ayarları</CardTitle><CardDescription>Oyun mekaniklerini bu seansa özel yapılandırın.</CardDescription></CardHeader>
            <CardContent className="space-y-8 pt-4">
                {selectedGame === 'fingerDance' && (
                    <div className="space-y-3">
                        <Label htmlFor="speed">Nota Hızı: {gameSpeed.toFixed(1)}x</Label>
                        <Slider id="speed" min={0.5} max={2.5} step={0.1} value={[gameSpeed]} onValueChange={(v) => setGameSpeed(v[0])}/>
                        <p className="text-sm text-muted-foreground">Piyano notalarının akma hızını ayarlar.</p>
                    </div>
                )}
                <div className="space-y-3">
                    <Label htmlFor="handAperture">El Açıklığı Hedefi: {handAperture}%</Label>
                    <Slider id="handAperture" min={0} max={100} step={5} value={[handAperture]} onValueChange={(v) => setHandAperture(v[0])} />
                    <p className="text-sm text-muted-foreground">Hedeflenen el açılma veya kapanma yüzdesi.</p>
                </div>
            </CardContent>
        </Card>
    );

    const renderContent = () => {
        if (loadingData) return (<Card className="flex justify-center items-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /><p className="ml-4 text-muted-foreground">Veriler Yükleniyor...</p></Card>);

        switch(activeTab) {
            case 'device':
                return <DeviceSelectionTab devices={allDevices} selectedDevice={selectedDevice} onSelectDevice={setSelectedDevice} />;
            case 'patient':
                return <PatientSelectionTab patients={filteredAndSortedPatients} selectedPatient={selectedPatient} onSelectPatient={setSelectedPatient} searchTerm={searchTerm} onSearchTermChange={setSearchTerm} sortOrder={sortOrder} onSortOrderChange={setSortOrder} />;
            case 'setup':
                return <GameSelectionTab selectedGame={selectedGame} onSelectGame={handleSelectGame} />;
            case 'game-details':
                if (selectedGame === 'fingerDance') {
                    return (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <FingerSelection selectedFingers={selectedFingers} onSelectionChange={setSelectedFingers} />
                            <GameSettingsCard />
                        </div>
                    );
                } else if (selectedGame === 'appleGame') {
                    return <AppleGameDetailsTab selectedMode={appleGameMode} selectedLevel={appleGameLevel} onSelectMode={handleSelectAppleGameMode} onSelectLevel={handleSelectAppleGameLevel} />;
                }
                return null;
            case 'apple-game-calibration':
                return <AppleGameCalibrationTab initialObjects={sceneObjects} onObjectsChange={setSceneObjects} />;
            case 'calibration':
                return <CalibrationTab minRomCalibre={minRomCalibre} maxRomCalibre={maxRomCalibre} onToggle={handleCalibrationToggle} />;
            case 'preview':
                return <PreviewTab selectedPatient={selectedPatient} selectedGame={selectedGame} sessionState={sessionState} timer={timer} />;
            default: return null;
        }
    }

    const isNextDisabled = () => {
        if (isLoading) return true;
        if (activeTab === 'device') return !selectedDevice;
        if (activeTab === 'patient') return !selectedPatient;
        if (activeTab === 'setup') return !selectedGame;
        if (activeTab === 'game-details') {
            if (selectedGame === 'fingerDance' && selectedFingers.length === 0) return true;
            if (selectedGame === 'appleGame' && (!appleGameMode || !appleGameLevel)) return true;
        }
        if (activeTab === 'calibration' && selectedGame === 'fingerDance') return false;
        return false;
    };

    const renderFooterButtons = () => {
        if (activeTab !== 'preview') {
            return (
                <>
                    <Button variant="outline" onClick={handleBack} disabled={activeTab === 'device' || isLoading}>Geri</Button>
                    <Button onClick={handleNext} disabled={isNextDisabled()}>
                        {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> İşleniyor...</> : "Devam"}
                    </Button>
                </>
            );
        }

        if (sessionState === "configuring") {
            return <Button className="w-full" onClick={startTimer}>Seansı Başlat</Button>;
        }

        if (sessionState === "running") {
            return <Button className="w-full" variant="destructive" onClick={handleFinishGame}>Oyunu Bitir</Button>;
        }

        return <Button className="w-full" disabled>Seans Tamamlandı</Button>;
    }

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
                    <TabsTrigger value="apple-game-calibration" disabled={selectedGame !== 'appleGame' || appleGameLevel !== 5}>5. Elma Yerleştir</TabsTrigger>
                    <TabsTrigger value="calibration" disabled={selectedGame !== 'fingerDance'}>6. Kalibrasyon</TabsTrigger>
                    <TabsTrigger value="preview" disabled={!selectedGame}>7. Önizleme</TabsTrigger>
                </TabsList>
                <div className="animate-in fade-in-20 transition-opacity duration-300">{renderContent()}</div>
            </Tabs>

            <Dialog open={isFinishGameModalOpen} onOpenChange={setIsFinishGameModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Oyun Bitti!</DialogTitle>
                        <DialogDescription>
                            Sıradaki adımı seçin. Seansı tamamen bitirebilir veya aynı ayarlarla tekrar oynayabilirsiniz.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-center gap-2 pt-4">
                        <Button variant="outline" onClick={handlePlayAgain}>Yeniden Oyna</Button>
                        <Button variant="destructive" onClick={handleFinalizeSession}>Seansı Tamamla ve Çık</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>


            <div className="flex justify-between mt-6">
                {renderFooterButtons()}
            </div>
        </div>
    );
}