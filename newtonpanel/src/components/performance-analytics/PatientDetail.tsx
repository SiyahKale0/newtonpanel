"use client"

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Line } from "react-chartjs-2";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);


interface Session {
  no: number;
  score: number;
}

interface Patient {
  id: string;
  name: string;
  diagnosis: string;
  age: number;
  comment?: string;
  sessions: Session[];
}

interface PatientDetailProps {
  patient: Patient;
  onClose: () => void;
}

export default function PatientDetail({ patient, onClose }: PatientDetailProps) {
  const [comment, setComment] = useState(patient.comment || "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await savePatientComment(patient.id, comment);
      alert("Yorum kaydedildi!");
    } catch (error) {
      console.error(error);
      alert("Kaydetme sırasında hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  const lineData = {
    labels: patient.sessions.map((s) => `Seans ${s.no}`),
    datasets: [{
      label: "Skor",
      data: patient.sessions.map((s) => s.score),
      borderColor: "rgb(59,130,246)",
      tension: 0.3,
    }],
  };

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle>{patient.name}</CardTitle>
          <CardDescription>{patient.diagnosis} | {patient.age} yaş</CardDescription>
        </div>
        <Button variant="ghost" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Seans Skorları</h3>
          <Line data={lineData} />
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Doktor Yorumu</h3>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Hastaya özel yorumunuz"
          />
          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              "Kaydet"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// 🔧 Dummy save function
async function savePatientComment(id: string, comment: string) {
  return new Promise((res) => setTimeout(res, 1500));
}
