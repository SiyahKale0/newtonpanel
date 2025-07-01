// src/components/performance-analytics/PerformanceFilter.tsx
"use client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function PerformanceFilter() {
    return (
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex gap-4">
                <Select defaultValue="all">
                    <SelectTrigger className="w-48">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tüm Hastalar</SelectItem>
                        <SelectItem value="mehmet">Mehmet Yılmaz</SelectItem>
                        <SelectItem value="fatma">Fatma Demir</SelectItem>
                        <SelectItem value="ali">Ali Kaya</SelectItem>
                        <SelectItem value="zeynep">Zeynep Öz</SelectItem>
                    </SelectContent>
                </Select>
                <Select defaultValue="month">
                    <SelectTrigger className="w-32">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="week">Bu Hafta</SelectItem>
                        <SelectItem value="month">Bu Ay</SelectItem>
                        <SelectItem value="quarter">3 Ay</SelectItem>
                        <SelectItem value="year">Bu Yıl</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Rapor İndir
            </Button>
        </div>
    );
}