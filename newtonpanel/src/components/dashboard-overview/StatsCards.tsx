// src/components/dashboard-overview/StatsCards.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Users, Activity, Clock, TrendingUp } from "lucide-react";

const todayStats = [
    { label: "Aktif Hastalar", value: "24", icon: Users, color: "blue" },
    { label: "Tamamlanan Seanslar", value: "18", icon: Activity, color: "green" },
    { label: "Ortalama Seans Süresi", value: "12dk", icon: Clock, color: "orange" },
    { label: "Başarı Oranı", value: "87%", icon: TrendingUp, color: "purple" },
];

export function StatsCards() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {todayStats.map((stat, index) => (
                <Card key={index}>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                                <p className="text-2xl font-bold">{stat.value}</p>
                            </div>
                            <div className={`p-3 rounded-lg bg-${stat.color}-50 dark:bg-${stat.color}-900/20`}>
                                <stat.icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}