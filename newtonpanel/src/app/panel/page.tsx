"use client"

import { useState } from "react"
import { useRouter } from 'next/navigation'
import { deleteCookie } from 'cookies-next'
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
import { Users, Activity, Settings, BarChart3, Plus, User, Target, SlidersHorizontal, LogOut } from "lucide-react"
import { PatientManagement } from "@/components/patient-management"
import { SessionCreator } from "@/components/session-creator"
import { PerformanceAnalytics } from "@/components/performance-analytics"
import { DashboardOverview } from "@/components/dashboard-overview"
import { DeviceManagement } from "@/components/device-management"

const menuItems = [
  { title: "Genel Bakış", icon: BarChart3, id: "overview" },
  { title: "Hasta Yönetimi", icon: Users, id: "patients" },
  { title: "Seans Oluştur", icon: Plus, id: "create-session" },
  { title: "Performans Analizi", icon: Activity, id: "analytics" },
  { title: "Cihaz Yönetimi", icon: SlidersHorizontal, id: "devices" },
  { title: "Ayarlar", icon: Settings, id: "settings" },
]

export default function PhysioXRDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const router = useRouter()

  const handleLogout = () => {
    deleteCookie('auth-token', { path: '/' });
    router.push('/login');
  }

  return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-gray-50">
          <Sidebar className="border-r">
            <SidebarHeader className="p-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Target className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg">PhysioXR</h2>
                  <p className="text-sm text-muted-foreground">Rehabilitasyon Merkezi</p>
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
                    <p className="text-sm text-gray-600">XR Rehabilitasyon Yönetim Paneli</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Sistem Aktif
                  </Badge>

                  <Button variant="outline" size="sm" disabled>
                    <User className="w-4 h-4 mr-2" />
                    Dr. Ayşe Kaya
                  </Button>

                  <Button variant="destructive" size="sm" onClick={handleLogout}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Çıkış Yap
                  </Button>

                </div>
              </div>
            </header>

            <main className="p-6">
              {activeTab === "overview" && <DashboardOverview />}
              {activeTab === "patients" && <PatientManagement />}
              {activeTab === "create-session" && <SessionCreator />}
              {activeTab === "analytics" && <PerformanceAnalytics />}
              {activeTab === "devices" && <DeviceManagement />}
              {activeTab === "settings" && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Sistem Ayarları</CardTitle>
                      <CardDescription>XR cihaz bağlantıları ve sistem konfigürasyonu</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">Ayarlar paneli geliştiriliyor...</p>
                    </CardContent>
                  </Card>
              )}
            </main>
          </div>
        </div>
      </SidebarProvider>
  )
}