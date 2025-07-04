// src/components/performance-analytics/PatientPerformanceTable.tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { performanceData } from "./data"; // Veriyi ayrı bir dosyadan alacağız

export function PatientPerformanceTable() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Hasta Performans Özeti</CardTitle>
                <CardDescription>Tüm hastaların performans metrikleri ve gelişim durumu</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b bg-gray-50 dark:bg-gray-800/50">
                                <th className="text-left p-4 font-medium">Hasta</th>
                                <th className="text-left p-4 font-medium">Seans</th>
                                <th className="text-left p-4 font-medium">Dokunma (s)</th>
                                <th className="text-left p-4 font-medium">Kavrama (s)</th>
                                <th className="text-left p-4 font-medium">Taşıma (s)</th>
                                <th className="text-left p-4 font-medium">Bırakma (s)</th>
                                <th className="text-left p-4 font-medium">Başarı Oranı</th>
                                <th className="text-left p-4 font-medium">İyileşme</th>
                            </tr>
                        </thead>
                        <tbody>
                        {performanceData.map((data, index) => (
                            <tr key={index} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <td className="p-4 font-medium">{data.patient}</td>
                                <td className="p-4 text-muted-foreground">{data.sessions}</td>
                                <td className="p-4 text-muted-foreground">{data.avgTouchTime}s</td>
                                <td className="p-4 text-muted-foreground">{data.avgGrabTime}s</td>
                                <td className="p-4 text-muted-foreground">{data.avgCarryTime}s</td>
                                <td className="p-4 text-muted-foreground">{data.avgDropTime}s</td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <Progress value={data.successRate} className="w-16 h-2" />
                                        <span className="text-sm font-medium">{data.successRate}%</span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <Badge 
                                        variant="outline" 
                                        className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700/50"
                                    >
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
    );
}