// src/components/performance-analytics/FingerProgressTable.tsx
"use client";

import React from "react";

// Props tipi, parmak adı ile min/max değerlerini içerir
interface FingerProgressTableProps {
  fingers: {
    name: string;
    min: string;
    max: string;
  }[];
}

export default function FingerProgressTable({ fingers }: FingerProgressTableProps) {
  // Gelen 'fingers' dizisi boş veya tanımsızsa bir mesaj göster
  if (!fingers || fingers.length === 0) {
    return (
        <div className="p-4 border rounded-lg bg-white shadow">
            <h3 className="text-lg font-semibold mb-4">Parmak Açılma Limitleri</h3>
            <p>Görüntülenecek parmak verisi bulunamadı.</p>
        </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg bg-white shadow">
      <h3 className="text-lg font-semibold mb-4">Parmak Açılma Limitleri</h3>
      <table className="min-w-full text-left text-sm">
        <thead className="border-b">
          <tr>
            <th className="py-2 font-medium">Parmak</th>
            <th className="py-2 font-medium">Min Açı</th>
            <th className="py-2 font-medium">Max Açı</th>
          </tr>
        </thead>
        <tbody>
          {fingers.map((finger) => (
            // 'key' olarak parmak ismi kullanıldı
            <tr key={finger.name} className="border-t">
              <td className="py-2">{finger.name}</td>
              {/* Değerlerin sonunda "°" sembolü gösterilir */}
              <td className="py-2">{finger.min}°</td>
              <td className="py-2">{finger.max}°</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}