// src/lib/firebaseSetup.ts
import { auth, db } from '@/services/firebase';
import { createUserWithEmailAndPassword, fetchSignInMethodsForEmail } from "firebase/auth";
import { ref, set, get } from "firebase/database";
import type { Therapist } from '@/types/firebase';

/**
 * Verilen bilgilere göre Firebase'de bir kullanıcı (admin/terapist) oluşturur.
 * Eğer kullanıcı zaten varsa, işlem yapmaz.
 * @param email Kullanıcı e-postası
 * @param password Kullanıcı şifresi
 * @param name Kullanıcı adı
 * @param role 'admin' veya 'therapist'
 */
const createMissingUser = async (
    email: string,
    password: string,
    name: string,
    role: 'admin' | 'therapist'
) => {
    try {
        // 1. Bu e-posta ile kayıtlı bir kullanıcı var mı diye kontrol et
        const methods = await fetchSignInMethodsForEmail(auth, email);

        // 2. Eğer kullanıcı yoksa oluştur
        if (methods.length === 0) {
            console.log(`Kullanıcı bulunamadı: ${email}. Yeni kullanıcı oluşturuluyor...`);
            
            // Firebase Authentication'da kullanıcıyı oluştur
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Realtime Database'de profilini ve rolünü oluştur
            const therapistData: Omit<Therapist, 'id'> = { name, email, role };
            await set(ref(db, `therapists/${user.uid}`), therapistData);

            console.log(`Başarıyla oluşturuldu: ${role} - ${email}`);
        } else {
             // Kullanıcı var, veritabanında rolü var mı kontrol et
            const userRecord = auth.currentUser; // Bu senaryoda null olabilir, daha sağlam bir yöntem gerekir
                                                  // ancak başlangıç için bu yeterli. Gerçek senaryoda
                                                  // admin SDK kullanmak daha doğru olur.
            console.log(`Kullanıcı zaten mevcut: ${email}.`);
        }
    } catch (error: any) {
        // Firebase şifre politikası gibi hataları yakalamak için
        if (error.code === 'auth/weak-password') {
            console.error(`HATA: ${email} için belirtilen şifre çok zayıf.`);
        } else {
            console.error(`${email} için kullanıcı oluşturulurken hata:`, error.message);
        }
    }
};

/**
 * .env.local dosyasındaki varsayılan admin ve terapist kullanıcılarının
 * sistemde mevcut olup olmadığını kontrol eder ve yoksa oluşturur.
 */
export const initializeDefaultUsers = async () => {
    console.log("Varsayılan kullanıcılar kontrol ediliyor...");

    const adminEmail = process.env.NEXT_PUBLIC_DEFAULT_ADMIN_EMAIL;
    const adminPassword = process.env.NEXT_PUBLIC_DEFAULT_ADMIN_PASSWORD;
    const therapistEmail = process.env.NEXT_PUBLIC_DEFAULT_THERAPIST_EMAIL;
    const therapistPassword = process.env.NEXT_PUBLIC_DEFAULT_THERAPIST_PASSWORD;

    if (adminEmail && adminPassword) {
        await createMissingUser(adminEmail, adminPassword, "Varsayılan Admin", "admin");
    } else {
        console.warn("Varsayılan admin bilgileri .env.local dosyasında bulunamadı.");
    }

    if (therapistEmail && therapistPassword) {
        await createMissingUser(therapistEmail, therapistPassword, "Varsayılan Terapist", "therapist");
    } else {
        console.warn("Varsayılan terapist bilgileri .env.local dosyasında bulunamadı.");
    }
    console.log("Kullanıcı kontrolü tamamlandı.");
};
