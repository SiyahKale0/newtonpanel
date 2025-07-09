"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { deleteCookie } from "cookies-next"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, UserPlus, MonitorSmartphone, Target, LogOut, Users, Loader2 } from "lucide-react"
import { DoctorCard, Doctor } from "@/components/doctor-management/DoctorCard"
import { createPatient } from "@/services/patientService"

const menuItems = [
  { title: "Doktor Ekle", icon: UserPlus, id: "add-doctor" },
  { title: "Hasta Ekle", icon: Users, id: "add-patient" },
  { title: "Cihaz Ekle", icon: MonitorSmartphone, id: "add-device" },
  { title: "Doktor Listele", icon: Users, id: "list-doctors" },
  { title: "Ayarlar", icon: Settings, id: "settings" },
]

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("add-doctor")
  const router = useRouter()

  const handleLogout = () => {
    deleteCookie("auth-token", { path: "/" })
    router.push("/login")
  }

  function DoctorAdder() {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Doktor Ekle</CardTitle>
          <CardDescription>Yeni doktor hesabı oluşturun</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div>
              <label htmlFor="doctorName" className="block text-sm font-medium text-gray-700">Doktor Adı</label>
              <Input id="doctorName" placeholder="Dr. Ayşe Kaya" />
            </div>

            <div>
              <label htmlFor="specialization" className="block text-sm font-medium text-gray-700">Uzmanlık Alanı</label>
              <Input id="specialization" placeholder="Fizyoterapi" />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-posta</label>
              <Input id="email" type="email" placeholder="ayse.kaya@example.com" />
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full">Doktor Ekle</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    )
  }

  function PatientAdder() {
    const [name, setName] = useState("")
    const [age, setAge] = useState("")
    const [diagnosis, setDiagnosis] = useState("")
    const [gender, setGender] = useState<"male" | "female" | "">("")
    const [notes, setNotes] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const resetForm = () => {
      setName("")
      setAge("")
      setDiagnosis("")
      setGender("")
      setNotes("")
      setIsSubmitting(false)
    }

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()
      setIsSubmitting(true)

      if (!name || !age || !diagnosis || !gender) {
        alert("Lütfen tüm zorunlu alanları doldurun.")
        setIsSubmitting(false)
        return
      }

      try {
        const newPatientData = {
          name,
          age: parseInt(age, 10),
          diagnosis,
          isFemale: gender === "female",
          note: notes,
          customGames: { appleGame: "", fingerDance: "" },
          devices: [],
          romID: "",
          sessionCount: 0,
          sessions: {},
        }

        await createPatient(newPatientData)
        alert("Hasta başarıyla kaydedildi!")
        resetForm()
      } catch (error) {
        console.error("Hasta kaydedilirken hata oluştu:", error)
        alert("Hasta kaydedilirken bir hata oluştu. Lütfen konsolu kontrol edin.")
        setIsSubmitting(false)
      }
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>Hasta Ekle</CardTitle>
          <CardDescription>Yeni hasta kaydı oluşturun</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Ad Soyad</Label>
              <Input id="name" placeholder="Hastanın tam adı" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="age">Yaş</Label>
                <Input id="age" type="number" placeholder="Örn: 45" value={age} onChange={(e) => setAge(e.target.value)} required />
              </div>

              <div>
                <Label htmlFor="gender">Cinsiyet</Label>
                <Select value={gender} onValueChange={(value: "male" | "female" | "") => setGender(value)} required>
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Cinsiyet seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="female">Kadın</SelectItem>
                    <SelectItem value="male">Erkek</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="diagnosis">Teşhis</Label>
              <Input id="diagnosis" placeholder="Teşhis bilgisi" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} required />
            </div>

            <div>
              <Label htmlFor="notes">Notlar</Label>
              <Textarea id="notes" placeholder="Hasta hakkında ek notlar..." value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                "Hastayı Kaydet"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    )
  }

  function DeviceAdder() {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cihaz Ekle</CardTitle>
          <CardDescription>Yeni XR cihazını sisteme ekleyin</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div>
              <label htmlFor="deviceName" className="block text-sm font-medium text-gray-700">Cihaz Adı</label>
              <Input id="deviceName" placeholder="XR-1000" />
            </div>

            <div>
              <label htmlFor="deviceId" className="block text-sm font-medium text-gray-700">Cihaz ID</label>
              <Input id="deviceId" placeholder="ABC12345" />
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full">Cihaz Ekle</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    )
  }

  function DoctorList() {
    const doctors: Doctor[] = [
      {
        id: "1",
        name: "Dr. Ayşe Kaya",
        specialization: "Fizyoterapi",
        email: "ayse.kaya@example.com",
        status: "active",
      },
    ]

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {doctors.map((doctor) => (
          <DoctorCard key={doctor.id} doctor={doctor} />
        ))}
      </div>
    )
  }

  function SettingsPanel() {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sistem Ayarları</CardTitle>
          <CardDescription>Yönetici şifrenizi güncelleyin</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4 max-w-md">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">Mevcut Şifre</label>
              <Input id="currentPassword" type="password" placeholder="********" />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">Yeni Şifre</label>
              <Input id="newPassword" type="password" placeholder="Yeni şifrenizi girin" />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Yeni Şifre (Tekrar)</label>
              <Input id="confirmPassword" type="password" placeholder="Yeni şifreyi tekrar girin" />
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full">Şifreyi Güncelle</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    )
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50">
        <Sidebar className="border-r">
          <SidebarHeader className="p-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <Target className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">Admin Paneli</h2>
                <p className="text-sm text-muted-foreground">Yönetici Kontrol Merkezi</p>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => setActiveTab(item.id)}
                    isActive={activeTab === item.id}
                    className="w-full justify-start"
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <div className="flex-1">
          <header className="bg-white border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {menuItems.find((item) => item.id === activeTab)?.title}
                  </h1>
                  <p className="text-sm text-gray-600">Admin Yönetim Paneli</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  Admin Girişi
                </Badge>
                <Button variant="outline" size="sm">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Admin Kullanıcı
                </Button>
                <Button variant="destructive" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Çıkış Yap
                </Button>
              </div>
            </div>
          </header>

          <main className="p-6">
            {activeTab === "add-doctor" && <DoctorAdder />}
            {activeTab === "add-patient" && <PatientAdder />}
            {activeTab === "add-device" && <DeviceAdder />}
            {activeTab === "list-doctors" && <DoctorList />}
            {activeTab === "settings" && <SettingsPanel />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
