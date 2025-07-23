// src/app/layout.tsx
"use client"; // Bu bileşeni istemci tarafında çalıştırmak için

import { useEffect } from "react";
import "./globals.css";
import { initializeDefaultUsers } from "@/lib/firebaseSetup";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  // Uygulama ilk yüklendiğinde varsayılan kullanıcıları kontrol et ve oluştur
  useEffect(() => {
    // Bu fonksiyonun sadece bir kez çalışmasını sağlıyoruz.
    initializeDefaultUsers();
  }, []); // Boş bağımlılık dizisi, sadece component mount olduğunda çalışmasını sağlar

  return (
    <html lang="tr">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
