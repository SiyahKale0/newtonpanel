// src/components/three-d-grid.tsx

"use client"

import * as React from "react"
import { Canvas } from "@react-three/fiber"
import { Grid, OrbitControls, Text, Box, Sphere } from "@react-three/drei"
import type { DashboardApple, DashboardBasket } from "@/types/dashboard"

interface ThreeDGridProps {
    apples: DashboardApple[]
    baskets: DashboardBasket[]
    romLimit: number // cm cinsinden
}

// 1 birim = 20cm olarak kabul ediyoruz
const SCALE_FACTOR = 20

// Elma ve Sepet için görsel bileşenler
function AppleModel({ position, type }: { position: [number, number, number], type: "fresh" | "rotten" }) {
    const color = type === "fresh" ? "green" : "saddlebrown"
    return (
        <Sphere position={position} args={[0.15, 16, 16]}>
            <meshStandardMaterial color={color} />
        </Sphere>
    )
}

function BasketModel({ position, type }: { position: [number, number, number], type: "fresh" | "rotten" }) {
    const color = type === 'fresh' ? '#8a5a2a' : '#555555'; // Kahverengi ve Gri tonları
    return (
        <Box position={position} args={[0.5, 0.3, 0.5]}>
            <meshStandardMaterial color={color} wireframe />
        </Box>
    )
}


export function ThreeDGrid({ apples, baskets, romLimit }: ThreeDGridProps) {
    const gridLimit = Math.ceil((romLimit > 0 ? romLimit : 60) / SCALE_FACTOR) // Varsayılan limit 60cm

    return (
        <Canvas
            camera={{ position: [gridLimit * 1.5, gridLimit * 1.5, gridLimit * 2.5], fov: 50 }}
            className="rounded-lg bg-gray-100 dark:bg-gray-800 h-full w-full"
        >
            {/* Işıklandırma */}
            <ambientLight intensity={1.5} />
            <directionalLight position={[5, 5, 5]} intensity={1} />

            {/* Grid ve Eksenler */}
            <Grid
                args={[gridLimit * 2, gridLimit * 2]}
                cellSize={1}
                cellThickness={1}
                cellColor="#6f6f6f"
                sectionSize={1}
                sectionThickness={1.5}
                sectionColor="#4a4a4a"
                fadeDistance={gridLimit * 4}
                infiniteGrid
            />

            {/* Eksen Çizgileri ve Etiketleri */}
            <axesHelper args={[gridLimit + 1]} />
            <Text position={[gridLimit + 1.2, 0, 0]} fontSize={0.3} color="red">X</Text>
            <Text position={[0, gridLimit + 1.2, 0]} fontSize={0.3} color="green">Y</Text>
            <Text position={[0, 0, gridLimit + 1.2]} fontSize={0.3} color="blue">Z</Text>

            {/* ROM Limitini gösteren küre */}
            {romLimit > 0 && (
                <Sphere args={[romLimit / SCALE_FACTOR, 32, 32]} position={[0,0,0]}>
                    <meshStandardMaterial color="lightblue" transparent opacity={0.2} wireframe />
                </Sphere>
            )}

            {/* Nesneler */}
            {apples.map((apple) => (
                <AppleModel
                    key={apple.id}
                    position={[apple.position.x, apple.position.y, apple.position.z]}
                    type={apple.type}
                />
            ))}
            {baskets.map((basket) => (
                <BasketModel
                    key={basket.id}
                    position={[basket.position.x, basket.position.y, basket.position.z]}
                    type={basket.type}
                />
            ))}

            <OrbitControls makeDefault />
        </Canvas>
    )
}