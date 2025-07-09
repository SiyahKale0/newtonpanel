// src/components/performance-analytics/PatientSelector.tsx
"use client";

import React from 'react';
import { Patient } from '@/types/firebase';

interface PatientSelectorProps {
  patients: Patient[];
  onSelect: (patientId: string) => void;
}

export default function PatientSelector({ patients, onSelect }: PatientSelectorProps) {
  return (
    <div className="w-full">
      <label htmlFor="patient-select" className="block text-sm font-medium text-gray-700 mb-1">
        Hasta Seçin
      </label>
      <select
        id="patient-select"
        onChange={(e) => onSelect(e.target.value)}
        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        defaultValue=""
      >
        <option value="" disabled>
          Lütfen bir hasta seçin...
        </option>
        {patients.map((patient) => (
          <option key={patient.id} value={patient.id}>
            {patient.name}
          </option>
        ))}
      </select>
    </div>
  );
}