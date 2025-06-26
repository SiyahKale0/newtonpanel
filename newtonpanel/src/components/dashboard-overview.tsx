"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Activity, Clock, TrendingUp, Calendar, Target, Plus } from "lucide-react"

export function DashboardOverview() {
  const todayStats = [
    { label: "Aktif Hastalar", value: "24", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Tamamlanan Seanslar", value: "18", icon: Activity, color: "text-green-600", bg: "bg-green-50" },
    { label: "Ortalama Seans Süresi", value: "12dk", icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Başarı Oranı", value: "87%", icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-50" },
  ]

  const recentSessions = [
    { patient: "Mehmet Yılmaz", level: 3, score: 85, duration: "14dk", status: "completed" },
    { patient: "Fatma Demir", level: 5, score: 92, duration: "11dk", status: "completed" },
    { patient: "Ali Kaya", level: 2, score: 78, duration: "16dk", status: "in-progress" },
    { patient: "Zeynep Öz", level: 4, score: 88, duration: "13dk", status: "completed" },
  ]

  const topPerformers = [
    { name: "Fatma Demir", improvement: "+15%", sessions: 12 },
    { name: "Mehmet Yılmaz", improvement: "+12%", sessions: 8 },
    { name: "Zeynep Öz", improvement: "+10%", sessions: 15 },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {todayStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Son Seanslar
            </CardTitle>
            <CardDescription>Bugün gerçekleştirilen rehabilitasyon seansları</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSessions.map((session, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{session.patient}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Seviye {session.level}</span>
                      <span>Skor: {session.score}</span>
                      <span>{session.duration}</span>
                    </div>
                  </div>
                  <Badge
                    variant={session.status === "completed" ? "default" : "secondary"}
                    className={session.status === "completed" ? "bg-green-100 text-green-800" : ""}
                  >
                    {session.status === "completed" ? "Tamamlandı" : "Devam Ediyor"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              En İyi Performans
            </CardTitle>
            <CardDescription>Bu hafta en çok gelişim gösteren hastalar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPerformers.map((performer, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium">{performer.name}</p>
                      <p className="text-sm text-muted-foreground">{performer.sessions} seans</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {performer.improvement}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Hızlı İşlemler
          </CardTitle>
          <CardDescription>Sık kullanılan işlemler için kısayollar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-20 flex-col gap-2" variant="outline">
              <Plus className="w-6 h-6" />
              <span>Yeni Seans Oluştur</span>
            </Button>
            <Button className="h-20 flex-col gap-2" variant="outline">
              <Users className="w-6 h-6" />
              <span>Hasta Ekle</span>
            </Button>
            <Button className="h-20 flex-col gap-2" variant="outline">
              <Calendar className="w-6 h-6" />
              <span>Randevu Planla</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
