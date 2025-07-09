// src/components/performance-analytics/PerformanceAnalytics.tsx

"use client";

import React, { useEffect, useState } from "react";
import { getPatientById, getAllPatients, updatePatient } from "@/services/patientService";
import { getRomById, createOrUpdateRom } from "@/services/romService";
import { createNewSession } from "@/services/sessionService";
import ArmMeasurementCard from "@/components/performance-analytics/ArmMeasurementCard";
import FingerProgressTable from "@/components/performance-analytics/FingerProgressTable";
import Hand2D from "@/components/performance-analytics/Hand2D";
import { Patient, Rom } from "@/types/firebase";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Users, Database } from "lucide-react";

interface PerformanceAnalyticsProps {
  selectedPatientId: string | null;
}

export default function PerformanceAnalytics({ selectedPatientId }: PerformanceAnalyticsProps) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPatientId, setCurrentPatientId] = useState<string | null>(selectedPatientId);
  const [creatingTestData, setCreatingTestData] = useState(false);

  // Tüm hastaları yükle
  useEffect(() => {
    const fetchAllPatients = async () => {
      try {
        const patients = await getAllPatients();
        setAllPatients(patients);
      } catch (error) {
        console.error("Hastalar yüklenirken hata:", error);
      }
    };
    fetchAllPatients();
  }, []);

  // Seçili hasta değiştiğinde currentPatientId'yi güncelle
  useEffect(() => {
    setCurrentPatientId(selectedPatientId);
  }, [selectedPatientId]);

  useEffect(() => {
    const fetchPatient = async () => {
      if (!currentPatientId) return;
      setLoading(true);
      try {
        console.log("Hasta verisi yükleniyor:", currentPatientId);
        const fetchedPatient = await getPatientById(currentPatientId);
        console.log("Hasta verisi alındı:", fetchedPatient);
        
        if (fetchedPatient?.romID) {
          console.log("ROM ID bulundu:", fetchedPatient.romID);
          const rom = await getRomById(fetchedPatient.romID);
          console.log("ROM verisi alındı:", rom);
          fetchedPatient.rom = rom || undefined;
        } else {
          console.log("Hasta için ROM ID bulunamadı");
        }
        
        setPatient(fetchedPatient);
      } catch (error) {
        console.error("Hasta verisi alınırken hata:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [currentPatientId]);

  // Test verisi oluşturma fonksiyonu
  const createTestData = async () => {
    if (!currentPatientId) {
      alert("Önce bir hasta seçin!");
      return;
    }

    setCreatingTestData(true);
    try {
      console.log("Test verisi oluşturuluyor...");

      // 1. ROM 0 verisi oluştur
      const romData: Omit<Rom, 'id'> = {
        arm: {
          leftSpace: 45,
          rightSpace: 42
        },
        finger: {
          leftFingers: [
            { min: 0, max: 90 },   // Baş parmak
            { min: 0, max: 120 },  // İşaret parmak
            { min: 0, max: 135 },  // Orta parmak
            { min: 0, max: 130 },  // Yüzük parmak
            { min: 0, max: 140 }   // Serçe parmak
          ],
          rightFingers: [
            { min: 0, max: 88 },   // Baş parmak
            { min: 0, max: 118 },  // İşaret parmak
            { min: 0, max: 132 },  // Orta parmak
            { min: 0, max: 128 },  // Yüzük parmak
            { min: 0, max: 138 }   // Serçe parmak
          ]
        }
      };

      const romId = "0"; // ROM 0
      await createOrUpdateRom(romId, romData);
      console.log("ROM 0 oluşturuldu:", romId);

      // 2. Session 1 oluştur
      const sessionId = "session_1";
      const sessionData = {
        patientID: currentPatientId,
        deviceID: "device_1",
        date: new Date().toISOString().split('T')[0],
        startTime: "09:00",
        endTime: "09:30",
        romID: romId,
        gameType: "appleGame" as const,
        gameConfigID: "config_1"
      };

      await createNewSession(sessionId, sessionData);
      console.log("Session 1 oluşturuldu:", sessionId);

      // 3. Hastanın ROM ID'sini güncelle
      await updatePatient(currentPatientId, { romID: romId });
      console.log("Hasta ROM ID güncellendi:", currentPatientId);

      // 4. Hasta verilerini yeniden yükle
      const updatedPatient = await getPatientById(currentPatientId);
      if (updatedPatient?.romID) {
        const rom = await getRomById(updatedPatient.romID);
        updatedPatient.rom = rom || undefined;
      }
      setPatient(updatedPatient);

      alert("Test verisi başarıyla oluşturuldu! Session 1 ile ROM 0 eşleştirildi.");
    } catch (error) {
      console.error("Test verisi oluşturulurken hata:", error);
      alert("Test verisi oluşturulurken hata oluştu: " + error);
    } finally {
      setCreatingTestData(false);
    }
  };

  if (!currentPatientId) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Activity className="w-8 h-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Performans Analizi</h2>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Hasta Seçimi
            </CardTitle>
            <CardDescription>
              Analiz yapmak istediğiniz hastayı seçin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Select onValueChange={setCurrentPatientId}>
                <SelectTrigger className="w-full max-w-md">
                  <SelectValue placeholder="Hasta seçin..." />
                </SelectTrigger>
                <SelectContent>
                  {allPatients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name} - {patient.age} yaş
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {allPatients.length === 0 && (
                <p className="text-sm text-gray-500">
                  Henüz hasta kaydı bulunmuyor. Hasta yönetimi bölümünden hasta ekleyebilirsiniz.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Activity className="w-8 h-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Performans Analizi</h2>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Hasta verileri yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Activity className="w-8 h-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Performans Analizi</h2>
        </div>
        <Card>
          <CardContent className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Hasta Bulunamadı</h3>
            <p className="text-gray-500 mb-4">Seçilen hasta verisi bulunamadı veya silinmiş olabilir.</p>
            <button 
              onClick={() => setCurrentPatientId(null)}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Başka bir hasta seç
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="w-8 h-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">
            Performans Analizi - {patient.name}
          </h2>
        </div>
        
        <div className="flex items-center gap-3">
          <Button 
            onClick={createTestData} 
            disabled={creatingTestData}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Database className="w-4 h-4" />
            {creatingTestData ? "Oluşturuluyor..." : "Test Verisi Oluştur"}
          </Button>
          
          <Select value={currentPatientId} onValueChange={setCurrentPatientId}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {allPatients.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name} - {p.age} yaş
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {patient.rom?.arm && (
        <ArmMeasurementCard
          leftSpace={patient.rom.arm.leftSpace}
          rightSpace={patient.rom.arm.rightSpace}
        />
      )}

      {patient.rom?.finger && (
        <>
          <FingerProgressTable
            fingers={[
              ...patient.rom.finger.leftFingers.map((f, i) => ({
                name: `Sol Parmak ${i + 1}`,
                min: f.min.toString(),
                max: f.max.toString(),
              })),
              ...patient.rom.finger.rightFingers.map((f, i) => ({
                name: `Sağ Parmak ${i + 1}`,
                min: f.min.toString(),
                max: f.max.toString(),
              })),
            ]}
          />

          <Hand2D
            fingers={[
              ...patient.rom.finger.leftFingers.map((f, i) => ({
                name: `L${i + 1}`,
                min: f.min.toString(),
                max: f.max.toString(),
                x: 100 + i * 30,
                y: 300,
              })),
              ...patient.rom.finger.rightFingers.map((f, i) => ({
                name: `R${i + 1}`,
                min: f.min.toString(),
                max: f.max.toString(),
                x: 250 + i * 30,
                y: 300,
              })),
            ]}
          />
        </>
      )}

      {/* Debug bilgileri - geliştirme aşamasında */}
      <Card>
        <CardHeader>
          <CardTitle>ROM Veri Yapısı (Debug)</CardTitle>
          <CardDescription>Hasta ROM verilerinin detaylı görünümü</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">ROM ID: {patient.romID || 'Belirtilmemiş'}</h4>
            </div>
            
            {patient.rom ? (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Kol Verileri:</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded">
                      <strong>Sol Kol:</strong> {patient.rom.arm?.leftSpace || 'N/A'} cm
                    </div>
                    <div className="p-3 bg-gray-50 rounded">
                      <strong>Sağ Kol:</strong> {patient.rom.arm?.rightSpace || 'N/A'} cm
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Parmak Verileri:</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-sm mb-2">Sol Parmaklar:</h5>
                      {patient.rom.finger?.leftFingers?.map((finger, index) => (
                        <div key={index} className="text-sm mb-1">
                          Parmak {index + 1}: {finger.min}° - {finger.max}°
                        </div>
                      )) || 'Veri yok'}
                    </div>
                    <div>
                      <h5 className="font-medium text-sm mb-2">Sağ Parmaklar:</h5>
                      {patient.rom.finger?.rightFingers?.map((finger, index) => (
                        <div key={index} className="text-sm mb-1">
                          Parmak {index + 1}: {finger.min}° - {finger.max}°
                        </div>
                      )) || 'Veri yok'}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-2">ROM verisi bulunamadı</p>
                <p className="text-sm text-gray-400">
                  Bu hasta için henüz ROM profili oluşturulmamış veya ROM ID'si eksik.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
