// src/components/session-creator/tabs/PatientSelectionTab.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ArrowUpDown } from "lucide-react";
import type { DashboardPatient } from "@/types/dashboard";

interface PatientSelectionTabProps {
    patients: DashboardPatient[];
    selectedPatient: DashboardPatient | null;
    onSelectPatient: (patient: DashboardPatient) => void;
    searchTerm: string;
    onSearchTermChange: (term: string) => void;
    sortOrder: "asc" | "desc" | "name";
    onSortOrderChange: (order: "asc" | "desc" | "name") => void;
}

export function PatientSelectionTab({
                                        patients,
                                        selectedPatient,
                                        onSelectPatient,
                                        searchTerm,
                                        onSearchTermChange,
                                        sortOrder,
                                        onSortOrderChange,
                                    }: PatientSelectionTabProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Hasta Seçimi</CardTitle>
                <CardDescription>Seans için hasta arayın, sıralayın ve seçin.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex flex-col gap-4 sm:flex-row">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Hasta adıyla ara..."
                            value={searchTerm}
                            onChange={(e) => onSearchTermChange(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <Select onValueChange={onSortOrderChange} defaultValue={sortOrder}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <ArrowUpDown className="mr-2 h-4 w-4" />
                            <SelectValue placeholder="Sırala" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="name">Ada Göre Sırala</SelectItem>
                            <SelectItem value="asc">Yaşa Göre (Artan)</SelectItem>
                            <SelectItem value="desc">Yaşa Göre (Azalan)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2 pt-4">
                    <Label>Hastalar ({patients.length})</Label>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {patients.map((patient) => (
                            <Card
                                key={patient.id}
                                className={`cursor-pointer transition-all ${
                                    selectedPatient?.id === patient.id
                                        ? "border-primary ring-2 ring-primary"
                                        : "hover:border-primary/50"
                                }`}
                                onClick={() => onSelectPatient(patient)}
                            >
                                <CardContent className="p-4">
                                    <h3 className="font-semibold">{patient.name}</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Yaş: {patient.age} - ROM: {patient.romLimit}cm
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                    {patients.length === 0 && (
                        <p className="pt-4 text-center text-sm text-muted-foreground">
                            Aramanızla eşleşen hasta bulunamadı.
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}