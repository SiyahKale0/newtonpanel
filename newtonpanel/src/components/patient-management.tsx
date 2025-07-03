// src/components/patient-management.tsx
"use client"

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { User, Search, Loader2 } from "lucide-react";
import { AddPatientDialog } from "./patient-management/AddPatientDialog";
import { PatientCard } from "./patient-management/PatientCard";
import { EditPatientDialog } from "./patient-management/EditPatientDialog";
import { PatientDetailModal } from "./patient-management/PatientDetailModal"; // YENİ

import { onValue, ref } from "firebase/database";
import { db } from "@/services/firebase";
import { Patient as FirebasePatient } from "@/types/firebase";
import { DashboardPatient } from "@/types/dashboard";

const formatPatientForUI = (patient: FirebasePatient): DashboardPatient => {
    const sessionCount = patient.sessions ? Object.keys(patient.sessions).length : 0;
    return {
        id: patient.id,
        name: patient.name,
        age: patient.age,
        diagnosis: patient.diagnosis,
        arm: patient.isFemale ? "Sol" : "Sağ",
        romLimit: 60,
        lastSession: sessionCount > 0 ? "Mevcut" : "Yok",
        totalSessions: sessionCount,
        avgScore: 85,
        improvement: "+10%",
        status: "active",
    };
};

// onShowDetails kaldırıldı, onNavigateToPerformance eklendi
export function PatientManagement({ onNavigateToPerformance }: { onNavigateToPerformance: (patientId: string) => void; }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [allPatients, setAllPatients] = useState<FirebasePatient[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedPatientForEdit, setSelectedPatientForEdit] = useState<FirebasePatient | null>(null);

    // Detay modalı için yeni state'ler
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedPatientForDetail, setSelectedPatientForDetail] = useState<FirebasePatient | null>(null);

    useEffect(() => {
        const patientsRef = ref(db, 'patients');
        const unsubscribe = onValue(patientsRef, (snapshot) => {
            const patientList: FirebasePatient[] = [];
            if (snapshot.exists()) {
                const data = snapshot.val();
                for (const key in data) {
                    patientList.push({ id: key, ...data[key] });
                }
            }
            setAllPatients(patientList);
            setLoading(false);
        }, (error) => {
            console.error("Firebase veri okuma hatası:", error);
            setError("Veritabanı bağlantısında bir sorun oluştu.");
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleEditClick = (patientId: string) => {
        const patientToEdit = allPatients.find(p => p.id === patientId);
        if (patientToEdit) {
            setSelectedPatientForEdit(patientToEdit);
            setIsEditModalOpen(true);
        }
    };

    const handleDetailClick = (patientId: string) => {
        const patientToDetail = allPatients.find(p => p.id === patientId);
        if (patientToDetail) {
            setSelectedPatientForDetail(patientToDetail);
            setIsDetailModalOpen(true);
        }
    };

    const uiPatients = allPatients.map(formatPatientForUI);
    const filteredPatients = uiPatients.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

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

            {loading && <div className="flex justify-center items-center py-20"><Loader2 className="w-10 h-10 animate-spin text-primary" /><p className="ml-4 text-lg text-muted-foreground">Hastalar Yükleniyor...</p></div>}
            {error && <Card className="bg-red-50 border-red-200"><CardContent className="text-center py-12"><h3 className="text-lg font-medium text-red-800">Hata!</h3><p className="text-muted-foreground text-red-700">{error}</p></CardContent></Card>}

            {!loading && !error && (
                filteredPatients.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredPatients.map((patient) => (
                            <PatientCard
                                key={patient.id}
                                patient={patient}
                                onEdit={() => handleEditClick(patient.id)}
                                onShowDetails={() => handleDetailClick(patient.id)} // Yeni fonksiyonu bağlıyoruz
                            />
                        ))}
                    </div>
                ) : (
                    <Card><CardContent className="text-center py-12"><User className="w-12 h-12 text-gray-400 mx-auto mb-4" /><h3 className="text-lg font-medium">Hasta Bulunamadı</h3><p className="text-muted-foreground">Arama kriterlerinizi değiştirin veya yeni hasta ekleyin.</p></CardContent></Card>
                )
            )}

            <EditPatientDialog
                patient={selectedPatientForEdit}
                open={isEditModalOpen}
                onOpenChange={setIsEditModalOpen}
                onPatientUpdated={() => {}}
            />

            <PatientDetailModal
                patient={selectedPatientForDetail}
                open={isDetailModalOpen}
                onOpenChange={setIsDetailModalOpen}
                onNavigateToPerformance={onNavigateToPerformance}
            />
        </div>
    );
}