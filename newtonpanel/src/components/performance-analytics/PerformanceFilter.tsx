"use client"

import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

import { getAllPatients } from '@/services/patientService';
import { Patient } from '@/types/firebase';

export function PerformanceFilter({ selectedPatientId }: { selectedPatientId: string | null }) {
    const [patients, setPatients] = useState<Patient[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentSelection, setCurrentSelection] = useState(selectedPatientId || "all");

    useEffect(() => {
        if (selectedPatientId) {
            setCurrentSelection(selectedPatientId);
        }
    }, [selectedPatientId]);

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const fetchedPatients = await getAllPatients();
                setPatients(fetchedPatients);
            } catch (error) {
                console.error("Hastalar çekilirken hata:", error);
            }
        };
        fetchPatients();
    }, []);

    const filteredPatients = patients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="flex gap-4 flex-wrap flex-1">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Hasta ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <Select value={currentSelection} onValueChange={setCurrentSelection}>
                    <SelectTrigger className="w-full sm:w-48">
                        <SelectValue placeholder="Hasta Seçin" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tüm Hastalar</SelectItem>
                        {filteredPatients.map(patient => (
                            <SelectItem key={patient.id} value={patient.id}>
                                {patient.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select defaultValue="month">
                    <SelectTrigger className="w-full sm:w-32">
                        <SelectValue placeholder="Zaman Aralığı" />
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