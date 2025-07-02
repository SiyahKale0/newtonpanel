// src/services/firebase.ts

import { initializeApp, getApp, getApps } from "firebase/app";
import { getDatabase } from "firebase/database";

// Projenizin Firebase konfigürasyon bilgileri
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

// Sunucu tarafında render alırken oluşabilecek hataları engellemek için kontrol
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getDatabase(app);

export { app, db };