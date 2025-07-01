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
                        {/* thead içeriği buraya gelecek */}
                        <tbody>
                        {performanceData.map((data, index) => (
                            <tr key={index} className="border-b hover:bg-gray-50">
                                {/* td içerikleri buraya gelecek */}
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}