"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar } from "react-chartjs-2";

interface Patient {
  id: string;
  name: string;
  avgScore: number;
}

interface ComparisonTabProps {
  patients: Patient[];
}

export default function ComparisonTab({ patients }: ComparisonTabProps) {
  const barData = {
    labels: patients.map((p) => p.name),
    datasets: [
      {
        label: "Ortalama Skor",
        data: patients.map((p) => p.avgScore),
        backgroundColor: "rgb(59,130,246)",
      },
    ],
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hastalar Arası Karşılaştırma</CardTitle>
      </CardHeader>
      <CardContent>
        <Bar data={barData} />
      </CardContent>
    </Card>
  );
}
