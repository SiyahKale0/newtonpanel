'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, UserPlus, Gamepad2, BarChart3, Armchair, Hand, Grip, Play, StopCircle } from 'lucide-react';

// 1. Düzeltme: Durumları kendi türü olarak tanımlamak daha temiz bir yöntemdir.
type AppointmentStatus = 'Bekliyor' | 'Aktif' | 'Tamamlandı';

// Veri modelleri için interface'ler
interface Appointment {
  id: string;
  patientName: string;
  date: string;
  // 2. Düzeltme: Interface'de yeni türü kullanıyoruz.
  status: AppointmentStatus;
}

interface GameSettings {
  hand: 'sol' | 'sağ';
  gripType: 'silindirik' | 'kanca' | 'yanal' | 'kubresel';
  level: number;
}

const mockAppointments: Appointment[] = [
  { id: 'randevu1', patientName: 'Ahmet Çelik', date: 'Bugün, 10:00', status: 'Bekliyor' },
  { id: 'randevu2', patientName: 'Zeynep Kaya', date: 'Bugün, 11:30', status: 'Bekliyor' },
  { id: 'randevu3', patientName: 'Mustafa Aydın', date: 'Dün, 14:00', status: 'Tamamlandı' },
];

export default function DashboardPage() {
  const router = useRouter();
  const [doctorName] = useState('Dr. Yılmaz');

  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [activeAppointment, setActiveAppointment] = useState<Appointment | null>(null);
  const [gameSettings, setGameSettings] = useState<GameSettings>({
    hand: 'sağ',
    gripType: 'silindirik',
    level: 1,
  });

  const handleSelectAppointment = (appointment: Appointment) => {
    if (activeAppointment?.id === appointment.id) {
      setActiveAppointment(null);
    } else {
      setActiveAppointment(appointment);
    }
  };

  const handleGameControl = (action: 'start' | 'end') => {
    if (!activeAppointment) return;

    // 3. Düzeltme: Değişkenin türünü açıkça belirtiyoruz.
    const newStatus: AppointmentStatus = action === 'start' ? 'Aktif' : 'Tamamlandı';

    const updatedAppointment: Appointment = { ...activeAppointment, status: newStatus };
    
    setActiveAppointment(updatedAppointment);
    
    setAppointments(prev => 
      prev.map(a => (a.id === activeAppointment.id ? updatedAppointment : a))
    );

    if (action === 'end') {
      setTimeout(() => {
        setActiveAppointment(null);
      }, 1500);
    }
  };
  
  const handleSettingsChange = (field: keyof GameSettings, value: any) => {
    setGameSettings(prev => ({ ...prev, [field]: value }));
  };

  // --- JSX KISMI DEĞİŞMEDİ, AYNI ŞEKİLDE KALABİLİR ---
  return (
    <main className="bg-slate-50 min-h-screen p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800">Hoş Geldiniz, {doctorName}</h1>
        <p className="text-gray-500 mt-1">Rehabilitasyon paneline genel bakış.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 my-8">
          <button onClick={() => router.push('/dashboard/patients/new')} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition text-left flex items-center gap-4">
            <UserPlus className="w-8 h-8 text-blue-500" />
            <div>
              <h3 className="font-bold text-lg">Yeni Hasta Oluştur</h3>
              <p className="text-sm text-gray-500">Sisteme yeni bir hasta ekleyin.</p>
            </div>
          </button>
          <button onClick={() => router.push('/dashboard/analytics')} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition text-left flex items-center gap-4">
            <BarChart3 className="w-8 h-8 text-green-500" />
            <div>
              <h3 className="font-bold text-lg">Hasta Analizleri</h3>
              <p className="text-sm text-gray-500">Heatmap ve ilerleme grafikleri.</p>
            </div>
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow">
            <h2 className="font-bold text-xl mb-4 flex items-center gap-2"><Calendar className="w-5 h-5" /> Bugünkü Randevular</h2>
            <div className="space-y-3">
              {appointments.length > 0 ? appointments.map(appt => (
                <button key={appt.id} onClick={() => handleSelectAppointment(appt)} className={`w-full text-left p-3 rounded-md transition border-2 ${activeAppointment?.id === appt.id ? 'border-blue-500 bg-blue-50' : 'border-transparent hover:bg-gray-100'}`}>
                  <p className="font-semibold">{appt.patientName}</p>
                  <p className="text-sm text-gray-600">{appt.date} - <span className={`font-medium ${appt.status === 'Bekliyor' ? 'text-yellow-600' : appt.status === 'Aktif' ? 'text-green-600' : 'text-gray-500'}`}>{appt.status}</span></p>
                </button>
              )) : (
                <p className="text-gray-500">Bugün için planlanmış randevu yok.</p>
              )}
            </div>
          </div>
          
          <div className="lg:col-span-2">
            {activeAppointment ? (
              <div className="bg-white p-6 rounded-lg shadow animate-fade-in">
                <h2 className="font-bold text-xl mb-4 flex items-center gap-2">
                  <Gamepad2 className="w-6 h-6 text-indigo-600" /> 
                  Oyun Kontrol Merkezi: <span className="text-indigo-600">{activeAppointment.patientName}</span>
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 border-b pb-6">
                  <div>
                    <label className="font-medium text-gray-700 flex items-center gap-2 mb-2"><Hand /> El Seçimi</label>
                    <div className="flex gap-2">
                      <button onClick={() => handleSettingsChange('hand', 'sol')} className={`px-4 py-2 rounded-md w-full transition ${gameSettings.hand === 'sol' ? 'bg-indigo-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>Sol El</button>
                      <button onClick={() => handleSettingsChange('hand', 'sağ')} className={`px-4 py-2 rounded-md w-full transition ${gameSettings.hand === 'sağ' ? 'bg-indigo-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>Sağ El</button>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="gripType" className="font-medium text-gray-700 flex items-center gap-2 mb-2"><Grip /> Kavrama Tipi</label>
                    <select id="gripType" value={gameSettings.gripType} onChange={(e) => handleSettingsChange('gripType', e.target.value)} className="w-full p-2 border rounded-md bg-gray-50 focus:ring-2 focus:ring-indigo-500">
                      <option value="silindirik">Silindirik Kavrama</option>
                      <option value="kanca">Kanca Kavrama</option>
                      <option value="yanal">Yanal Kavrama</option>
                      <option value="kubresel">Küresel Kavrama</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-4">
                  {activeAppointment.status !== 'Aktif' ? (
                    <button onClick={() => handleGameControl('start')} disabled={activeAppointment.status === 'Tamamlandı'} className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white font-bold rounded-lg shadow hover:bg-green-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed">
                      <Play /> {activeAppointment.status === 'Tamamlandı' ? 'Oyun Bitti' : 'Oyunu Başlat'}
                    </button>
                  ) : (
                    <button onClick={() => handleGameControl('end')} className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white font-bold rounded-lg shadow hover:bg-red-600 transition">
                      <StopCircle /> Oyunu Sonlandır
                    </button>
                  )}
                </div>
              </div>
            ) : (
               <div className="flex flex-col items-center justify-center bg-white p-6 rounded-lg shadow h-full text-center">
                 <Armchair className="w-16 h-16 text-gray-300 mb-4" />
                 <h3 className="font-bold text-xl text-gray-700">Oyun kontrolü için bir randevu seçin.</h3>
                 <p className="text-gray-500 mt-2">Lütfen soldaki listeden bir seans başlatın.</p>
               </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}