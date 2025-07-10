// src/components/performance-analytics/SessionSelector.tsx
"use client";

import React from 'react';
import { Session } from '@/types/firebase';

interface SessionSelectorProps {
  sessions: Session[];
  onSelect: (sessionId: string) => void;
}

export default function SessionSelector({ sessions, onSelect }: SessionSelectorProps) {
  // Seansları tarihe ve saate göre sırala (en yeni en üstte)
  const sortedSessions = [...sessions].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.startTime || '00:00:00'}`);
    const dateB = new Date(`${b.date}T${b.startTime || '00:00:00'}`);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div className="w-full">
      <label htmlFor="session-select" className="block text-sm font-medium text-gray-700 mb-1">
        Seans Seçin
      </label>
      <select
        id="session-select"
        onChange={(e) => onSelect(e.target.value)}
        className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
        defaultValue=""
      >
        <option value="" disabled>
          Lütfen bir seans seçin...
        </option>
        {sortedSessions.map((session) => (
          <option key={session.id} value={session.id}>
            {session.date} - {session.startTime || 'Başlangıç saati yok'}
          </option>
        ))}
      </select>
    </div>
  );
}