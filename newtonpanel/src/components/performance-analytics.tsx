"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart3, TrendingUp, Clock, Target, Download, Calendar } from "lucide-react"

export function PerformanceAnalytics() {
  const performanceData = [
    {
      patient: "Mehmet Yılmaz",
      sessions: 12,
      avgTouchTime: 2.3,
      avgGrabTime: 1.8,
      avgCarryTime: 3.2,
      avgDropTime: 1.1,
      successRate: 85,
      improvement: "+15%",
    },
    {
      patient: "Fatma Demir",
      sessions: 8,
      avgTouchTime: 1.9,
      avgGrabTime: 1.5,
      avgCarryTime: 2.8,
      avgDropTime: 0.9,
      successRate: 92,
      improvement: "+22%",
    },
    {
      patient: "Ali Kaya",
      sessions: 15,
      avgTouchTime: 2.8,
      avgGrabTime: 2.2,
      avgCarryTime: 3.8,
      avgDropTime: 1.4,
      successRate: 78,
      improvement: "+8%",
    },
    {
      patient: "Zeynep Öz",
      sessions: 6,
      avgTouchTime: 2.1,
      avgGrabTime: 1.7,
      avgCarryTime: 3.0,
      avgDropTime: 1.0,
      successRate: 88,
      improvement: "+18%",
    },
  ]

  const weeklyProgress = [
    { week: "Hafta 1", sessions: 15, avgScore: 72 },
    { week: "Hafta 2", sessions: 18, avgScore: 78 },
    { week: "Hafta 3", sessions: 22, avgScore: 83 },
    { week: "Hafta 4", sessions: 20, avgScore: 87 },
  ]

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex gap-4">
          <Select defaultValue="all">
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Hastalar</SelectItem>
              <SelectItem value="mehmet">Mehmet Yılmaz</SelectItem>
              <SelectItem value="fatma">Fatma Demir</SelectItem>
              <SelectItem value="ali">Ali Kaya</SelectItem>
              <SelectItem value="zeynep">Zeynep Öz</SelectItem>
            </SelectContent>
          </Select>
          <Select defaultValue="month">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Bu Hafta</SelectItem>
              <SelectItem value="month">Bu Ay</SelectItem>
              <SelectItem value="quarter">3 Ay</SelectItem>
              <SelectItem value="year">Bu Yıl</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Rapor İndir
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="detailed">Detaylı Analiz</TabsTrigger>
          <TabsTrigger value="progress">İlerleme Takibi</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Performance Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Ortalama Dokunma</p>
                    <p className="text-2xl font-bold">2.3s</p>
                  </div>
                  <div className="p-3 rounded-lg bg-blue-50">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Ortalama Kavrama</p>
                    <p className="text-2xl font-bold">1.8s</p>
                  </div>
                  <div className="p-3 rounded-lg bg-green-50">
                    <Clock className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Ortalama Taşıma</p>
                    <p className="text-2xl font-bold">3.1s</p>
                  </div>
                  <div className="p-3 rounded-lg bg-orange-50">
                    <BarChart3 className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Başarı Oranı</p>
                    <p className="text-2xl font-bold">86%</p>
                  </div>
                  <div className="p-3 rounded-lg bg-purple-50">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Patient Performance Table */}
          <Card>
            <CardHeader>
              <CardTitle>Hasta Performans Özeti</CardTitle>
              <CardDescription>Tüm hastaların performans metrikleri ve gelişim durumu</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Hasta</th>
                      <th className="text-left p-2">Seans</th>
                      <th className="text-left p-2">Dokunma</th>
                      <th className="text-left p-2">Kavrama</th>
                      <th className="text-left p-2">Taşıma</th>
                      <th className="text-left p-2">Bırakma</th>
                      <th className="text-left p-2">Başarı</th>
                      <th className="text-left p-2">Gelişim</th>
                    </tr>
                  </thead>
                  <tbody>
                    {performanceData.map((data, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-2 font-medium">{data.patient}</td>
                        <td className="p-2">{data.sessions}</td>
                        <td className="p-2">{data.avgTouchTime}s</td>
                        <td className="p-2">{data.avgGrabTime}s</td>
                        <td className="p-2">{data.avgCarryTime}s</td>
                        <td className="p-2">{data.avgDropTime}s</td>
                        <td className="p-2">
                          <div className="flex items-center gap-2">
                            <Progress value={data.successRate} className="w-16 h-2" />
                            <span className="text-sm">{data.successRate}%</span>
                          </div>
                        </td>
                        <td className="p-2">
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            {data.improvement}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Time Analysis Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Zaman Analizi</CardTitle>
                <CardDescription>Görev türlerine göre ortalama süre dağılımı</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Dokunma Süresi</span>
                    <div className="flex items-center gap-2">
                      <Progress value={60} className="w-24 h-2" />
                      <span className="text-sm font-medium">2.3s</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Kavrama Süresi</span>
                    <div className="flex items-center gap-2">
                      <Progress value={45} className="w-24 h-2" />
                      <span className="text-sm font-medium">1.8s</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Taşıma Süresi</span>
                    <div className="flex items-center gap-2">
                      <Progress value={80} className="w-24 h-2" />
                      <span className="text-sm font-medium">3.1s</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Bırakma Süresi</span>
                    <div className="flex items-center gap-2">
                      <Progress value={30} className="w-24 h-2" />
                      <span className="text-sm font-medium">1.1s</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Success Rate by Level */}
            <Card>
              <CardHeader>
                <CardTitle>Seviye Başarı Oranları</CardTitle>
                <CardDescription>Her seviyedeki ortalama başarı yüzdesi</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div key={level} className="flex items-center justify-between">
                      <span className="text-sm">Seviye {level}</span>
                      <div className="flex items-center gap-2">
                        <Progress value={95 - level * 5} className="w-24 h-2" />
                        <span className="text-sm font-medium">{95 - level * 5}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Haftalık İlerleme</CardTitle>
              <CardDescription>Son 4 haftadaki seans sayısı ve ortalama skor gelişimi</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {weeklyProgress.map((week, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{week.week}</p>
                        <p className="text-sm text-muted-foreground">{week.sessions} seans</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">{week.avgScore}</p>
                      <p className="text-sm text-muted-foreground">Ortalama Skor</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
