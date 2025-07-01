// src/components/performance-analytics/LevelSuccessRateChart.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function LevelSuccessRateChart() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Seviye Başarı Oranları</CardTitle>
                <CardDescription>Her seviyedeki ortalama başarı yüzdesi</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((level) => (
                        <div key={level} className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Seviye {level}</span>
                            <div className="flex items-center gap-2 w-36">
                                <Progress value={95 - level * 5} className="w-full h-2" />
                                <span className="text-sm font-medium w-12 text-right">{95 - level * 5}%</span>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}