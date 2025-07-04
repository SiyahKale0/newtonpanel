"use client";

import React from "react";

interface FingerProgressTableProps {
  fingers: {
    min: string;
    max: string;
  }[];
}

export default function FingerProgressTable({ fingers }: FingerProgressTableProps) {
  const fingerNames = [
    "Baş Parmak",
    "İşaret Parmak",
    "Orta Parmak",
    "Yüzük Parmak",
    "Serçe Parmak",
    "Parmak 6",
    "Parmak 7",
    "Parmak 8",
    "Parmak 9",
    "Parmak 10",
  ];

  return (
    <div className="p-4 border rounded-lg bg-white shadow">
      <h3 className="text-lg font-semibold mb-4">Parmak Açılma Limitleri</h3>
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr>
            <th className="py-2">Parmak</th>
            <th className="py-2">Min Açı</th>
            <th className="py-2">Max Açı</th>
          </tr>
        </thead>
        <tbody>
          {fingers.map((finger, index) => (
            <tr key={index} className="border-t">
              <td className="py-2">{fingerNames[index] || `Parmak ${index}`}</td>
              <td className="py-2">{finger.min}</td>
              <td className="py-2">{finger.max}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
