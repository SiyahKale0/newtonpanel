// src/components/performance-analytics/WeeklyProgressChart.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { weeklyProgress } from "./data";

export function WeeklyProgressChart() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Haftalık İlerleme</CardTitle>
                <CardDescription>Son 4 haftadaki seans sayısı ve ortalama skor gelişimi</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {weeklyProgress.map((week, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                    <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="font-medium">{week.week}</p>
                                    <p className="text-sm text-muted-foreground">{week.sessions} seans</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-green-600 dark:text-green-400">{week.avgScore}</p>
                                <p className="text-sm text-muted-foreground">Ortalama Skor</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}