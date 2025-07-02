import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Eye, Edit, AtSign, Hash } from "lucide-react";

interface DoctorCardProps {
  doctor: {
    id: string;
    name: string;
    specialization: string;
    email: string;
    status: "active" | "inactive";
  };
}

export function DoctorCard({ doctor }: DoctorCardProps) {
  const statusVariant = doctor.status === "active" ? "default" : "secondary";
  const statusClass = doctor.status === "active" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" : "";

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              {doctor.name}
            </CardTitle>
            <CardDescription>{doctor.specialization}</CardDescription>
          </div>
          <Badge variant={statusVariant} className={statusClass}>
            {doctor.status === "active" ? "Aktif" : "Pasif"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm border-t pt-4">
            <div>
              <span className="text-muted-foreground">Email:</span>
              <span className="ml-2 font-medium flex items-center"><AtSign className="w-4 h-4 mr-1" />{doctor.email}</span>
            </div>
            <div>
              <span className="text-muted-foreground">ID:</span>
              <span className="ml-2 font-medium flex items-center"><Hash className="w-4 h-4 mr-1" />{doctor.id}</span>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" className="flex-1"><Eye className="w-4 h-4 mr-2" />Detaylar</Button>
            <Button variant="outline" size="sm" className="flex-1"><Edit className="w-4 h-4 mr-2" />Düzenle</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
