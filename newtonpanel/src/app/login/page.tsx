'use client'; // Bu direktif, state ve event handler gibi client-side özelliklerini kullanmamızı sağlar.

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

// Projenizin logosunu veya ilgili bir ikonu import edebilirsiniz.
// import Image from 'next/image';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Formun sayfayı yeniden yüklemesini engelle
    setIsLoading(true);
    setError(null);

    // --- API İSTEĞİ BURADA YAPILACAK ---
    // Bu kısımda kendi backend API'nize istek atacaksınız.
    // Şimdilik 2 saniyelik bir gecikme ile simülasyon yapıyoruz.
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Örnek bir kontrol: Gerçekte API'den dönen cevaba göre kontrol edersiniz.
      if (username === 'doktor' && password === '12345') {
        console.log('Giriş başarılı!');
        // Giriş başarılı olduğunda ana panele yönlendir
        router.push('/dashboard'); // Yönlendirilecek sayfanın yolu
      } else {
        throw new Error('Kullanıcı adı veya şifre hatalı.');
      }
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-lg">
        <div className="text-center">
          {/* Buraya logonuzu ekleyebilirsiniz */}
          {/* <Image src="/logo.svg" alt="Logo" width={100} height={50} className="mx-auto" /> */}
          <h1 className="text-3xl font-bold text-gray-800 mt-4">
            Doktor Giriş Paneli
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Hasta Rehabilitasyon Sistemine Hoş Geldiniz
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="text-sm font-medium text-gray-700"
              >
                Kullanıcı Adı / Doktor ID
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Doktor ID'nizi girin"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Şifre
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}