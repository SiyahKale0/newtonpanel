import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Users, BarChart2, Settings, FileText } from 'lucide-react';

const TherapistDashboard = () => {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Terapist Paneli</h1>
      <p className="text-muted-foreground">
        Hastalarınızı yönetin, performanslarını analiz edin ve yeni seanslar oluşturun.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Hasta Yönetimi"
          description="Yeni hasta ekleyin, mevcut hastaları görüntüleyin ve düzenleyin."
          icon={<Users className="h-8 w-8 text-blue-500" />}
          link="/panel/patients"
          linkText="Hastalara Git"
        />
        <DashboardCard
          title="Performans Analizi"
          description="Hastaların seans verilerini ve gelişimini detaylı olarak inceleyin."
          icon={<BarChart2 className="h-8 w-8 text-green-500" />}
          link="/panel/analytics"
          linkText="Analiz Sayfasına Git"
        />
        <DashboardCard
          title="Seans Oluşturucu"
          description="Hastalarınıza özel yeni oyun ve egzersiz seansları tasarlayın."
          icon={<Settings className="h-8 w-8 text-purple-500" />}
          link="/panel/session-creator"
          linkText="Yeni Seans Oluştur"
        />
        <DashboardCard
          title="Raporlar"
          description="Hastaların ilerleme raporlarını oluşturun ve indirin."
          icon={<FileText className="h-8 w-8 text-orange-500" />}
          link="/panel/reports"
          linkText="Raporları Görüntüle"
        />
      </div>
    </div>
  );
};

interface DashboardCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  linkText: string;
}

const DashboardCard = ({ title, description, icon, link, linkText }: DashboardCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      <Link href={link} passHref>
        <Button className="w-full">{linkText}</Button>
      </Link>
    </CardContent>
  </Card>
);

export default TherapistDashboard;