// src/components/dashboard-overview/TopPerformers.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp } from "lucide-react";

const topPerformers = [
    { name: "Fatma Demir", improvement: "+15%", sessions: 12 },
    { name: "Mehmet Yılmaz", improvement: "+12%", sessions: 8 },
    { name: "Zeynep Öz", improvement: "+10%", sessions: 15 },
];

export function TopPerformers() {
    return (
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
                                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{index + 1}</span>
                                </div>
                                <div>
                                    <p className="font-medium">{performer.name}</p>
                                    <p className="text-sm text-muted-foreground">{performer.sessions} seans</p>
                                </div>
                            </div>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700/50">
                                {performer.improvement}
                            </Badge>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}