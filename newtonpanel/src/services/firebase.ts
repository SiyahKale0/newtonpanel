// src/services/firebase.ts

// Firebase'in temel kütüphanelerini import et
import { initializeApp, getApp, getApps } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";

// Projenizin Firebase yapılandırma bilgileri.
// Bu bilgiler Firebase projenizin ayarlar sayfasından alınır.
const firebaseConfig = {
    apiKey: "AIzaSyBBG0dsK1GZL407sOgVtriG829Aadnjy-o",
    authDomain: "unityrehabilitationar.firebaseapp.com",
    databaseURL: "https://unityrehabilitationar-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "unityrehabilitationar",
    storageBucket: "unityrehabilitationar.firebasestorage.app",
    messagingSenderId: "829647184082",
    appId: "1:829647184082:web:a5c469dc64e3f57f0f8d0b",
    measurementId: "G-YE1WEJKK63"
};

// Firebase uygulamasını başlatmak için bir kontrol mekanizması.
// Eğer daha önce bir uygulama başlatılmamışsa, yenisini başlat.
// Bu, Next.js gibi ortamlarda sayfa yenilendiğinde "Firebase App is already initialized"
// hatasını almayı önler.
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Firebase Realtime Database servisine erişimi sağla.
const db = getDatabase(app);
const auth = getAuth(app);

// Başlatılan uygulama (app), veritabanı (db) ve kimlik doğrulama (auth) nesnelerini
// projenin diğer kısımlarında kullanabilmek için dışa aktar.
export { app, db, auth };

export interface Rom {
  id?: string; // Firebase ID'si, opsiyonel bırakabilirsin
  arm: {
    leftSpace: number;
    rightSpace: number;
  };
  fingers: {
    [key: string]: {
      min: string;
      max: string;
    };
  };
}
