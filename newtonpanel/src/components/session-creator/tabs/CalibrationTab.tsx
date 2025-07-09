// src/components/session-creator/tabs/CalibrationTab.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ToggleLeft, ToggleRight } from "lucide-react";

interface CalibrationTabProps {
    minRomCalibre: boolean;
    maxRomCalibre: boolean;
    onToggle: (type: 'min' | 'max') => void;
}

export function CalibrationTab({ minRomCalibre, maxRomCalibre, onToggle }: CalibrationTabProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>ROM Kalibrasyonu</CardTitle>
                <CardDescription>Hastanın minimum ve maksimum hareket aralığı (ROM) için kalibrasyonu başlatın veya durdurun.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                        <h4 className="font-semibold">Minimum ROM Kalibrasyonu</h4>
                        <p className="text-sm text-muted-foreground">Hastanın uzanabildiği en yakın mesafe için kalibrasyonu aç/kapa.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button
                            onClick={() => onToggle('min')}
                            variant={minRomCalibre ? "default" : "outline"}
                            className="w-40"
                        >
                            {minRomCalibre ? <ToggleRight className="w-5 h-5 mr-2" /> : <ToggleLeft className="w-5 h-5 mr-2" />}
                            {minRomCalibre ? 'Aktif' : 'Pasif'}
                        </Button>
                    </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                        <h4 className="font-semibold">Maksimum ROM Kalibrasyonu</h4>
                        <p className="text-sm text-muted-foreground">Hastanın uzanabildiği en uzak mesafe için kalibrasyonu aç/kapa.</p>
                    </div>
                     <div className="flex items-center gap-4">
                        <Button
                            onClick={() => onToggle('max')}
                            variant={maxRomCalibre ? "default" : "outline"}
                             className="w-40"
                        >
                           {maxRomCalibre ? <ToggleRight className="w-5 h-5 mr-2" /> : <ToggleLeft className="w-5 h-5 mr-2" />}
                           {maxRomCalibre ? 'Aktif' : 'Pasif'}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}