// src/components/device-management/AddDeviceDialog.tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";

export function AddDeviceDialog() {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Yeni Cihaz Ekle
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Yeni MetaQuest Cihazı Ekle</DialogTitle>
                    <DialogDescription>Yeni cihazın bilgilerini girerek kaydı tamamlayın.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div>
                        <Label htmlFor="deviceName">Cihaz Adı</Label>
                        <Input id="deviceName" placeholder="Örn: MetaQuest-06" />
                    </div>
                    <div>
                        <Label htmlFor="serialNumber">Seri Numarası</Label>
                        <Input id="serialNumber" placeholder="Cihazın seri numarası" />
                    </div>
                    <Button className="w-full">Cihazı Kaydet</Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}