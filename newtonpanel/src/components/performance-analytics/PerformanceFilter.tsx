// src/components/performance-analytics/PerformanceFilter.tsx
"use client"

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Patient, Session } from '@/types/firebase';
import { User, Calendar } from 'lucide-react';

interface PerformanceFilterProps {
    patients: Patient[];
    selectedPatientId: string | null;
    onPatientSelect: (patientId: string) => void;
    patientSessions: Session[];
    selectedSessionId: string | null;
    onSessionSelect: (sessionId: string) => void;
}

export function PerformanceFilter({
    patients,
    selectedPatientId,
    onPatientSelect,
    patientSessions,
    selectedSessionId,
    onSessionSelect
}: PerformanceFilterProps) {

    const sortedSessions = [...patientSessions].sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.startTime || '00:00:00'}`).getTime();
        const dateB = new Date(`${b.date}T${b.startTime || '00:00:00'}`).getTime();
        return dateB - dateA; // En yeni en üstte
    });

    return (
        <div className="flex flex-col sm:flex-row gap-4 justify-start items-center w-full">
            {/* Hasta Seçimi */}
            <div className="flex-1 w-full">
                <Select value={selectedPatientId || ""} onValueChange={onPatientSelect}>
                    <SelectTrigger className="w-full">
                         <User className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="Bir hasta seçin..." />
                    </SelectTrigger>
                    <SelectContent>
                        {patients.map(patient => (
                            <SelectItem key={patient.id} value={patient.id}>
                                {patient.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            
            {/* Seans Seçimi */}
            {selectedPatientId && (
                <div className="flex-1 w-full">
                    <Select value={selectedSessionId || ""} onValueChange={onSessionSelect} disabled={patientSessions.length === 0}>
                        <SelectTrigger className="w-full">
                             <Calendar className="mr-2 h-4 w-4" />
                            <SelectValue placeholder={patientSessions.length > 0 ? "Bir seans seçin..." : "Hastanın seansı yok"} />
                        </SelectTrigger>
                        <SelectContent>
                            {sortedSessions.map(session => (
                                <SelectItem key={session.id} value={session.id}>
                                    {session.date} - {session.startTime || 'Saatsiz'} ({session.gameType})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
        </div>
    );
}