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
import { Badge } from "@/components/ui/badge"
import {
  Target,
  Search,
  ArrowUpDown,
  Piano,
  HandMetal,
  Trash2,
  Apple,
  ShoppingBasket
} from "lucide-react"

import { FingerSelection } from "./finger-selection"
// DashboardApple ve DashboardBasket tiplerini projenizin type dosyasından import ediyoruz
import type { DashboardPatient, DashboardApple, DashboardBasket } from "@/types/dashboard"
import { ThreeDGrid } from "./three-d-grid"

export function SessionCreator() {
  // --- STATE TANIMLAMALARI ---
  const [activeTab, setActiveTab] = useState("patient")
  const [selectedPatient, setSelectedPatient] = useState<DashboardPatient | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "name">("name")
  const [selectedGame, setSelectedGame] = useState<"apple" | "piano" | null>(null)

  // Nesne yerleşimi için state'ler
  const [apples, setApples] = useState<DashboardApple[]>([])
  const [baskets, setBaskets] = useState<DashboardBasket[]>([])

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

  const filteredAndSortedPatients = useMemo(() => {
    return patients
        .filter((patient) =>
            patient.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
          if (sortOrder === "asc") return a.age - b.age
          if (sortOrder === "desc") return b.age - a.age
          return a.name.localeCompare(b.name)
        })
  }, [patients, searchTerm, sortOrder])


  // --- FONKSİYONLAR ---
  const handleNext = () => {
    if (activeTab === "setup") {
      if (selectedGame === "apple") setActiveTab("objects")
      else if (selectedGame === "piano") setActiveTab("finger-selection")
    } else if (activeTab === "objects" || activeTab === "finger-selection") {
      setActiveTab("preview")
    } else if (activeTab === "patient" && selectedPatient) {
      setActiveTab("setup")
    }
  }

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

  const addRandomObject = (type: 'fresh' | 'rotten' | 'basket') => {
    const romGrid = (selectedPatient?.romLimit ?? 60) / 20;
    const x = parseFloat((Math.random() * romGrid * (Math.random() > 0.5 ? 1 : -1)).toFixed(1));
    const y = parseFloat((Math.random() * romGrid).toFixed(1));
    const z = parseFloat((Math.random() * romGrid * (Math.random() > 0.5 ? 1 : -1)).toFixed(1));

    if (type === 'basket') {
      const newBasket: DashboardBasket = { id: Date.now(), type: 'fresh', position: { x, y: 0, z } };
      setBaskets(prev => [...prev, newBasket]);
    } else {
      // DÜZELTME: `realDistance` alanı burada eklendi.
      const newApple: DashboardApple = {
        id: Date.now(),
        type,
        position: { x, y, z },
        realDistance: Math.sqrt(x * x + y * y + z * z) * 20
      };
      setApples(prev => [...prev, newApple]);
    }
  }

  const removeObject = (id: number, type: 'apple' | 'basket') => {
    if (type === 'apple') {
      setApples(apples.filter(a => a.id !== id));
    } else {
      setBaskets(baskets.filter(b => b.id !== id));
    }
  }

  // Bu fonksiyonlar diğer sekmelerin düzgün çalışması için gereklidir.
  // Gerçek içerikleri ilgili sekmelerde bulunmaktadır.
  const PatientSelectionTab = () => (
      <TabsContent value="patient" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Hasta Seçimi</CardTitle>
            <CardDescription>Seans için hasta arayın, sıralayın ve seçin.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input placeholder="Hasta adıyla ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
              </div>
              <Select onValueChange={(value: "asc" | "desc" | "name") => setSortOrder(value)} defaultValue="name">
                <SelectTrigger className="w-full sm:w-[180px]"> <ArrowUpDown className="mr-2 h-4 w-4" /> <SelectValue placeholder="Sırala" /> </SelectTrigger>
                <SelectContent> <SelectItem value="name">Ada Göre Sırala</SelectItem> <SelectItem value="asc">Yaşa Göre (Artan)</SelectItem> <SelectItem value="desc">Yaşa Göre (Azalan)</SelectItem> </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 pt-4">
              <Label>Hastalar</Label>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                {filteredAndSortedPatients.map((patient) => (
                    <Card key={patient.id} className={`cursor-pointer transition-all ${selectedPatient?.id === patient.id ? "border-primary ring-2 ring-primary" : "hover:border-primary/50"}`} onClick={() => setSelectedPatient(patient)}>
                      <CardContent className="p-4"> <h3 className="font-semibold">{patient.name}</h3> <p className="text-sm text-muted-foreground">Yaş: {patient.age} - ROM Limiti: {patient.romLimit}cm</p> </CardContent>
                    </Card>
                ))}
              </div>
              {filteredAndSortedPatients.length === 0 && <p className="text-center text-sm text-muted-foreground pt-4">Aramanızla eşleşen hasta bulunamadı.</p>}
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-end"><Button onClick={handleNext} disabled={!selectedPatient}>Devam</Button></div>
      </TabsContent>
  );
  const GameSelectionTab = () => (
      <TabsContent value="setup" className="space-y-6">
        <Card>
          <CardHeader> <CardTitle>Oyun Seçin</CardTitle> <CardDescription> Oynanacak rehabilitasyon oyununu seçin. </CardDescription> </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div onClick={() => setSelectedGame("apple")} className={`flex cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border p-8 transition-all ${selectedGame === "apple" ? "border-primary ring-2 ring-primary" : "hover:border-primary/50"}`}>
                <HandMetal className="h-12 w-12 text-red-500" /> <h3 className="text-lg font-semibold"> Elma Toplama Oyunu </h3>
              </div>
              <div onClick={() => setSelectedGame("piano")} className={`flex cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border p-8 transition-all ${selectedGame === "piano" ? "border-primary ring-2 ring-primary" : "hover:border-primary/50"}`}>
                <Piano className="h-12 w-12 text-blue-500" /> <h3 className="text-lg font-semibold">Piyano Oyunu</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-between"> <Button variant="outline" onClick={handleBack}>Geri</Button> {selectedGame && <Button onClick={handleNext}>Devam</Button>} </div>
      </TabsContent>
  );
  const PreviewTab = () => (
      <TabsContent value="preview" className="space-y-6">
        <Card>
          <CardHeader> <CardTitle>Seans Önizleme</CardTitle> <CardDescription>Seans ayarlarını kontrol edip kaydedin.</CardDescription> </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p><span className="font-semibold">Hasta:</span> {selectedPatient?.name}</p>
              <p><span className="font-semibold">Oyun:</span> {selectedGame === 'apple' ? 'Elma Toplama Oyunu' : 'Piyano Oyunu'}</p>
              {selectedGame === 'apple' && <p><span className="font-semibold">Nesne Sayısı:</span> {apples.length + baskets.length}</p>}
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-between"> <Button variant="outline" onClick={handleBack}>Geri</Button> <Button>Seansı Başlat</Button> </div>
      </TabsContent>
  )

  return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"> <Target className="h-5 w-5" /> Yeni Rehabilitasyon Seansı </CardTitle>
            <CardDescription> Hastanıza özel bir rehabilitasyon seansı oluşturmak için adımları takip edin. </CardDescription>
          </CardHeader>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="patient">1. Hasta Seçimi</TabsTrigger>
            <TabsTrigger value="setup" disabled={!selectedPatient}>2. Oyun Seçimi</TabsTrigger>
            <TabsTrigger value="objects" disabled={selectedGame !== "apple"}>3. Nesne Yerleşimi</TabsTrigger>
            <TabsTrigger value="finger-selection" disabled={selectedGame !== "piano"}>3. Parmak Seçimi</TabsTrigger>
            <TabsTrigger value="preview" disabled={!selectedGame}>4. Önizleme</TabsTrigger>
          </TabsList>

          <PatientSelectionTab />
          <GameSelectionTab />

          {/* ==================== NESNE YERLEŞİMİ (YENİ DÜZEN) ==================== */}
          <TabsContent value="objects" className="animate-in fade-in-20 space-y-6 transition-opacity duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
              {/* Sol Taraf: 3D GÖRSELLEŞTİRME */}
              <div className="lg:col-span-2 h-full">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>3D Yerleşim Alanı</CardTitle>
                    <CardDescription>Nesneleri 3D ortamda görüntüleyin.</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[calc(100%-80px)]">
                    <ThreeDGrid apples={apples} baskets={baskets} romLimit={selectedPatient?.romLimit ?? 0} />
                  </CardContent>
                </Card>
              </div>

              {/* Sağ Taraf: KONTROL PANELİ */}
              <div className="lg:col-span-1 h-full">
                <Card className="h-full flex flex-col">
                  <CardHeader>
                    <CardTitle>Kontrol Paneli</CardTitle>
                    <CardDescription>Nesne ekleyin ve konumlarını yönetin.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow space-y-4 overflow-y-auto p-4">
                    <div className="space-y-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <h4 className="font-semibold text-sm mb-2">Rastgele Nesne Ekle</h4>
                      <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => addRandomObject('fresh')}><Apple className="h-4 w-4 mr-2 text-green-600"/> Sağlam Elma</Button>
                      <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => addRandomObject('rotten')}><Apple className="h-4 w-4 mr-2 text-yellow-800"/> Çürük Elma</Button>
                      <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => addRandomObject('basket')}><ShoppingBasket className="h-4 w-4 mr-2"/> Sepet</Button>
                    </div>

                    <div className="space-y-3 pt-2">
                      <h4 className="font-semibold text-sm">Sahnedeki Nesneler ({apples.length + baskets.length})</h4>
                      <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2">
                        {apples.map(apple => (
                            <div key={apple.id} className="flex items-center justify-between p-2 text-xs border rounded-md">
                              <Badge className={apple.type === 'fresh' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>{apple.type === 'fresh' ? 'Sağlam' : 'Çürük'}</Badge>
                              <code className="text-muted-foreground">X:{apple.position.x} Y:{apple.position.y} Z:{apple.position.z}</code>
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeObject(apple.id, 'apple')}><Trash2 className="h-3 w-3"/></Button>
                            </div>
                        ))}
                        {baskets.map(basket => (
                            <div key={basket.id} className="flex items-center justify-between p-2 text-xs border rounded-md">
                              <Badge variant="secondary">Sepet</Badge>
                              <code className="text-muted-foreground">X:{basket.position.x} Y:{basket.position.y} Z:{basket.position.z}</code>
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeObject(basket.id, 'basket')}><Trash2 className="h-3 w-3"/></Button>
                            </div>
                        ))}
                        {(apples.length + baskets.length) === 0 && <p className="text-center text-xs text-muted-foreground pt-4">Sahneye nesne ekleyin.</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={handleBack}>Geri</Button>
              <Button onClick={handleNext}>Devam</Button>
            </div>
          </TabsContent>

          <TabsContent value="finger-selection" className="animate-in fade-in-20 space-y-6 transition-opacity duration-300">
            <FingerSelection />
            <div className="flex justify-between mt-6"> <Button variant="outline" onClick={handleBack}>Geri</Button> <Button onClick={handleNext}>Devam</Button> </div>
          </TabsContent>

          <PreviewTab />
        </Tabs>
      </div>
  )
}