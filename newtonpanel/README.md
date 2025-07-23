# Proje İş Paketleri ve Analiz Planı

## İş Paketleri
- Portal ihtiyaç analizinin yapılması (terapist tarafı)
- Terapist portalının tasarımı ve temel özelliklerin kodlanması
- Hasta ve seans yönetimi modüllerinin geliştirilmesi (hasta ekle, düzenle, sil + seans geçmişi görüntüleme)
- Performans analitiği ve ilerleme takibi modülleri (doğruluk, tepki süresi, başarı oranı, zaman serileri)
- Grafik ve görselleştirme modülü (zaman serileri, ısı haritaları)
- Özel seans konfigürasyon ve giriş/kimlik doğrulama modülleri
- Firebase veri senkronizasyonu ve testler
- Terapist not ekleme ve hastaya özel egzersiz önerisi modülü
- Kullanıcı yetkilendirme ve rol bazlı erişim kontrolü (admin, terapist)
- Portal üzerinden kişiselleştirme parametrelerini düzenleme ve izleme ekranı

## Kullanılacak Yöntemler ve İncelenecek Parametreler
- Terapist portalı, React veya Next.js frontend teknolojisiyle geliştirilecek, backend için Firebase Cloud Functions veya Node.js kullanılacaktır.
- Kullanıcı arayüzü tasarımında Material-UI ve responsive design ilkeleri kullanılacak.
- Veri güvenliği için OAuth 2.0 tabanlı kimlik doğrulama ve JWT token yönetimi uygulanacaktır.
- Veri görselleştirme için Chart.js, D3.js gibi kütüphaneler kullanılacak. Isı haritaları için özel plotlama algoritmaları geliştirilecek.

**Parametreler:**
- Kullanıcı yetkilendirme başarısı ve erişim doğruluğu
- Grafik yüklenme süresi (ms cinsinden)
- Kullanıcı memnuniyeti (anket ile)
- Portal yanıt süresi (API response time)
- Kişiselleştirme parametrelerinin portalda güncellenme doğruluğu

## Deney, Test ve Analizler
- **Kullanılabilirlik Testi:** Terapistlerle yürütülen UX değerlendirmeleri
- **Güvenlik Testleri:** Yetkisiz erişim denemeleri ve penetrasyon testi
- **Performans Testi:** Portalın yük altında API yanıt sürelerinin ölçülmesi
- **Grafik Doğruluk Testi:** Gerçek verilerin doğru ve eksiksiz görselleştirilip görselleştirilmediğinin kontrolü
- **Veri Tutarlılık Testi:** Firebase ile portal arası veri senkronizasyonu analizi

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
