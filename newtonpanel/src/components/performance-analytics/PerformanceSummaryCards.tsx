// src/components/performance-analytics/PerformanceSummaryCards.tsx
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, TrendingUp, Clock, Target } from "lucide-react";

const summaryData = [
    { title: "Ortalama Dokunma", value: "2.3s", Icon: Target, color: "blue" },
    { title: "Ortalama Kavrama", value: "1.8s", Icon: Clock, color: "green" },
    { title: "Ortalama Taşıma", value: "3.1s", Icon: BarChart3, color: "orange" },
    { title: "Başarı Oranı", value: "86%", Icon: TrendingUp, color: "purple" }
];

export function PerformanceSummaryCards() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {summaryData.map((item, index) => (
                <Card key={index}>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{item.title}</p>
                                <p className="text-2xl font-bold">{item.value}</p>
                            </div>
                            <div className={`p-3 rounded-lg bg-${item.color}-50`}>
                                <item.Icon className={`w-6 h-6 text-${item.color}-600`} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}