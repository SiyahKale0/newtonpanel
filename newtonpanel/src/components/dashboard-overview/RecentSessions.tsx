// src/components/dashboard-overview/RecentSessions.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";

const recentSessions = [
    { patient: "Mehmet Yılmaz", level: 3, score: 85, duration: "14dk", status: "completed" as const },
    { patient: "Fatma Demir", level: 5, score: 92, duration: "11dk", status: "completed" as const },
    { patient: "Ali Kaya", level: 2, score: 78, duration: "16dk", status: "in-progress" as const },
    { patient: "Zeynep Öz", level: 4, score: 88, duration: "13dk", status: "completed" as const },
];

export function RecentSessions() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Son Seanslar
                </CardTitle>
                <CardDescription>Bugün gerçekleştirilen rehabilitasyon seansları</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {recentSessions.map((session, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg">
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
                                className={session.status === "completed" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : ""}
                            >
                                {session.status === "completed" ? "Tamamlandı" : "Devam Ediyor"}
                            </Badge>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}