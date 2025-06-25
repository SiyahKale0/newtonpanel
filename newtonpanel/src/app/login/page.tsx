// app/login/page.tsx

"use client"; // Bu bileşenin bir istemci bileşeni olduğunu belirtir.
              // Çünkü useState, useEffect gibi hook'lar kullanacağız.

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation'; // App Router için yeni yönlendirici
import { User, Lock, LogIn, Stethoscope } from 'lucide-react';

export default function DoctorLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Form gönderildiğinde çalışacak fonksiyon
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Sayfanın yeniden yüklenmesini engelle
    setIsLoading(true);
    setError(null);

    // --- GERÇEK API İSTEĞİ BURADA YAPILACAK ---
    // Bu kısımda kendi backend'inize bir istek göndermeniz gerekir.
    // Şimdilik bunu bir bekleme süresiyle simüle ediyoruz.
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // 1.5 saniye bekle

      // Örnek doğrulama
      if (email === 'doktor@ornek.com' && password === 'guvenliSifre123') {
        console.log('Giriş başarılı!');
        // Giriş başarılı olursa kullanıcıyı dashboard'a yönlendir
        router.push('/dashboard'); 
      } else {
        throw new Error('E-posta veya şifre hatalı.');
      }
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false); // İşlem bitince yükleme durumunu kapat
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
          {/* E-posta Alanı */}
          <div className="relative">
            <label
              htmlFor="email"
              className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300 sr-only"
            >
              E-posta Adresi
            </label>
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <User className="w-5 h-5 text-gray-400" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="block w-full py-3 pl-10 pr-3 text-gray-900 bg-gray-50 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="E-posta Adresi"
            />
          </div>

          {/* Şifre Alanı */}
          <div className="relative">
            <label
              htmlFor="password"
              className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300 sr-only"
            >
              Şifre
            </label>
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Lock className="w-5 h-5 text-gray-400" />
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="block w-full py-3 pl-10 pr-3 text-gray-900 bg-gray-50 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Şifre"
            />
          </div>
          
          {/* Hata Mesajı */}
          {error && (
            <div className="p-3 text-sm text-center text-red-800 bg-red-100 rounded-md dark:bg-red-200 dark:text-red-900">
              {error}
            </div>
          )}

          {/* Giriş Butonu */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed dark:disabled:bg-blue-800"
            >
              {isLoading ? (
                <>
                  <svg className="w-5 h-5 mr-3 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Giriş Yapılıyor...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Giriş Yap
                </>
              )}
            </button>
          </div>
        </form>

        <div className="text-sm text-center">
            <a href="#" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
              Şifrenizi mi unuttunuz?
            </a>
        </div>
      </div>
    </div>
  );
}