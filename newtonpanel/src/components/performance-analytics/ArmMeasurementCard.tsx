"use client";

import React from "react";

interface ArmMeasurementCardProps {
  leftSpace: number;
  rightSpace: number;
}

export default function ArmMeasurementCard({
  leftSpace,
  rightSpace,
}: ArmMeasurementCardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="p-4 border rounded-lg bg-white shadow">
        <h3 className="text-lg font-semibold mb-2">Sol Kol Mesafesi</h3>
        <p className="text-3xl font-bold text-blue-600">{leftSpace} cm</p>
      </div>

      <div className="p-4 border rounded-lg bg-white shadow">
        <h3 className="text-lg font-semibold mb-2">Sağ Kol Mesafesi</h3>
        <p className="text-3xl font-bold text-green-600">{rightSpace} cm</p>
      </div>
    </div>
  );
}
