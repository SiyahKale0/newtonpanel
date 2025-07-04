"use strict";
// src/services/firebase.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = exports.app = void 0;
// Firebase'in temel kütüphanelerini import et
const app_1 = require("firebase/app");
const database_1 = require("firebase/database");
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
const app = !(0, app_1.getApps)().length ? (0, app_1.initializeApp)(firebaseConfig) : (0, app_1.getApp)();
exports.app = app;
// Firebase Realtime Database servisine erişimi sağla.
const db = (0, database_1.getDatabase)(app);
exports.db = db;
