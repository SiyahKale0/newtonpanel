// src/app/login/page.tsx
"use client";

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock, LogIn, Stethoscope } from 'lucide-react';
import { setCookie } from 'cookies-next'; // Cookie ayarlamak için yardımcı kütüphane

export default function DoctorLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Sunucuya istek gönderiyormuş gibi 1 saniye bekle
      await new Promise(resolve => setTimeout(resolve, 1000));

      // E-posta ve şifre kontrolü
      if (email === 'd@d.d' && password === 'd') {

        // --- YÖNLENDİRME İÇİN EN ÖNEMLİ KISIM ---
        // 1. Başarılı girişi kanıtlayan bir cookie oluştur.
        //    Bu cookie, middleware tarafından okunacak.
        setCookie('auth-token', 'gizli-ve-guvenli-bir-token', { maxAge: 1 * 1 * 1 }); // 1 gün geçerli

        // 2. Kullanıcıyı panel sayfasına yönlendir.
        router.push('/panel');

      } else {
        throw new Error('E-posta veya şifre hatalı.');
      }
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg dark:bg-gray-800">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Stethoscope size={48} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Doktor Giriş Paneli
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Lütfen bilgilerinizi girerek devam edin.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <User className="w-5 h-5 text-gray-400" />
              </div>
              <input id="email" name="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} className="block w-full py-3 pl-10 pr-3 text-gray-900 bg-gray-50 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="E-posta Adresi"/>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Lock className="w-5 h-5 text-gray-400" />
              </div>
              <input id="password" name="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} className="block w-full py-3 pl-10 pr-3 text-gray-900 bg-gray-50 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" placeholder="Şifre"/>
            </div>

            {error && (<div className="p-3 text-sm text-center text-red-800 bg-red-100 rounded-md dark:bg-red-200 dark:text-red-900">{error}</div>)}

            <div>
              <button type="submit" disabled={isLoading} className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 dark:disabled:bg-blue-800">
                {isLoading ? 'Giriş Yapılıyor...' : <><LogIn className="w-5 h-5 mr-2" /> Giriş Yap</>}
              </button>
            </div>
          </form>
        </div>
      </div>
  );
}