// src/components/patient-management/AddPatientDialog.tsx
"use client"

import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Loader2 } from "lucide-react";

// Firebase servisini ve tiplerini import edelim
import { createPatient } from "@/services/patientService";
import { Patient } from "@/types/firebase";

interface AddPatientDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onPatientAdded: (patient: Patient) => void;
}

export function AddPatientDialog({ isOpen, onClose, onPatientAdded }: AddPatientDialogProps) {
    // Form alanları için state'ler
    const [name, setName] = useState("");
    const [age, setAge] = useState("");
    const [diagnosis, setDiagnosis] = useState("");
    const [gender, setGender] = useState<"male" | "female" | "">("");
    const [notes, setNotes] = useState("");

    // Kaydetme işlemi sırasında yüklenme durumunu kontrol etmek için
    const [isSubmitting, setIsSubmitting] = useState(false);

    const resetForm = () => {
        setName("");
        setAge("");
        setDiagnosis("");
        setGender("");
        setNotes("");
        setIsSubmitting(false);
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault(); // Formun sayfayı yenilemesini engelle
        setIsSubmitting(true);

        // Basit bir doğrulama
        if (!name || !age || !diagnosis || !gender) {
            alert("Lütfen tüm zorunlu alanları doldurun.");
            setIsSubmitting(false);
            return;
        }

        try {
            // Firebase'e gönderilecek veri objesini `Patient` tipine uygun olarak hazırlayalım.
            const newPatientData: Omit<Patient, 'id'> = {
                name: name,
                age: parseInt(age, 10), // String'i sayıya çevir
                diagnosis: diagnosis,
                isFemale: gender === 'female',
                note: notes,
                // GÜNCELLEME: Veritabanı yapısına uygun varsayılan değerler
                customGames: { appleGame: "", fingerDance: "" },
                devices: [],
                romID: "",
                sessionCount: 0, // Başlangıç seans sayısı
                sessions: {},      // Başlangıçta boş bir seans objesi
            };

            // Servis fonksiyonunu çağırarak veriyi Firebase'e kaydet
            const newPatient = await createPatient(newPatientData);

            alert("Hasta başarıyla kaydedildi!");
            onPatientAdded(newPatient); // Yeni hastayı parent component'e bildir
            resetForm(); // Formu temizle
            onClose(); // Dialog'u kapat

        } catch (error) {
            console.error("Hasta kaydedilirken hata oluştu:", error);
            alert("Hasta kaydedilirken bir hata oluştu. Lütfen konsolu kontrol edin.");
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Yeni Hasta Ekle</DialogTitle>
                    <DialogDescription>Yeni hasta bilgilerini girerek kaydı tamamlayın.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div>
                        <Label htmlFor="name">Ad Soyad</Label>
                        <Input 
                            id="name" 
                            placeholder="Hastanın tam adı" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required 
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="age">Yaş</Label>
                            <Input 
                                id="age" 
                                type="number" 
                                placeholder="Örn: 45" 
                                value={age}
                                onChange={(e) => setAge(e.target.value)}
                                required 
                            />
                        </div>
                        <div>
                            <Label htmlFor="gender">Cinsiyet</Label>
                            <Select 
                                value={gender}
                                onValueChange={(value: "male" | "female" | "") => setGender(value)}
                                required
                            >
                                <SelectTrigger id="gender">
                                    <SelectValue placeholder="Cinsiyet seçin" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="female">Kadın</SelectItem>
                                    <SelectItem value="male">Erkek</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="diagnosis">Teşhis</Label>
                        <Input 
                            id="diagnosis" 
                            placeholder="Teşhis bilgisi" 
                            value={diagnosis}
                            onChange={(e) => setDiagnosis(e.target.value)}
                            required 
                        />
                    </div>
                    
                    <div>
                        <Label htmlFor="notes">Notlar</Label>
                        <Textarea 
                            id="notes" 
                            placeholder="Hasta hakkında ek notlar..." 
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                        />
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Kaydediliyor...
                            </>
                        ) : (
                            "Hastayı Kaydet"
                        )}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}