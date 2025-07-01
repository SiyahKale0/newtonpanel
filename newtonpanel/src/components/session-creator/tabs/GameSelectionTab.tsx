// src/components/session-creator/tabs/GameSelectionTab.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Piano, HandMetal } from "lucide-react";

interface GameSelectionTabProps {
    selectedGame: "apple" | "piano" | null;
    onSelectGame: (game: "apple" | "piano") => void;
}

export function GameSelectionTab({ selectedGame, onSelectGame }: GameSelectionTabProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Oyun Seçin</CardTitle>
                <CardDescription>Oynanacak rehabilitasyon oyununu seçin.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div
                        onClick={() => onSelectGame("apple")}
                        className={`flex cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border p-8 transition-all ${
                            selectedGame === "apple"
                                ? "border-primary ring-2 ring-primary"
                                : "hover:border-primary/50"
                        }`}
                    >
                        <HandMetal className="h-12 w-12 text-red-500" />
                        <h3 className="text-lg font-semibold">Elma Toplama Oyunu</h3>
                    </div>
                    <div
                        onClick={() => onSelectGame("piano")}
                        className={`flex cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border p-8 transition-all ${
                            selectedGame === "piano"
                                ? "border-primary ring-2 ring-primary"
                                : "hover:border-primary/50"
                        }`}
                    >
                        <Piano className="h-12 w-12 text-blue-500" />
                        <h3 className="text-lg font-semibold">Piyano Oyunu</h3>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}