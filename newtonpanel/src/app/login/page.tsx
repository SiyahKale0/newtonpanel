// src/app/login/page.tsx
"use client";

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock, LogIn, Stethoscope } from 'lucide-react';
import { signIn, setupAuthCookies, getUserRole } from '@/services/authService';
import { auth } from '@/services/firebase';

export default function DoctorLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Eğer kullanıcı zaten giriş yapmışsa, onu ilgili panele yönlendir.
  useEffect(() => {
    if (auth.currentUser) {
       router.push('/panel');
    }
  }, [router]);


  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const userCredential = await signIn(email, password);
      const user = userCredential.user;

      if (user) {
        await setupAuthCookies(user);
        const role = await getUserRole(user.uid);

        // Rolüne göre yönlendirme yap
        if (role === 'admin') {
          router.push('/admin');
        } else if (role === 'therapist') {
          router.push('/panel');
        } else {
          throw new Error('Kullanıcı rolü bulunamadı veya geçersiz.');
        }
      } else {
        throw new Error('Giriş başarısız oldu.');
      }

    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
          setError('E-posta veya şifre hatalı.');
      } else {
          setError('Bir hata oluştu. Lütfen tekrar deneyin.');
      }
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
              PhysioXR Panel Girişi
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
