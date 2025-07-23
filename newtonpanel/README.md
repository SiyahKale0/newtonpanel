This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

---

# İş Paketi Faaliyetleri

1. Portal ihtiyaç analizinin yapılması (terapist tarafı)
2. Terapist portalının tasarımı ve temel özelliklerin kodlanması
3. Hasta ve seans yönetimi modüllerinin geliştirilmesi (hasta ekle, düzenle, sil + seans geçmişi görüntüleme)
4. Performans analitiği ve ilerleme takibi modülleri (doğruluk, tepki süresi, başarı oranı, zaman serileri)
5. Grafik ve görselleştirme modülü (zaman serileri, ısı haritaları)
6. Özel seans konfigürasyon ve giriş/kimlik doğrulama modülleri
7. Firebase veri senkronizasyonu ve testler
8. Terapist not ekleme ve hastaya özel egzersiz önerisi modülü
9. Kullanıcı yetkilendirme ve rol bazlı erişim kontrolü (admin, terapist)
10. Portal üzerinden kişiselleştirme parametrelerini düzenleme ve izleme ekranı

# Kullanılacak Yöntemler ve İncelenecek Parametreler

**Yöntemler:**
- Frontend: React veya Next.js
- Backend: Firebase Cloud Functions veya Node.js
- UI Tasarımı: Material-UI, responsive design
- Kimlik Doğrulama: OAuth 2.0, JWT token yönetimi
- Veri Görselleştirme: Chart.js, D3.js
- Isı Haritaları: Özel plotlama algoritmaları

**İncelenecek Parametreler:**
- Kullanıcı yetkilendirme başarısı ve erişim doğruluğu
- Grafik yüklenme süresi (ms cinsinden)
- Kullanıcı memnuniyeti (anket ile)
- Portal yanıt süresi (API response time)
- Kişiselleştirme parametrelerinin portalda güncellenme doğruluğu

# Deney, Test ve Analizler

1. Kullanılabilirlik Testi: Terapistlerle yürütülen UX değerlendirmeleri
2. Güvenlik Testleri: Yetkisiz erişim denemeleri ve penetrasyon testi
3. Performans Testi: Portalın yük altında API yanıt sürelerinin ölçülmesi
4. Grafik Doğruluk Testi: Gerçek verilerin doğru ve eksiksiz görselleştirilip görselleştirilmediğinin kontrolü
5. Veri Tutarlılık Testi: Firebase ile portal arası veri senkronizasyonu analizi
