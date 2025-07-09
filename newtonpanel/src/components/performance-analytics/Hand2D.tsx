"use client";

import React from "react";

interface Finger {
  name: string;
  min: string;
  max: string;
  x: number;
  y: number;
}

interface Hand2DProps {
  fingers: Finger[];
}

export default function Hand2D({ fingers }: Hand2DProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">El Hareket Açıklığı (2D Görünüm)</h3>
      <div className="relative w-full h-80 bg-gray-50 rounded-lg border">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 400 320"
          className="absolute inset-0"
        >
          {/* Hand outline */}
          <path
            d="M 200 280 Q 180 260 160 240 Q 140 220 120 200 Q 100 180 90 160 Q 80 140 85 120 Q 90 100 100 80 Q 110 60 130 50 Q 150 40 170 45 Q 190 50 210 45 Q 230 40 250 50 Q 270 60 280 80 Q 290 100 295 120 Q 300 140 290 160 Q 280 180 260 200 Q 240 220 220 240 Q 200 260 200 280 Z"
            fill="none"
            stroke="#374151"
            strokeWidth="2"
          />
          
          {/* Finger indicators */}
          {fingers.map((finger, index) => (
            <g key={finger.name}>
              <circle
                cx={finger.x}
                cy={finger.y}
                r="8"
                fill="#3B82F6"
                stroke="#1E40AF"
                strokeWidth="2"
              />
              <text
                x={finger.x}
                y={finger.y + 4}
                textAnchor="middle"
                fontSize="10"
                fill="#1F2937"
                fontWeight="bold"
              >
                {finger.name}
              </text>
              <text
                x={finger.x}
                y={finger.y + 20}
                textAnchor="middle"
                fontSize="8"
                fill="#6B7280"
              >
                {finger.min}° - {finger.max}°
              </text>
            </g>
          ))}
        </svg>
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium text-sm text-gray-700 mb-2">Sol El</h4>
          <div className="space-y-1">
            {fingers
              .filter(f => f.name.startsWith('L'))
              .map(finger => (
                <div key={finger.name} className="text-xs text-gray-600">
                  {finger.name}: {finger.min}° - {finger.max}°
                </div>
              ))}
          </div>
        </div>
        <div>
          <h4 className="font-medium text-sm text-gray-700 mb-2">Sağ El</h4>
          <div className="space-y-1">
            {fingers
              .filter(f => f.name.startsWith('R'))
              .map(finger => (
                <div key={finger.name} className="text-xs text-gray-600">
                  {finger.name}: {finger.min}° - {finger.max}°
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
