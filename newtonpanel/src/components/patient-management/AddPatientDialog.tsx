// src/components/patient-management/AddPatientDialog.tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";

export function AddPatientDialog() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Yeni Hasta Ekle
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Yeni Hasta Ekle</DialogTitle>
                    <DialogDescription>Yeni hasta bilgilerini girerek kaydı tamamlayın.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div>
                        <Label htmlFor="name">Ad Soyad</Label>
                        <Input id="name" placeholder="Hastanın tam adı" />
                    </div>
                    <div>
                        <Label htmlFor="age">Yaş</Label>
                        <Input id="age" type="number" placeholder="Örn: 45" />
                    </div>
                    <div>
                        <Label htmlFor="diagnosis">Teşhis</Label>
                        <Input id="diagnosis" placeholder="Teşhis bilgisi" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="arm">Egzersiz Kolu</Label>
                            <Select>
                                <SelectTrigger id="arm">
                                    <SelectValue placeholder="Kol seçin" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="right">Sağ</SelectItem>
                                    <SelectItem value="left">Sol</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="rom">ROM Limiti (cm)</Label>
                            <Input id="rom" type="number" placeholder="Örn: 60" />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="notes">Notlar</Label>
                        <Textarea id="notes" placeholder="Hasta hakkında ek notlar..." />
                    </div>
                    <Button className="w-full">Hastayı Kaydet</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}