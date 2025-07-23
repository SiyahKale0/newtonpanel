import type { Metadata } from "next";
import "./globals.css";

// If you want to re-enable fonts later:
// import { Geist, Geist_Mono } from "next/font/google";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

import { AuthProvider } from "@/hooks/use-auth";

export const metadata: Metadata = {
  title: "Newton Panel",
  description: "Rehabilitasyon ve Terapi Yönetim Paneli",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
