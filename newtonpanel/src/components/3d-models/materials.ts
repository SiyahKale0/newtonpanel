// src/components/3d-models/materials.ts
import * as THREE from 'three';

export const skinMaterial = new THREE.MeshStandardMaterial({
    color: "#e6bfab",
    roughness: 0.6,
    metalness: 0.1,
});

export const selectedMaterial = new THREE.MeshStandardMaterial({
    color: "#ff6347", // Domates Rengi
    roughness: 0.5,
    metalness: 0.1,
    emissive: "#300000" // Seçiliyken hafif bir ışıma
});