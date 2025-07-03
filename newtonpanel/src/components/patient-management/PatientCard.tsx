import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Calendar, Eye, Edit } from "lucide-react";
import type { DashboardPatient } from "@/types/dashboard";

interface PatientCardProps {
    patient: DashboardPatient;
    onEdit: () => void;
    onShowDetails: () => void;
}

export function PatientCard({ patient, onEdit, onShowDetails }: PatientCardProps) {
    const statusVariant = patient.status === "active" ? "default" : "secondary";
    const statusClass = patient.status === "active" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : "";

    return (
        <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5" />
                            {patient.name}
                        </CardTitle>
                        <CardDescription>{patient.diagnosis}</CardDescription>
                    </div>
                    <Badge variant={statusVariant} className={statusClass}>
                        {patient.status === "active" ? "Aktif" : "Durduruldu"}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm border-t pt-4">
                        <div><span className="text-muted-foreground">Yaş:</span><span className="ml-2 font-medium">{patient.age}</span></div>
                        <div><span className="text-muted-foreground">Kol:</span><span className="ml-2 font-medium">{patient.arm}</span></div>
                        <div><span className="text-muted-foreground">ROM Limiti:</span><span className="ml-2 font-medium">{patient.romLimit} cm</span></div>
                        <div><span className="text-muted-foreground">Son Seans:</span><span className="ml-2 font-medium">{patient.lastSession}</span></div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div><p className="text-lg font-bold text-blue-600 dark:text-blue-400">{patient.totalSessions}</p><p className="text-xs text-muted-foreground">Toplam Seans</p></div>
                            <div><p className="text-lg font-bold text-green-600 dark:text-green-400">{patient.avgScore}</p><p className="text-xs text-muted-foreground">Ortalama Skor</p></div>
                            <div><p className="text-lg font-bold text-purple-600 dark:text-purple-400">{patient.improvement}</p><p className="text-xs text-muted-foreground">Gelişim</p></div>
                        </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1" onClick={onShowDetails}>
                            <Eye className="w-4 h-4 mr-2" />Detaylar
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1" onClick={onEdit}>
                            <Edit className="w-4 h-4 mr-2" />Düzenle
                        </Button>
                        <Button size="sm" className="flex-1">
                            <Calendar className="w-4 h-4 mr-2" />Seans Oluştur
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}