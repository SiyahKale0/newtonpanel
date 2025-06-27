// src/components/session-creator.tsx

"use client"

// React ve hook'ları import ediyoruz
import React, { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Target, Zap, Grid3X3, Save, Play } from "lucide-react"
import type { DashboardPatient, DashboardBasket, DashboardTaskType, DifficultyConfig } from "@/types/dashboard"

// 3D Grid bileşenini import ediyoruz
import { ThreeDGrid } from "@/components/three-d-grid"

interface DashboardAppleType {
  id: number
  type: "fresh" | "rotten"
  position: { x: number; y: number; z: number }
  realDistance: number
}

export function SessionCreator() {
  // --- STATE TANIMLAMALARI ---
  const [selectedPatient, setSelectedPatient] = useState<string>("")
  const [sessionLevel, setSessionLevel] = useState<number>(1)
  const [difficulty, setDifficulty] = useState<string>("medium")
  const [duration, setDuration] = useState<number[]>([120])
  const [apples, setApples] = useState<DashboardAppleType[]>([])
  const [baskets, setBaskets] = useState<DashboardBasket[]>([])

  // --- SABİT VERİLER ---
  const patients: DashboardPatient[] = [
    { id: 1, name: "Mehmet Yılmaz", romLimit: 60 },
    { id: 2, name: "Fatma Demir", romLimit: 45 },
    { id: 3, name: "Ali Kaya", romLimit: 40 },
    { id: 4, name: "Zeynep Öz", romLimit: 55 },
  ] as DashboardPatient[]

  const taskTypes: DashboardTaskType[] = [
    { id: "touch", name: "Dokun", description: "Elmaya dokunarak düşür" },
    { id: "grab-hold", name: "Kavra-Tut", description: "Elmayı kavra ve bekle" },
    { id: "grab-drop", name: "Kavra-Bırak", description: "Elmayı kavra ve bırak" },
    { id: "drag", name: "Sürükle", description: "Elmayı sepete sürükle" },
    { id: "sort", name: "Ayır", description: "Sağlam/çürük ayrımı yap" },
  ] as DashboardTaskType[]

  const difficultyLevels: Record<string, DifficultyConfig> = {
    easy: { name: "Kolay", distance: 20, color: "text-green-600" },
    medium: { name: "Orta", distance: 40, color: "text-yellow-600" },
    hard: { name: "Zor", distance: 60, color: "text-red-600" },
  }

  // --- DÜZELTİLMİŞ KISIM: useMemo HOOK'U ---
  // Bu hook, state'lerden sonra ve return'den önce, component'in en üst seviyesinde olmalı.
  const selectedPatientData = useMemo(() => {
    // selectedPatient (string) ile patient.id (number) karşılaştırması için toString() kullanılıyor.
    return patients.find((p) => p.id.toString() === selectedPatient)
  }, [selectedPatient, patients]) // Bağımlılıklar: Bu hook sadece bu değerler değiştiğinde yeniden çalışır.

  // --- FONKSİYONLAR ---
  const addApple = (type: "fresh" | "rotten", x: number, y: number, z: number) => {
    const newApple: DashboardAppleType = {
      id: Date.now(),
      type,
      position: { x, y, z },
      realDistance: Math.sqrt(x * x + y * y + z * z) * 20,
    }
    setApples((prevApples) => [...prevApples, newApple])
  }

  const addBasket = (type: "fresh" | "rotten", x: number, y: number, z: number) => {
    const newBasket: DashboardBasket = {
      id: Date.now(),
      type,
      position: { x, y, z },
    }
    setBaskets((prevBaskets) => [...prevBaskets, newBasket])
  }

  // --- RENDER EDİLECEK JSX ---
  return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Yeni Rehabilitasyon Seansı Oluştur
            </CardTitle>
            <CardDescription>Hastanıza özel XR rehabilitasyon seansı tasarlayın</CardDescription>
          </CardHeader>
        </Card>

        <Tabs defaultValue="patient" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="patient">Hasta Seçimi</TabsTrigger>
            <TabsTrigger value="setup">Seans Ayarları</TabsTrigger>
            <TabsTrigger value="objects">Nesne Yerleşimi</TabsTrigger>
            <TabsTrigger value="preview">Önizleme</TabsTrigger>
          </TabsList>

          <TabsContent value="patient" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Hasta Seçimi ve ROM Kalibrasyonu</CardTitle>
                <CardDescription>Seans için hasta seçin ve ROM limitlerini kontrol edin</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="patient">Hasta Seçin</Label>
                  <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                    <SelectTrigger>
                      <SelectValue placeholder="Hasta seçin..." />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                          <SelectItem key={patient.id} value={patient.id.toString()}>
                            {patient.name} (ROM: {patient.romLimit}cm)
                          </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedPatientData && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">ROM Kalibrasyonu</h4>
                      <p className="text-sm text-blue-700">
                        Seçilen hasta için 1 koordinat birimi = 20cm olarak ayarlanmıştır.
                      </p>
                      <p className="text-sm text-blue-700">
                        Maksimum uzanım: {selectedPatientData.romLimit}cm (Grid
                        koordinatı: {selectedPatientData.romLimit / 20})
                      </p>
                    </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="setup" className="space-y-6">
            {/* Bu sekmenin içeriği önceki cevaplardaki gibi kalabilir, değişiklik yok */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Seviye Ayarları</CardTitle>
                  <CardDescription>Görev seviyesi ve zorluk derecesi</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Seviye: {sessionLevel}</Label>
                    <Slider
                        value={[sessionLevel]}
                        onValueChange={(value) => setSessionLevel(value[0])}
                        max={9}
                        min={1}
                        step={1}
                        className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="difficulty">Zorluk Derecesi</Label>
                    <Select value={difficulty} onValueChange={setDifficulty}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(difficultyLevels).map(([key, level]) => (
                            <SelectItem key={key} value={key}>
                              <span className={level.color}>{level.name}</span> - {level.distance}cm
                            </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Görev Süresi: {duration[0]} saniye</Label>
                    <Slider value={duration} onValueChange={setDuration} max={300} min={30} step={30} className="mt-2" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Görev Tipi</CardTitle>
                  <CardDescription>Hastanın yapacağı egzersiz türü</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {taskTypes.map((task) => (
                        <div key={task.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                          <input type="radio" name="taskType" id={task.id} className="w-4 h-4" />
                          <label htmlFor={task.id} className="flex-1 cursor-pointer">
                            <div className="font-medium">{task.name}</div>
                            <div className="text-sm text-muted-foreground">{task.description}</div>
                          </label>
                        </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="objects" className="space-y-6">
            {/* Bu sekmenin içeriği önceki cevaplardaki gibi kalabilir, değişiklik yok */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Grid3X3 className="w-5 h-5" />3D Koordinat Haritası
                  </CardTitle>
                  <CardDescription>Elma ve sepet yerleşimi için koordinatları belirleyin</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px] w-full rounded-lg overflow-hidden">
                    <ThreeDGrid apples={apples} baskets={baskets} romLimit={selectedPatientData?.romLimit ?? 0}/>
                  </div>
                  <div className="mt-4 space-y-2">
                    <Button variant="outline" size="sm" className="w-full" onClick={() => addApple("fresh", Math.round(Math.random() * 6 - 3), Math.round(Math.random() * 3), Math.round(Math.random() * 3))}>
                      <Grid3X3 className="w-4 h-4 mr-2" />Rastgele Sağlam Elma Ekle
                    </Button>
                    <Button variant="outline" size="sm" className="w-full" onClick={() => addApple("rotten", Math.round(Math.random() * 6 - 3), Math.round(Math.random() * 3), Math.round(Math.random() * 3))}>
                      <Grid3X3 className="w-4 h-4 mr-2" />Rastgele Çürük Elma Ekle
                    </Button>
                    <Button variant="outline" size="sm" className="w-full" onClick={() => addBasket("fresh", Math.round(Math.random() * 6 - 3), 0, Math.round(Math.random() * 3))}>
                      <Grid3X3 className="w-4 h-4 mr-2" />Rastgele Sepet Ekle
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Yerleştirilen Nesneler</CardTitle>
                  <CardDescription>Sahnedeki elma ve sepetlerin listesi</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Grid3X3 className="w-4 h-4" />Elmalar ({apples.length})</h4>
                      {apples.length === 0 ? (<p className="text-sm text-muted-foreground">Henüz elma eklenmedi</p>) : (
                          <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                            {apples.map((apple) => (
                                <div key={apple.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                  <div className="flex items-center gap-2">
                                    <Badge variant={apple.type === "fresh" ? "default" : "destructive"}>{apple.type === "fresh" ? "Sağlam" : "Çürük"}</Badge>
                                    <span className="text-sm font-mono">(x:{apple.position.x}, y:{apple.position.y}, z:{apple.position.z})</span>
                                    <span className="text-xs text-muted-foreground">{apple.realDistance.toFixed(0)}cm</span>
                                  </div>
                                  <Button variant="ghost" size="sm" onClick={() => setApples(apples.filter((a) => a.id !== apple.id))}>Sil</Button>
                                </div>))}
                          </div>)}
                    </div>
                    <div>
                      <h4 className="font-medium mb-2 flex items-center gap-2">
                        <Grid3X3 className="w-4 h-4" />Sepetler ({baskets.length})</h4>
                      {baskets.length === 0 ? (<p className="text-sm text-muted-foreground">Henüz sepet eklenmedi</p>) : (
                          <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                            {baskets.map((basket) => (
                                <div key={basket.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                  <div className="flex items-center gap-2">
                                    <Badge variant={basket.type === "fresh" ? "default" : "secondary"}>{basket.type === "fresh" ? "Sağlam" : "Çürük"}</Badge>
                                    <span className="text-sm font-mono">(x:{basket.position.x}, y:{basket.position.y}, z:{basket.position.z})</span>
                                  </div>
                                  <Button variant="ghost" size="sm" onClick={() => setBaskets(baskets.filter((b) => b.id !== basket.id))}>Sil</Button>
                                </div>))}
                          </div>)}
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <Button variant="outline" size="sm" className="w-full">
                      <Zap className="w-4 h-4 mr-2" />Otomatik Dağıtım
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            {/* Bu sekmenin içeriği önceki cevaplardaki gibi kalabilir, değişiklik yok */}
            <Card>
              <CardHeader>
                <CardTitle>Seans Önizlemesi</CardTitle>
                <CardDescription>Oluşturulan seansın özeti ve son kontroller</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{sessionLevel}</div>
                      <div className="text-sm text-blue-700">Seviye</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{duration[0]}s</div>
                      <div className="text-sm text-green-700">Süre</div>
                    </div>
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{apples.length}</div>
                      <div className="text-sm text-orange-700">Elma</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{baskets.length}</div>
                      <div className="text-sm text-purple-700">Sepet</div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <Button className="flex-1"><Save className="w-4 h-4 mr-2" />Seansı Kaydet</Button>
                    <Button variant="outline" className="flex-1"><Play className="w-4 h-4 mr-2" />Test Et</Button>
                  </div>
                  <div>
                    <Label htmlFor="notes">Seans Notları</Label>
                    <Textarea id="notes" placeholder="Bu seans hakkında notlarınızı yazın..." className="mt-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
  )
}