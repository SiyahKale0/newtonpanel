// src/components/patient-management.tsx
"use client"

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { User, Search } from "lucide-react";
import { AddPatientDialog } from "./patient-management/AddPatientDialog";
import { PatientCard } from "./patient-management/PatientCard";
import type { DashboardPatient } from "@/types/dashboard";

const initialPatients: DashboardPatient[] = [
  // ... hasta verileri buraya gelecek (orijinal dosyadaki gibi)
];

export function PatientManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState<DashboardPatient[]>(initialPatients);

  const filteredPatients = patients.filter(
      (patient) =>
          patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
                placeholder="Hasta adı veya teşhise göre ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
            />
          </div>
          <AddPatientDialog />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPatients.map((patient) => (
              <PatientCard key={patient.id} patient={patient} />
          ))}
        </div>

        {filteredPatients.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium">Hasta Bulunamadı</h3>
                <p className="text-muted-foreground">Arama kriterlerinizi değiştirin veya yeni hasta ekleyin.</p>
              </CardContent>
            </Card>
        )}
      </div>
  );
}