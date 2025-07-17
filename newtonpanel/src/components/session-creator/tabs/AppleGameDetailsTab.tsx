// src/components/session-creator/tabs/AppleGameDetailsTab.tsx
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Hand, HandMetal, ShoppingBag, ArrowRightLeft } from "lucide-react";

interface AppleGameDetailsTabProps {
    selectedMode: string | null;
    selectedLevel: number | null;
    onSelectMode: (mode: "Reach" | "Grip" | "Carry" | "Sort") => void;
    onSelectLevel: (level: 1 | 2 | 3) => void;
}

const gameModes = [
    { id: "Reach", name: "Uzanma", icon: HandMetal },
    { id: "Grip", name: "Kavrama", icon: Hand },
    { id: "Carry", name: "Taşıma", icon: ShoppingBag },
    { id: "Sort", name: "Sıralama", icon: ArrowRightLeft },
] as const;

export function AppleGameDetailsTab({ selectedMode, selectedLevel, onSelectMode, onSelectLevel }: AppleGameDetailsTabProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Elma Toplama Oyunu Detayları</CardTitle>
                <CardDescription>Oyun modunu ve zorluk seviyesini seçin.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                <div>
                    <h4 className="font-semibold text-lg mb-4">Oyun Modu</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {gameModes.map(mode => (
                            <div
                                key={mode.id}
                                onClick={() => onSelectMode(mode.id)}
                                className={`flex flex-col items-center justify-center gap-3 p-6 rounded-lg border-2 cursor-pointer transition-all ${
                                    selectedMode === mode.id ? 'border-primary bg-primary/10' : 'hover:border-primary/50'
                                }`}
                            >
                                <mode.icon className="w-10 h-10" />
                                <span className="font-medium">{mode.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {selectedMode && (
                    <div className="animate-in fade-in-50">
                        <h4 className="font-semibold text-lg mb-4">Seviye</h4>
                        <div className="flex justify-center gap-4">
                            {[1, 2, 3].map(level => (
                                <Button
                                    key={level}
                                    variant={selectedLevel === level ? 'default' : 'outline'}
                                    size="lg"
                                    className="text-xl w-24 h-24 flex flex-col gap-2"
                                    onClick={() => onSelectLevel(level as 1 | 2 | 3)}
                                >
                                    <span>Seviye</span>
                                    <span>{level}</span>
                                </Button>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}