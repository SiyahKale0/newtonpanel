"use client";

import React from "react";
import { Canvas } from "@react-three/fiber";
import { Hand } from "../3d-models/Hand";

interface Finger {
  name: string;
  min: string;
  max: string;
}

interface Hand2DProps {
  fingers: Finger[];
}

// 3D modeldeki parmak uçlarının x koordinatları (normalize edilmiş, -0.5 ile 0.6 arası)
const FINGER_X = [-0.5, -0.25, 0.05, 0.35, 0.6]; // Sol el
const FINGER_X_RIGHT = [0.5, 0.25, -0.05, -0.35, -0.6]; // Sağ el (simetrik)
const FINGER_Y = -0.1; // Uç segmentin üstü için sabit bir y (göz kararı)

// Her parmak için önden bakışa göre optimize edilmiş overlay pozisyonları (Canvas 600x260)
const OVERLAY_VIEW = [
  // Sol el (L1-L5)
  { left: '150px', top: '110px', color: '#2563eb' }, // L1 Başparmak
  { left: '190px', top: '80px', color: '#2563eb' },  // L2 İşaret
  { left: '230px', top: '60px', color: '#2563eb' },  // L3 Orta
  { left: '270px', top: '80px', color: '#2563eb' },  // L4 Yüzük
  { left: '310px', top: '110px', color: '#2563eb' }, // L5 Serçe
  // Sağ el (R1-R5)
  { left: '350px', top: '110px', color: '#059669' }, // R1 Başparmak
  { left: '390px', top: '80px', color: '#059669' },  // R2 İşaret
  { left: '430px', top: '60px', color: '#059669' },  // R3 Orta
  { left: '470px', top: '80px', color: '#059669' },  // R4 Yüzük
  { left: '510px', top: '110px', color: '#059669' }, // R5 Serçe
];

export default function Hand2D({ fingers }: Hand2DProps) {
  // Sol ve sağ el parmaklarını sırayla birleştir
  const leftFingers = fingers.filter(f => f.name.startsWith('L'));
  const rightFingers = fingers.filter(f => f.name.startsWith('R'));
  const allFingers = [...leftFingers, ...rightFingers];

  // Canvas ve el ayarları
  const CANVAS_WIDTH = 600;
  const CANVAS_HEIGHT = 260;
  const EL_OFFSET_X = 0.5; // Sol el -0.5, sağ el +0.5
  const EL_CENTER_X = CANVAS_WIDTH / 2;
  const EL_DIST = 180; // İki el merkezi arası mesafe (px) - daha fazla boşluk
  const EL_CENTER_Y = 140;
  const SCALE = 110; // Modeldeki x koordinatını px'e çevirme katsayısı - daha geniş yay
  const OVERLAY_Y = 75; // Açıklıkların üstteki mesafesi (px) - biraz daha yukarı

  // Sol ve sağ el için overlay pozisyonlarını hesapla
  const overlayPositions = [
    ...FINGER_X.map((x, i) => ({
      left: `${EL_CENTER_X - EL_DIST / 2 + x * SCALE}px`,
      top: `${EL_CENTER_Y - OVERLAY_Y}px`,
      color: '#2563eb',
    })),
    ...FINGER_X.map((x, i) => ({
      left: `${EL_CENTER_X + EL_DIST / 2 - x * SCALE}px`,
      top: `${EL_CENTER_Y - OVERLAY_Y}px`,
      color: '#059669',
    })),
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">El Hareket Açıklığı (3D Modelden 2D Projeksiyon)</h3>
      <div className="relative w-full h-[320px] bg-gray-50 rounded-lg border overflow-hidden">
        <Canvas
          camera={{ position: [0, 0.5, 2.2], fov: 30 }}
          style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT, background: 'transparent', display: 'block', margin: '0 auto' }}
        >
          <ambientLight intensity={0.7} />
          <directionalLight position={[2, 4, 2]} intensity={0.7} />
          {/* Sol El */}
          <group position={[-0.5, -0.45, 0]} scale={[0.45, 0.45, 0.45]}>
            <Hand isRightHand={false} selectedFingers={[]} onFingerClick={() => {}} />
          </group>
          {/* Sağ El */}
          <group position={[0.5, -0.45, 0]} scale={[0.45, 0.45, 0.45]}>
            <Hand isRightHand={true} selectedFingers={[]} onFingerClick={() => {}} />
          </group>
        </Canvas>
        {/* Parmak açıklıkları overlay */}
        {allFingers.map((finger, i) => (
          <div
            key={finger.name}
            style={{
              position: 'absolute',
              left: OVERLAY_VIEW[i]?.left,
              top: OVERLAY_VIEW[i]?.top,
              color: OVERLAY_VIEW[i]?.color,
              transform: 'translate(-50%, -100%)',
              pointerEvents: 'none',
              minWidth: 48,
              textAlign: 'center',
              fontWeight: 600,
              fontSize: 14,
              textShadow: '0 1px 4px #fff',
            }}
          >
            {finger.min}° - {finger.max}°
          </div>
        ))}
      </div>
    </div>
  );
}
