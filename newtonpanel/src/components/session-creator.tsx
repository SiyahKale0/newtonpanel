// src/components/session-creator.tsx

"use client"

import React, { useState, useMemo } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  Target,
  Search,
  ArrowUpDown,
  Piano,
  HandMetal, // Düzeltilmiş ikon
} from "lucide-react"

// Parmak seçimi için oluşturacağımız yeni bileşeni import ediyoruz.
import { FingerSelection } from "./finger-selection"
import type { DashboardPatient } from "@/types/dashboard"
import { ThreeDGrid } from "./three-d-grid" // Bu importun zaten olduğunu varsayıyorum

export function SessionCreator() {
  // --- STATE TANIMLAMALARI ---
  const [activeTab, setActiveTab] = useState("patient")
  const [selectedPatient, setSelectedPatient] = useState<DashboardPatient | null>(
      null
  )
  const [searchTerm, setSearchTerm] = useState("")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "name">("name")
  const [selectedGame, setSelectedGame] = useState<"apple" | "piano" | null>(
      null
  )

  // --- ÖRNEK VERİLER ---
  const patients = useMemo(
      () =>
          [
            { id: 1, name: "Mehmet Yılmaz", age: 45, romLimit: 60 },
            { id: 2, name: "Fatma Demir", age: 38, romLimit: 45 },
            { id: 3, name: "Ali Kaya", age: 52, romLimit: 40 },
            { id: 4, name: "Zeynep Öz", age: 29, romLimit: 55 },
          ] as DashboardPatient[],
      []
  )

  // Arama ve sıralama mantığı
  const filteredAndSortedPatients = useMemo(() => {
    return patients
        .filter((patient) =>
            patient.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
          if (sortOrder === "asc") {
            return a.age - b.age
          }
          if (sortOrder === "desc") {
            return b.age - a.age
          }
          return a.name.localeCompare(b.name)
        })
  }, [patients, searchTerm, sortOrder])

  // --- FONKSİYONLAR ---
  const handleNext = () => {
    if (activeTab === "setup") {
      if (selectedGame === "apple") {
        setActiveTab("objects")
      } else if (selectedGame === "piano") {
        setActiveTab("finger-selection")
      }
    } else if (activeTab === "objects" || activeTab === "finger-selection") {
      setActiveTab("preview")
    } else if (activeTab === "patient" && selectedPatient) {
      setActiveTab("setup")
    }
  }

  // Önceki adıma dönmek için
  const handleBack = () => {
    if (activeTab === 'preview') {
      if(selectedGame === 'apple') setActiveTab('objects');
      else if (selectedGame === 'piano') setActiveTab('finger-selection');
    } else if (activeTab === 'objects' || activeTab === 'finger-selection') {
      setActiveTab('setup');
    } else if (activeTab === 'setup') {
      setActiveTab('patient');
    }
  }

  // Örnek state'ler (Nesne yerleşimi için gerekli)
  const [apples, setApples] = useState([])
  const [baskets, setBaskets] = useState([])


  return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Yeni Rehabilitasyon Seansı
            </CardTitle>
            <CardDescription>
              Hastanıza özel bir rehabilitasyon seansı oluşturmak için adımları
              takip edin.
            </CardDescription>
          </CardHeader>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="patient">1. Hasta Seçimi</TabsTrigger>
            <TabsTrigger value="setup" disabled={!selectedPatient}>
              2. Oyun Seçimi
            </TabsTrigger>
            <TabsTrigger value="objects" disabled={selectedGame !== "apple"}>
              3. Nesne Yerleşimi
            </TabsTrigger>
            <TabsTrigger
                value="finger-selection"
                disabled={selectedGame !== "piano"}
            >
              3. Parmak Seçimi
            </TabsTrigger>
            <TabsTrigger value="preview" disabled={!selectedGame}>
              4. Önizleme
            </TabsTrigger>
          </TabsList>

          {/* ==================== HASTA SEÇİMİ ==================== */}
          <TabsContent value="patient" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Hasta Seçimi</CardTitle>
                <CardDescription>
                  Seans için hasta arayın, sıralayın ve seçin.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-4 sm:flex-row">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                        placeholder="Hasta adıyla ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                  </div>
                  <Select
                      onValueChange={(value: "asc" | "desc" | "name") =>
                          setSortOrder(value)
                      }
                      defaultValue="name"
                  >
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <ArrowUpDown className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Sırala" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Ada Göre Sırala</SelectItem>
                      <SelectItem value="asc">Yaşa Göre (Artan)</SelectItem>
                      <SelectItem value="desc">Yaşa Göre (Azalan)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 pt-4">
                  <Label>Hastalar</Label>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {filteredAndSortedPatients.map((patient) => (
                        <Card
                            key={patient.id}
                            className={`cursor-pointer transition-all ${
                                selectedPatient?.id === patient.id
                                    ? "border-primary ring-2 ring-primary"
                                    : "hover:border-primary/50"
                            }`}
                            onClick={() => setSelectedPatient(patient)}
                        >
                          <CardContent className="p-4">
                            <h3 className="font-semibold">{patient.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              Yaş: {patient.age} - ROM Limiti: {patient.romLimit}cm
                            </p>
                          </CardContent>
                        </Card>
                    ))}
                  </div>
                  {filteredAndSortedPatients.length === 0 && (
                      <p className="text-center text-sm text-muted-foreground pt-4">Aramanızla eşleşen hasta bulunamadı.</p>
                  )}
                </div>
              </CardContent>
            </Card>
            <div className="flex justify-end">
              <Button onClick={handleNext} disabled={!selectedPatient}>Devam</Button>
            </div>
          </TabsContent>

          {/* ==================== OYUN SEÇİMİ ==================== */}
          <TabsContent value="setup" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Oyun Seçin</CardTitle>
                <CardDescription>
                  Oynanacak rehabilitasyon oyununu seçin.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div
                      onClick={() => setSelectedGame("apple")}
                      className={`flex cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border p-8 transition-all ${
                          selectedGame === "apple"
                              ? "border-primary ring-2 ring-primary"
                              : "hover:border-primary/50"
                      }`}
                  >
                    <HandMetal className="h-12 w-12 text-red-500" />
                    <h3 className="text-lg font-semibold">
                      Elma Toplama Oyunu
                    </h3>
                  </div>
                  <div
                      onClick={() => setSelectedGame("piano")}
                      className={`flex cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border p-8 transition-all ${
                          selectedGame === "piano"
                              ? "border-primary ring-2 ring-primary"
                              : "hover:border-primary/50"
                      }`}
                  >
                    <Piano className="h-12 w-12 text-blue-500" />
                    <h3 className="text-lg font-semibold">Piyano Oyunu</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="flex justify-between">
              <Button variant="outline" onClick={handleBack}>Geri</Button>
              {selectedGame && <Button onClick={handleNext}>Devam</Button>}
            </div>
          </TabsContent>

          {/* ==================== NESNE YERLEŞİMİ (ELMA OYUNU) ==================== */}
          <TabsContent value="objects" className="animate-in fade-in-20 space-y-6 transition-opacity duration-300">
            {/* Not: ThreeDGrid ve ilgili state'lerin bu bileşende tanımlı olduğunu varsayıyorum */}
            <ThreeDGrid apples={apples} baskets={baskets} romLimit={selectedPatient?.romLimit ?? 0} />
            <div className="flex justify-between">
              <Button variant="outline" onClick={handleBack}>Geri</Button>
              <Button onClick={handleNext}>Devam</Button>
            </div>
          </TabsContent>

          {/* ==================== PARMAK SEÇİMİ (PİYANO OYUNU) ==================== */}
          <TabsContent value="finger-selection" className="animate-in fade-in-20 space-y-6 transition-opacity duration-300">
            <FingerSelection />
            <div className="flex justify-between">
              <Button variant="outline" onClick={handleBack}>Geri</Button>
              <Button onClick={handleNext}>Devam</Button>
            </div>
          </TabsContent>

          {/* ==================== ÖNİZLEME ==================== */}
          <TabsContent value="preview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Seans Önizleme</CardTitle>
                <CardDescription>Seans ayarlarını kontrol edip kaydedin.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p><span className="font-semibold">Hasta:</span> {selectedPatient?.name}</p>
                  <p><span className="font-semibold">Oyun:</span> {selectedGame === 'apple' ? 'Elma Toplama Oyunu' : 'Piyano Oyunu'}</p>
                  {/* Seçilen parmakları veya elmaları burada listeleyebilirsiniz */}
                </div>
              </CardContent>
            </Card>
            <div className="flex justify-between">
              <Button variant="outline" onClick={handleBack}>Geri</Button>
              <Button>Seansı Başlat</Button>
            </div>
          </TabsContent>

        </Tabs>
      </div>
  )
}