"use client";

import React, { useState } from 'react';
import { usePatientManagement } from '@/hooks/use-patient-management';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { PatientCard } from '@/components/patient-management/PatientCard';
import { AddPatientDialog } from '@/components/patient-management/AddPatientDialog';
import { EditPatientDialog } from '@/components/patient-management/EditPatientDialog';
import { PatientDetailModal } from '@/components/patient-management/PatientDetailModal';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { DashboardPatient } from '@/types/dashboard';
import { Patient } from '@/types/firebase';
import { deletePatient } from '@/services/patientService';

const PatientsPage = () => {
  const { patients, dashboardPatients, loading, error, addPatient, refreshData } = usePatientManagement();
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [viewingPatient, setViewingPatient] = useState<Patient | null>(null);
  const [deletingPatient, setDeletingPatient] = useState<Patient | null>(null);

  const handleDeleteConfirm = async () => {
    if (!deletingPatient) return;
    try {
      await deletePatient(deletingPatient.id);
      await refreshData(); // Veriyi yenile
      alert("Hasta başarıyla silindi.");
    } catch (error) {
      alert("Hasta silinirken bir hata oluştu.");
      console.error(error);
    } finally {
      setDeletingPatient(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Hasta Yönetimi</h1>
          <p className="text-muted-foreground">
            Mevcut hastaları görüntüleyin, düzenleyin veya yeni hasta ekleyin.
          </p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Yeni Hasta Ekle
        </Button>
      </div>

      {loading && <p>Hastalar yükleniyor...</p>}
      {error && <p className="text-destructive">{error}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {dashboardPatients.map(patient => (
            <PatientCard
              key={patient.id}
              patient={patient}
              onEdit={() => setEditingPatient(patients.find(p => p.id === patient.id) || null)}
              onShowDetails={() => setViewingPatient(patients.find(p => p.id === patient.id) || null)}
              onDelete={() => setDeletingPatient(patients.find(p => p.id === patient.id) || null)}
            />
          ))}
        </div>
      )}

      <AddPatientDialog
        isOpen={isAddDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onPatientAdded={addPatient}
      />

      {editingPatient && (
        <EditPatientDialog
          open={!!editingPatient}
          onOpenChange={(open) => !open && setEditingPatient(null)}
          patient={editingPatient}
          onPatientUpdated={() => {
            // Burada veriyi yeniden çekmek veya state'i güncellemek gerekebilir.
            // Şimdilik sadece dialog'u kapatalım.
            setEditingPatient(null);
          }}
        />
      )}

      {viewingPatient && (
        <PatientDetailModal
          open={!!viewingPatient}
          onOpenChange={(open) => !open && setViewingPatient(null)}
          patient={viewingPatient}
          onNavigateToPerformance={() => {}}
        />
      )}

      <ConfirmationDialog
        open={!!deletingPatient}
        onOpenChange={(open) => !open && setDeletingPatient(null)}
        onConfirm={handleDeleteConfirm}
        title="Hastayı Silmeyi Onayla"
        description={`'${deletingPatient?.name}' adlı hastayı kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`}
        confirmText="Evet, Sil"
      />
    </div>
  );
};

export default PatientsPage;