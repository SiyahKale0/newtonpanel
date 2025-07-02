// src/components/patient-management.tsx
"use client"

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { User, Search, Loader2 } from "lucide-react"; // Loader2 ikonu eklendi
import { AddPatientDialog } from "./patient-management/AddPatientDialog";
import { PatientCard } from "./patient-management/PatientCard";
import { DashboardPatient } from "@/types/dashboard"; // UI için kullanılan tip
import { Patient } from "@/types/firebase"; // Firebase'den gelen veri tipi
import { getAllPatients } from "@/services/patientService"; // Firebase servisimiz

/**
 * Firebase'den gelen ham hasta verisini, arayüzde kullanılan
 * DashboardPatient formatına dönüştürür.
 */
function formatPatientDataForDashboard(patient: Patient): DashboardPatient {
    // Bu fonksiyon, veritabanı verisi ile UI beklentileri arasında bir köprü kurar.
    // Gelecekte daha karmaşık hesaplamalar (örn. ortalama skor) burada yapılabilir.
    return {
        id: patient.id,
        name: patient.name,
        age: patient.age,
        diagnosis: patient.diagnosis,
        // Bu veriler için şimdilik varsayılan değerler atıyoruz.
        // İleride romID ve sessionID'ler kullanılarak bu alanlar doldurulabilir.
        arm: patient.isFemale ? "Sol" : "Sağ", // Örnek bir mantık
        romLimit: 60, // Varsayılan değer, roms servisinden çekilebilir
        lastSession: patient.sessions?.length > 0 ? "Mevcut" : "Yok",
        totalSessions: patient.sessions?.length ?? 0,
        avgScore: 85, // Varsayılan değer
        improvement: "+10%", // Varsayılan değer
        status: "active",
    };
}

export function PatientManagement() {
    const [searchTerm, setSearchTerm] = useState("");
    const [patients, setPatients] = useState<DashboardPatient[]>([]);
    const [loading, setLoading] = useState(true); // Yüklenme durumu için state
    const [error, setError] = useState<string | null>(null);

    // Bileşen ilk yüklendiğinde Firebase'den verileri çekmek için useEffect kullanılır.
    useEffect(() => {
        const fetchPatients = async () => {
            try {
                setLoading(true);
                setError(null);
                const fetchedPatients = await getAllPatients();
                const formattedPatients = fetchedPatients.map(formatPatientDataForDashboard);
                setPatients(formattedPatients);
            } catch (err) {
                console.error("Hastaları çekerken hata:", err);
                setError("Hastalar yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.");
            } finally {
                setLoading(false);
            }
        };

        fetchPatients();
    }, []); // Boş dependency array, bu etkinin sadece bir kez çalışmasını sağlar.

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

            {loading && (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    <p className="ml-4 text-lg text-muted-foreground">Hastalar Yükleniyor...</p>
                </div>
            )}

            {error && (
                 <Card className="bg-red-50 border-red-200">
                    <CardContent className="text-center py-12">
                        <h3 className="text-lg font-medium text-red-800">Hata!</h3>
                        <p className="text-muted-foreground text-red-700">{error}</p>
                    </CardContent>
                </Card>
            )}

            {!loading && !error && (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
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
                </>
            )}
        </div>
    );
}