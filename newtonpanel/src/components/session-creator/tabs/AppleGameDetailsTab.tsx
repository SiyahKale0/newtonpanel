// src/components/session-creator/tabs/AppleGameDetailsTab.tsx
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Gem, Star, Trophy, Medal, Rocket, Compass, Hand, Truck, Rows3 } from "lucide-react";
import { cn } from "@/lib/utils";

type AppleGameMode = "Reach" | "Grip" | "Carry" | "Sort";
type AppleGameLevel = 1 | 2 | 3 | 4 | 5;

interface AppleGameDetailsTabProps {
    selectedMode: AppleGameMode | null;
    selectedLevel: AppleGameLevel | null;
    onSelectMode: (mode: AppleGameMode) => void;
    onSelectLevel: (level: AppleGameLevel) => void;
}

const gameModes: { id: AppleGameMode; label: string; description: string; icon: React.ElementType }[] = [
    { id: "Reach", label: "Uzanma", description: "Hedeflere uzanma pratiği", icon: Compass },
    { id: "Grip", label: "Kavrama", description: "Nesneleri kavrama gücü", icon: Hand },
    { id: "Carry", label: "Taşıma", description: "Nesneleri taşıma becerisi", icon: Truck },
    { id: "Sort", label: "Sıralama", description: "Nesneleri kategorize etme", icon: Rows3 },
];

const gameLevels: { id: AppleGameLevel; label: string; icon: React.ElementType }[] = [
    { id: 1, label: "Çok Kolay", icon: Medal },
    { id: 2, label: "Kolay", icon: Star },
    { id: 3, label: "Orta", icon: Gem },
    { id: 4, label: "Zor", icon: Trophy },
    { id: 5, label: "Çok Zor", icon: Rocket },
];

export function AppleGameDetailsTab({ selectedMode, selectedLevel, onSelectMode, onSelectLevel }: AppleGameDetailsTabProps) {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>1. Oyun Modunu Seçin</CardTitle>
                    <CardDescription>Oynamak istediğiniz elma toplama oyun modunu seçin.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {gameModes.map((mode) => {
                        const Icon = mode.icon;
                        return (
                            <Button
                                key={mode.id}
                                variant={selectedMode === mode.id ? "default" : "outline"}
                                className={cn(
                                    "w-full justify-start text-left h-auto py-4 px-5",
                                    selectedMode === mode.id && "ring-2 ring-primary ring-offset-2"
                                )}
                                onClick={() => onSelectMode(mode.id)}
                            >
                                <Icon className="mr-4 h-8 w-8 text-primary" />
                                <div className="flex flex-col">
                                    <span className="font-semibold text-lg">{mode.label}</span>
                                    <span className="text-sm font-normal text-muted-foreground">{mode.description}</span>
                                </div>
                            </Button>
                        );
                    })}
                </CardContent>
            </Card>

            {selectedMode && (
                <Card className="animate-in fade-in-50 duration-500">
                    <CardHeader>
                        <CardTitle>2. Zorluk Seviyesini Seçin</CardTitle>
                        <CardDescription>'{gameModes.find(m => m.id === selectedMode)?.label}' modu için bir zorluk belirleyin.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                        {gameLevels.map((level) => {
                            const Icon = level.icon;
                            return (
                                <Button
                                    key={level.id}
                                    variant={selectedLevel === level.id ? "default" : "outline"}
                                    className={cn(
                                        "w-full justify-center text-center h-24 flex-col gap-2",
                                        selectedLevel === level.id && "ring-2 ring-primary ring-offset-2"
                                    )}
                                    onClick={() => onSelectLevel(level.id)}
                                >
                                    <Icon className="h-7 w-7" />
                                    <span className="font-semibold">{level.label}</span>
                                </Button>
                            );
                        })}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}