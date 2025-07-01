// src/components/session-creator.tsx
"use client"

import React, { useState, useMemo } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target } from "lucide-react";

// Type Imports
import type { DashboardPatient, DashboardApple, DashboardBasket } from "@/types/dashboard";

// Tab Component Imports
import { PatientSelectionTab } from "./session-creator/tabs/PatientSelectionTab";
import { GameSelectionTab } from "./session-creator/tabs/GameSelectionTab";
import { ObjectPlacementTab } from "./session-creator/tabs/ObjectPlacementTab";
import { FingerSelection } from "@/components/finger-selection";
import { PreviewTab } from "./session-creator/tabs/PreviewTab";

// Örnek Veri (DashboardPatient tipiyle tam uyumlu)
const initialPatients: DashboardPatient[] = [
  { id: 1, name: "Mehmet Yılmaz", age: 45, diagnosis: "Omuz Çıkığı", arm: "Sağ", romLimit: 60, lastSession: "2024-01-15", totalSessions: 12, avgScore: 85, improvement: "+15%", status: "active" },
  { id: 2, name: "Fatma Demir", age: 38, diagnosis: "Dirsek Tendiniti", arm: "Sol", romLimit: 45, lastSession: "2024-01-14", totalSessions: 8, avgScore: 92, improvement: "+22%", status: "active" },
  { id: 3, name: "Ali Kaya", age: 52, diagnosis: "Rotator Cuff", arm: "Sağ", romLimit: 40, lastSession: "2024-01-13", totalSessions: 15, avgScore: 78, improvement: "+8%", status: "paused" },
  { id: 4, name: "Zeynep Öz", age: 29, diagnosis: "Bilek Kırığı", arm: "Sol", romLimit: 55, lastSession: "2024-01-15", totalSessions: 6, avgScore: 88, improvement: "+18%", status: "completed" },
];

export function SessionCreator() {
  const [activeTab, setActiveTab] = useState("patient");
  const [selectedPatient, setSelectedPatient] = useState<DashboardPatient | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "name">("name");
  const [selectedGame, setSelectedGame] = useState<"apple" | "piano" | null>(null);
  const [apples, setApples] = useState<DashboardApple[]>([]);
  const [baskets, setBaskets] = useState<DashboardBasket[]>([]);

  const filteredAndSortedPatients = useMemo(() => {
    return initialPatients
        .filter((patient) => patient.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
          if (sortOrder === "asc") return a.age - b.age;
          if (sortOrder === "desc") return b.age - a.age;
          return a.name.localeCompare(b.name);
        });
  }, [searchTerm, sortOrder]);

  // handleNext, handleBack, addRandomObject, removeObject fonksiyonları burada (önceki cevaptaki gibi)

  const handleNext = () => {
    if (activeTab === "patient" && selectedPatient) setActiveTab("setup");
    else if (activeTab === "setup" && selectedGame === "apple") setActiveTab("objects");
    else if (activeTab === "setup" && selectedGame === "piano") setActiveTab("finger-selection");
    else if (activeTab === "objects" || activeTab === "finger-selection") setActiveTab("preview");
  };

  const handleBack = () => {
    if (activeTab === "preview") setActiveTab(selectedGame === 'apple' ? 'objects' : 'finger-selection');
    else if (activeTab === "objects" || activeTab === "finger-selection") setActiveTab("setup");
    else if (activeTab === "setup") setActiveTab("patient");
  };

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
    switch(activeTab) {
      case 'patient':
        // Bu satır artık doğru çalışacak
        return <PatientSelectionTab patients={filteredAndSortedPatients} selectedPatient={selectedPatient} onSelectPatient={setSelectedPatient} searchTerm={searchTerm} onSearchTermChange={setSearchTerm} sortOrder={sortOrder} onSortOrderChange={setSortOrder} />;
      case 'setup':
        return <GameSelectionTab selectedGame={selectedGame} onSelectGame={setSelectedGame} />;
      case 'objects':
        return <ObjectPlacementTab apples={apples} baskets={baskets} romLimit={selectedPatient?.romLimit ?? 0} onAddObject={addRandomObject} onRemoveObject={removeObject} />;
      case 'finger-selection':
        return <FingerSelection />;
      case 'preview':
        return <PreviewTab selectedPatient={selectedPatient} selectedGame={selectedGame} apples={apples} baskets={baskets} />;
      default:
        return null;
    }
  }

  return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5" /> Yeni Rehabilitasyon Seansı</CardTitle>
            <CardDescription>Hastanıza özel bir rehabilitasyon seansı oluşturmak için adımları takip edin.</CardDescription>
          </CardHeader>
        </Card>

        <Tabs value={activeTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-5">
            {/* TabsTrigger'lar burada */}
            <TabsTrigger value="patient" onClick={() => setActiveTab('patient')}>1. Hasta</TabsTrigger>
            <TabsTrigger value="setup" disabled={!selectedPatient} onClick={() => setActiveTab('setup')}>2. Oyun</TabsTrigger>
            <TabsTrigger value="objects" disabled={selectedGame !== 'apple'} onClick={() => setActiveTab('objects')}>3. Nesneler</TabsTrigger>
            <TabsTrigger value="finger-selection" disabled={selectedGame !== 'piano'} onClick={() => setActiveTab('finger-selection')}>3. Parmaklar</TabsTrigger>
            <TabsTrigger value="preview" disabled={!selectedGame} onClick={() => setActiveTab('preview')}>4. Önizleme</TabsTrigger>
          </TabsList>

          <div className="animate-in fade-in-20 transition-opacity duration-300">
            {renderContent()}
          </div>
        </Tabs>

        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={handleBack} disabled={activeTab === 'patient'}>Geri</Button>
          {activeTab !== 'preview' ? (
              <Button onClick={handleNext} disabled={(activeTab === 'patient' && !selectedPatient) || (activeTab === 'setup' && !selectedGame)}>Devam</Button>
          ) : (
              <Button>Seansı Başlat ve Kaydet</Button>
          )}
        </div>
      </div>
  );
}