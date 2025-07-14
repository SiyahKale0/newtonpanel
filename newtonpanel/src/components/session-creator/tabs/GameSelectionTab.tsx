// src/components/session-creator/tabs/GameSelectionTab.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Piano, HandMetal } from "lucide-react";

interface GameSelectionTabProps {
    selectedGame: "appleGame" | "fingerDance" | null;
    onSelectGame: (game: "appleGame" | "fingerDance") => void;
}

export function GameSelectionTab({ selectedGame, onSelectGame }: GameSelectionTabProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Oyun Seçin</CardTitle>
                <CardDescription>Oynanacak rehabilitasyon oyununu seçin. Seçiminiz seansa kaydedilecektir.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div
                        onClick={() => onSelectGame("appleGame")}
                        className={`flex cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border p-8 transition-all ${
                            selectedGame === "appleGame" ? "border-primary ring-2 ring-primary" : "hover:border-primary/50"
                        }`}
                    >
                        <HandMetal className="h-12 w-12 text-red-500" />
                        <h3 className="text-lg font-semibold">Elma Toplama Oyunu</h3>
                        <p className="text-sm text-muted-foreground">Oyun Tipi: appleGame</p>
                    </div>
                    <div
                        onClick={() => onSelectGame("fingerDance")}
                        className={`flex cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border p-8 transition-all ${
                            selectedGame === "fingerDance" ? "border-primary ring-2 ring-primary" : "hover:border-primary/50"
                        }`}
                    >
                        <Piano className="h-12 w-12 text-blue-500" />
                        <h3 className="text-lg font-semibold">Piyano Oyunu</h3>
                        <p className="text-sm text-muted-foreground">Oyun Tipi: fingerDance</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}