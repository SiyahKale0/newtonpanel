// src/components/performance-analytics/AnalyticsHeader.tsx
"use client";

import React from 'react';
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { Patient } from '@/types/firebase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, User, BarChart3, Calendar as CalendarIcon } from 'lucide-react';

interface AnalyticsHeaderProps {
  loading: boolean;
  allPatients: Patient[];
  selectedPatientId: string | null;
  onPatientChange: (id: string) => void;
  date: DateRange | undefined;
  onDateChange: (date: DateRange | undefined) => void;
}

export const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({
  loading,
  allPatients,
  selectedPatientId,
  onPatientChange,
  date,
  onDateChange,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6" />
          Gelişmiş Performans Analizi
        </CardTitle>
        <CardDescription>
          Hasta seçerek detaylı performans analizini ve grafiklerini görüntüleyin.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Hastalar yükleniyor...
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <User className="text-muted-foreground" />
              <Select value={selectedPatientId || ""} onValueChange={onPatientChange}>
                <SelectTrigger className="w-full md:w-[280px]">
                  <SelectValue placeholder="Analiz için bir hasta seçin..." />
                </SelectTrigger>
                <SelectContent>
                  {allPatients.map(patient => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={"outline"}
                    className="w-full md:w-[300px] justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date?.from ? (
                      date.to ? (
                        <>
                          {format(date.from, "LLL dd, y")} -{" "}
                          {format(date.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(date.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Tarih aralığı seçin</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={onDateChange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};