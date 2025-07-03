// src/components/patient-management.tsx
"use client"

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { User, Search, Loader2 } from "lucide-react";
import { AddPatientDialog } from "./patient-management/AddPatientDialog";
import { PatientCard } from "./patient-management/PatientCard";

// Firebase ve Tipler
import { onValue, ref } from "firebase/database";
import { db } from "@/services/firebase";
import { Patient as FirebasePatient } from "@/types/firebase";
import { DashboardPatient } from "@/types/dashboard";

/**
 * Ham Firebase verisini, arayüz kartlarında kullanılacak formata dönüştürür.
 * Bu, veri katmanı ile sunum katmanını birbirinden ayırır.
 * @param patient Firebase'den gelen ham hasta verisi.
 * @returns Arayüz için formatlanmış hasta verisi.
 */
const formatPatientForUI = (patient: FirebasePatient): DashboardPatient => {
    // GÜNCELLEME: `sessions` bir obje olduğu için, seans sayısını `Object.keys` ile saymak daha doğrudur.
    const sessionCount = patient.sessions ? Object.keys(patient.sessions).length : 0;

    return {
        id: patient.id,
        name: patient.name,
        age: patient.age,
        diagnosis: patient.diagnosis,
        arm: patient.isFemale ? "Sol" : "Sağ",
        romLimit: 60, // Bu değer ileride ROM servisinden dinamik olarak alınabilir.
        lastSession: sessionCount > 0 ? "Mevcut" : "Yok",
        totalSessions: sessionCount,
        avgScore: 85, // Bu değer ileride seans sonuçlarından hesaplanabilir.
        improvement: "+10%", // Bu değer ileride seans sonuçlarından hesaplanabilir.
        status: "active",
    };
};

export function PatientManagement() {
    const [searchTerm, setSearchTerm] = useState("");
    const [patients, setPatients] = useState<DashboardPatient[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const patientsRef = ref(db, 'patients');

        // Firebase'deki 'patients' yoluna gerçek zamanlı bir dinleyici (listener) kur.
        const unsubscribe = onValue(patientsRef, (snapshot) => {
            try {
                const patientList: FirebasePatient[] = [];
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    // Firebase'den gelen objeyi diziye çevir.
                    for (const key in data) {
                        patientList.push({ id: key, ...data[key] });
                    }
                }
                setPatients(patientList.map(formatPatientForUI));
            } catch (err) {
                console.error("Veri işlenirken hata oluştu:", err);
                setError("Hastalar yüklenirken bir hata oluştu.");
            } finally {
                setLoading(false);
            }
        });

        // Component ekrandan kaldırıldığında, bellek sızıntısını önlemek için dinleyiciyi kapat.
        return () => unsubscribe();
    }, []); // Boş bağımlılık dizisi, bu effect'in sadece bir kez çalışmasını sağlar.

    // Arama terimine göre hastaları filtrele.
    const filteredPatients = patients.filter((patient) => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        // Defansif kodlama: 'name' ve 'diagnosis' alanlarının varlığını kontrol et.
        const nameMatch = patient.name && patient.name.toLowerCase().includes(lowerCaseSearchTerm);
        const diagnosisMatch = patient.diagnosis && patient.diagnosis.toLowerCase().includes(lowerCaseSearchTerm);
        return nameMatch || diagnosisMatch;
    });

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
                {/* `AddPatientDialog` artık bir callback prop'una ihtiyaç duymuyor.
                  Yeni hasta eklendiğinde, `onValue` dinleyicisi değişikliği otomatik olarak yakalar
                  ve `patients` state'ini güncelleyerek arayüzü yeniler. Bu daha temiz bir yaklaşımdır.
                */}
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
                    {filteredPatients.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredPatients.map((patient) => (
                                <PatientCard key={patient.id} patient={patient} />
                            ))}
                        </div>
                    ) : (
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