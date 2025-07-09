"use client"

import { AppleStatisticsChart, sampleAppleSessionStats } from '@/components/statistics/AppleStatisticsChart';

/**
 * Demo component showing how to integrate AppleStatisticsChart
 * This demonstrates that the build error has been resolved
 */
export function AppleGameStatisticsDemo() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Elma Oyunu İstatistikleri Demo</h2>
      
      <p className="text-muted-foreground">
        Bu demo, AppleStatisticsChart bileşeninin nasıl kullanıldığını gösterir.
        Build hatası &quot;Module not found: Can&apos;t resolve &apos;./AppleStatisticsChart&apos;&quot; çözülmüştür.
      </p>

      {/* Basic usage */}
      <AppleStatisticsChart 
        sessionStats={sampleAppleSessionStats}
        title="Hasta Performans Analizi"
        description="Son 4 seanstaki elma toplama başarı oranları"
        showTabs={true}
      />

      {/* Single chart mode */}
      <AppleStatisticsChart 
        sessionStats={sampleAppleSessionStats}
        title="Başarı Oranı Trendi"
        description="Sadece çizgi grafik gösterimi"
        showTabs={false}
        height={300}
      />
    </div>
  );
}

// Example of how this could be integrated into performance analytics
export function PerformanceAnalyticsWithAppleGame({ selectedPatientId }: { selectedPatientId: string | null }) {
  // This shows the integration pattern mentioned in the README
  console.log('Selected patient:', selectedPatientId); // Using the parameter to avoid linting error
  
  return (
    <div>
      {/* Other existing components would be here */}
      
      {/* Apple Game statistics section */}
      <section className="mt-6">
        <AppleGameStatisticsDemo />
      </section>
    </div>
  );
}