"use client"

import { useState, FormEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { updatePatient } from "@/services/patientService";
import { Patient } from "@/types/firebase";

interface EditPatientDialogProps {
    patient: Patient | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onPatientUpdated: () => void;
}

export function EditPatientDialog({ patient, open, onOpenChange, onPatientUpdated }: EditPatientDialogProps) {
    const [name, setName] = useState("");
    const [age, setAge] = useState("");
    const [diagnosis, setDiagnosis] = useState("");
    const [gender, setGender] = useState<"male" | "female" | "">("");
    const [notes, setNotes] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (patient) {
            setName(patient.name || "");
            setAge(patient.age?.toString() || "");
            setDiagnosis(patient.diagnosis || "");
            setGender(patient.isFemale ? "female" : "male");
            setNotes(patient.note || "");
        }
    }, [patient]);

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        if (!patient) return;

        setIsSubmitting(true);
        try {
            const updatedData: Partial<Omit<Patient, 'id'>> = {
                name,
                age: parseInt(age, 10),
                diagnosis,
                isFemale: gender === 'female',
                note: notes,
            };
            await updatePatient(patient.id, updatedData);
            alert("Hasta başarıyla güncellendi!");
            onPatientUpdated();
            onOpenChange(false);
        } catch (error) {
            console.error("Hasta güncellenirken hata:", error);
            alert("Hasta güncellenirken bir hata oluştu.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => onOpenChange(false);

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Hasta Bilgilerini Düzenle</DialogTitle>
                    <DialogDescription>{patient?.name} adlı hastanın bilgilerini güncelleyin.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div>
                        <Label htmlFor="edit-name">Ad Soyad</Label>
                        <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="edit-age">Yaş</Label>
                            <Input id="edit-age" type="number" value={age} onChange={(e) => setAge(e.target.value)} required />
                        </div>
                        <div>
                            <Label htmlFor="edit-gender">Cinsiyet</Label>
                            <Select value={gender} onValueChange={(v: "male" | "female" | "") => setGender(v)} required>
                                <SelectTrigger id="edit-gender"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="female">Kadın</SelectItem>
                                    <SelectItem value="male">Erkek</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="edit-diagnosis">Teşhis</Label>
                        <Input id="edit-diagnosis" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} required />
                    </div>

                    <div>
                        <Label htmlFor="edit-notes">Notlar</Label>
                        <Textarea id="edit-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={handleClose}>İptal</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Güncelleniyor...</> : "Bilgileri Güncelle"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}