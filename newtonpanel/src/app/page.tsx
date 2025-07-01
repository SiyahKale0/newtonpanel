// src/app/page.tsx
import { redirect } from 'next/navigation';

export default function Home() {
  // Ana sayfaya gelen kullanıcıyı doğrudan /login adresine yönlendir.
  redirect('/login');

  // Yönlendirme sonrası bu kısım asla çalışmayacağı için
  // eski kodları silebilir veya bir 'return null' ekleyebilirsiniz.
  return null;
}