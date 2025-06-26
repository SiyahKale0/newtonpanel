"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Search, Plus, Edit, Eye, User, Calendar } from "lucide-react"

export function PatientManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPatient, setSelectedPatient] = useState(null)

  const patients = [
    {
      id: 1,
      name: "Mehmet Yılmaz",
      age: 45,
      diagnosis: "Omuz Çıkığı Rehabilitasyonu",
      arm: "Sağ",
      romLimit: 60,
      lastSession: "2024-01-15",
      totalSessions: 12,
      avgScore: 85,
      improvement: "+15%",
      status: "active",
    },
    {
      id: 2,
      name: "Fatma Demir",
      age: 38,
      diagnosis: "Dirsek Tendiniti",
      arm: "Sol",
      romLimit: 45,
      lastSession: "2024-01-14",
      totalSessions: 8,
      avgScore: 92,
      improvement: "+22%",
      status: "active",
    },
    {
      id: 3,
      name: "Ali Kaya",
      age: 52,
      diagnosis: "Rotator Cuff Yaralanması",
      arm: "Sağ",
      romLimit: 40,
      lastSession: "2024-01-13",
      totalSessions: 15,
      avgScore: 78,
      improvement: "+8%",
      status: "paused",
    },
    {
      id: 4,
      name: "Zeynep Öz",
      age: 29,
      diagnosis: "Bilek Kırığı Sonrası",
      arm: "Sol",
      romLimit: 55,
      lastSession: "2024-01-15",
      totalSessions: 6,
      avgScore: 88,
      improvement: "+18%",
      status: "active",
    },
  ]

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      {/* Header with Search and Add Patient */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Hasta ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Yeni Hasta Ekle
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Yeni Hasta Ekle</DialogTitle>
              <DialogDescription>Yeni hasta bilgilerini girin</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Ad Soyad</Label>
                <Input id="name" placeholder="Hasta adı" />
              </div>
              <div>
                <Label htmlFor="age">Yaş</Label>
                <Input id="age" type="number" placeholder="Yaş" />
              </div>
              <div>
                <Label htmlFor="diagnosis">Teşhis</Label>
                <Input id="diagnosis" placeholder="Teşhis bilgisi" />
              </div>
              <div>
                <Label htmlFor="arm">Egzersiz Kolu</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Kol seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="right">Sağ</SelectItem>
                    <SelectItem value="left">Sol</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="rom">ROM Limiti (cm)</Label>
                <Input id="rom" type="number" placeholder="60" />
              </div>
              <div>
                <Label htmlFor="notes">Notlar</Label>
                <Textarea id="notes" placeholder="Ek notlar..." />
              </div>
              <Button className="w-full">Hasta Ekle</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPatients.map((patient) => (
          <Card key={patient.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    {patient.name}
                  </CardTitle>
                  <CardDescription>{patient.diagnosis}</CardDescription>
                </div>
                <Badge
                  variant={patient.status === "active" ? "default" : "secondary"}
                  className={patient.status === "active" ? "bg-green-100 text-green-800" : ""}
                >
                  {patient.status === "active" ? "Aktif" : "Durduruldu"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Patient Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Yaş:</span>
                    <span className="ml-2 font-medium">{patient.age}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Kol:</span>
                    <span className="ml-2 font-medium">{patient.arm}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">ROM Limiti:</span>
                    <span className="ml-2 font-medium">{patient.romLimit} cm</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Son Seans:</span>
                    <span className="ml-2 font-medium">{patient.lastSession}</span>
                  </div>
                </div>

                {/* Performance Stats */}
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-lg font-bold text-blue-600">{patient.totalSessions}</p>
                      <p className="text-xs text-muted-foreground">Toplam Seans</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-green-600">{patient.avgScore}</p>
                      <p className="text-xs text-muted-foreground">Ortalama Skor</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-purple-600">{patient.improvement}</p>
                      <p className="text-xs text-muted-foreground">Gelişim</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="w-4 h-4 mr-2" />
                    Detaylar
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Edit className="w-4 h-4 mr-2" />
                    Düzenle
                  </Button>
                  <Button size="sm" className="flex-1">
                    <Calendar className="w-4 h-4 mr-2" />
                    Seans Oluştur
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPatients.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900">Hasta bulunamadı</p>
            <p className="text-gray-600">Arama kriterlerinizi değiştirin veya yeni hasta ekleyin</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
