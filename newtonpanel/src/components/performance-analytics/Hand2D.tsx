"use client";

import React from "react";

const FINGER_NAMES = [
  "Sol Serçe", "Sol Yüzük", "Sol Orta", "Sol İşaret", "Sol Başparmak",
  "Sağ Başparmak", "Sağ İşaret", "Sağ Orta", "Sağ Yüzük", "Sağ Serçe"
];

const FINGER_POSITIONS = [
    { x: 40, y: 100 },   // Sol Serçe
    { x: 75, y: 80 },    // Sol Yüzük
    { x: 110, y: 75 },   // Sol Orta
    { x: 145, y: 85 },   // Sol İşaret
    { x: 170, y: 130 },  // Sol Başparmak
    { x: 230, y: 130 },  // Sağ Başparmak
    { x: 255, y: 85 },   // Sağ İşaret
    { x: 290, y: 75 },   // Sağ Orta
    { x: 325, y: 80 },   // Sağ Yüzük
    { x: 360, y: 100 },  // Sağ Serçe
];

interface FingerIndicatorProps {
  x: number;
  y: number;
  name: string;
  value: number;
}

function FingerIndicator({ x, y, name, value }: FingerIndicatorProps) {
  const color = value >= 80 ? "#10B981" : value >= 45 ? "#F59E0B" : "#EF4444";
  return (
    <g transform={`translate(${x}, ${y})`}>
      <circle cx="0" cy="0" r="18" fill={color} stroke="#fff" strokeWidth="2" />
      <text
        x="0"
        y="5"
        textAnchor="middle"
        fontSize="12"
        fill="#fff"
        fontWeight="bold"
      >
        {value}°
      </text>
      <text x="0" y="32" textAnchor="middle" fontSize="10" fill="#374151">
        {name}
      </text>
    </g>
  );
}

interface Hand2DProps {
  fingerData: number[]; // Array of 10 values for max angle
}

export default function Hand2D({ fingerData }: Hand2DProps) {
    if (!fingerData || fingerData.length !== 10) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">El Hareket Açıklığı (2D Görünüm)</h3>
              <div className="relative w-full h-80 bg-gray-50 rounded-lg border flex items-center justify-center">
                  <p className="text-muted-foreground">Parmak verisi yüklenemedi.</p>
              </div>
            </div>
        );
    }

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">El Hareket Açıklığı (Maksimum Açı)</h3>
        <div className="relative w-full h-80 bg-gray-100 dark:bg-gray-800/50 rounded-lg border">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 400 220"
            className="absolute inset-0"
          >
            {/* Outlines */}
            <path d="M 180 170 C 170 150, 150 130, 130 120 C 100 105, 80 110, 70 130 C 60 150, 50 180, 40 200 L 150 210 Z" fill="#E5E7EB" className="dark:fill-gray-700" />
            <path d="M 220 170 C 230 150, 250 130, 270 120 C 300 105, 320 110, 330 130 C 340 150, 350 180, 360 200 L 250 210 Z" fill="#E5E7EB" className="dark:fill-gray-700" />

            {/* Indicators */}
            {fingerData.map((value, index) => (
              <FingerIndicator
                key={index}
                x={FINGER_POSITIONS[index].x}
                y={FINGER_POSITIONS[index].y}
                name={FINGER_NAMES[index]}
                value={value}
              />
            ))}
          </svg>
      </div>
      <div className="mt-4 text-xs text-muted-foreground">
          * Renkler: Yeşil (&gt;=80°), Sarı (45°-79°), Kırmızı (&lt;45°). Değerler, parmakların maksimum açılma açılarını (derece°) göstermektedir.
        </div>
      </div>
    );
  }