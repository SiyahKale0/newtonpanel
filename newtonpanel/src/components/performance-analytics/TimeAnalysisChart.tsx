// src/components/performance-analytics/TimeAnalysisChart.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const timeData = [
    { label: "Dokunma Süresi", value: 2.3, progress: 60 },
    { label: "Kavrama Süresi", value: 1.8, progress: 45 },
    { label: "Taşıma Süresi", value: 3.1, progress: 80 },
    { label: "Bırakma Süresi", value: 1.1, progress: 30 },
]

export function TimeAnalysisChart() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Zaman Analizi</CardTitle>
                <CardDescription>Görev türlerine göre ortalama süre dağılımı</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {timeData.map(item => (
                        <div key={item.label} className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">{item.label}</span>
                            <div className="flex items-center gap-2 w-36">
                                <Progress value={item.progress} className="w-full h-2" />
                                <span className="text-sm font-medium w-12 text-right">{item.value}s</span>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}