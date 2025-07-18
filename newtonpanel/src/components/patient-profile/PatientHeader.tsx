// src/components/patient-profile/PatientHeader.tsx
import { Patient } from '@/types/firebase';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { User, Stethoscope, FileText, CalendarDays } from 'lucide-react';

interface PatientHeaderProps {
  patient: Patient;
  sessionCount: number;
}

export function PatientHeader({ patient, sessionCount }: PatientHeaderProps) {
  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="bg-muted/30">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-full">
             <User className="w-8 h-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">{patient.name}</CardTitle>
            <CardDescription className="text-base">{patient.diagnosis}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6 text-sm">
          
          <div className="flex items-center col-span-1 sm:col-span-2 md:col-span-3">
            <FileText className="w-4 h-4 mr-3 flex-shrink-0 text-muted-foreground" />
            <div>
              <span className="font-semibold">Doktor Notu:</span>
              <p className="text-muted-foreground italic">"{patient.note || 'Hastaya özel not eklenmemiş.'}"</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <CalendarDays className="w-5 h-5 text-muted-foreground" />
            <div className="flex items-baseline">
                <span className="font-semibold">Yaş:</span>
                <span className="ml-2 text-lg text-foreground">{patient.age}</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Stethoscope className="w-5 h-5 text-muted-foreground" />
             <div className="flex items-baseline">
                <span className="font-semibold">Toplam Seans:</span>
                <span className="ml-2 text-lg text-foreground">{sessionCount}</span>
            </div>
          </div>

        </div>
      </CardContent>
    </Card>
  );
}
