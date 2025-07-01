// src/components/dashboard-overview/QuickActions.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Calendar, Target, Plus } from "lucide-react";

export function QuickActions() {
    return (
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
    );
}