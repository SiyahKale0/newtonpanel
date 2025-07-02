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
import { Settings, UserPlus, MonitorSmartphone, Target, LogOut, Users } from "lucide-react"

const menuItems = [
  { title: "Doktor Ekle", icon: UserPlus, id: "add-doctor" },
  { title: "Cihaz Ekle", icon: MonitorSmartphone, id: "add-device" },
  { title: "Doktor Listele", icon: Users, id: "list-doctors" }, // ✅ yeni eklendi
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
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                İsim
              </label>
              <input
                type="text"
                name="firstName"
                id="firstName"
                placeholder="Dr. Ayşe"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Soyisim
              </label>
              <input
                type="text"
                name="lastName"
                id="lastName"
                placeholder="Kaya"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                E-posta
              </label>
              <input
                type="email"
                name="email"
                id="email"
                placeholder="ayse.kaya@example.com"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="specialization" className="block text-sm font-medium text-gray-700">
                Uzmanlık Alanı
              </label>
              <input
                type="text"
                name="specialization"
                id="specialization"
                placeholder="Fizyoterapi"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Doktor Ekle
              </button>
            </div>
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
              <label htmlFor="deviceName" className="block text-sm font-medium text-gray-700">
                Cihaz Adı
              </label>
              <input
                type="text"
                name="deviceName"
                id="deviceName"
                placeholder="XR-1000"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="deviceId" className="block text-sm font-medium text-gray-700">
                Cihaz ID’si
              </label>
              <input
                type="text"
                name="deviceId"
                id="deviceId"
                placeholder="ABC12345"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="inline-flex justify-center rounded-md border border-transparent bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                Cihaz Ekle
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    )
  }

  function DoctorList() {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Doktor Listesi</CardTitle>
          <CardDescription>Sistemde kayıtlı tüm doktorlar</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="border p-2 rounded">Dr. Ayşe Kaya - Fizyoterapi</li>
            <li className="border p-2 rounded">Dr. Mehmet Yılmaz - Ortopedi</li>
            <li className="border p-2 rounded">Dr. Zeynep Demir - Nöroloji</li>
          </ul>
        </CardContent>
      </Card>
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
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                Mevcut Şifre
              </label>
              <input
                type="password"
                name="currentPassword"
                id="currentPassword"
                placeholder="********"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                Yeni Şifre
              </label>
              <input
                type="password"
                name="newPassword"
                id="newPassword"
                placeholder="Yeni şifrenizi girin"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Yeni Şifre (Tekrar)
              </label>
              <input
                type="password"
                name="confirmPassword"
                id="confirmPassword"
                placeholder="Yeni şifreyi tekrar girin"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="inline-flex justify-center rounded-md border border-transparent bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                Şifreyi Güncelle
              </button>
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
            {activeTab === "add-device" && <DeviceAdder />}
            {activeTab === "list-doctors" && <DoctorList />}
            {activeTab === "settings" && <SettingsPanel />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
