// src/services/authService.ts
import { 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    type User
} from "firebase/auth";
import { get, ref } from "firebase/database";
import { auth, db } from "./firebase";
import { setCookie, deleteCookie } from 'cookies-next';
import type { Therapist } from "@/types/firebase";

// Kullanıcı giriş fonksiyonu
export const signIn = async (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
};

// Kullanıcı çıkış fonksiyonu
export const handleSignOut = async () => {
    await signOut(auth);
    deleteCookie('auth-token');
    deleteCookie('user-role');
    window.location.href = '/login'; // Sayfayı yenileyerek çıkış yap
};

// Kullanıcı durumunu dinleyen fonksiyon
export const onAuthChange = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
};

// Kullanıcının rolünü veritabanından getiren fonksiyon
export const getUserRole = async (uid: string): Promise<'admin' | 'therapist' | null> => {
    const therapistRef = ref(db, `therapists/${uid}`);
    const snapshot = await get(therapistRef);
    if (snapshot.exists()) {
        const therapistData = snapshot.val() as Therapist;
        return therapistData.role;
    }
    return null;
};

// Giriş başarılı olduğunda cookie'leri ayarlayan yardımcı fonksiyon
export const setupAuthCookies = async (user: User) => {
    const token = await user.getIdToken();
    const role = await getUserRole(user.uid);

    setCookie('auth-token', token, { maxAge: 60 * 60 * 1 }); // 1 gün
    if (role) {
        setCookie('user-role', role, { maxAge: 60 * 60 * 1 });
    }
};
