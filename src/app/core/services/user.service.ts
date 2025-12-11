import { Injectable, inject } from '@angular/core';
import { Firestore, doc, setDoc, getDoc, updateDoc, serverTimestamp } from '@angular/fire/firestore';
import { User } from '@angular/fire/auth';
import { UserProfile } from '../models/user.model';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private firestore = inject(Firestore);

    /**
     * Kullanıcı profilini Firestore'dan getirir
     */
    async getUserProfile(uid: string): Promise<UserProfile | null> {
        const userRef = doc(this.firestore, 'users', uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            return userSnap.data() as UserProfile;
        }
        return null;
    }

    /**
     * Yeni kullanıcı profili oluşturur veya mevcut profili günceller
     */
    async createOrUpdateUserProfile(user: User): Promise<UserProfile> {
        const userRef = doc(this.firestore, 'users', user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            // Mevcut kullanıcı - sadece son giriş bilgilerini güncelle
            await updateDoc(userRef, {
                displayName: user.displayName || '',
                photoURL: user.photoURL || null,
                updatedAt: serverTimestamp()
            });
            return userSnap.data() as UserProfile;
        } else {
            // Yeni kullanıcı - profil oluştur
            const newProfile: any = {
                uid: user.uid,
                email: user.email || '',
                displayName: user.displayName || '',
                photoURL: user.photoURL || null,
                phoneNumber: user.phoneNumber || null,
                companyName: null,
                companyAddress: null,
                taxId: null,
                taxOffice: null,
                country: null,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            await setDoc(userRef, newProfile);
            return newProfile as UserProfile;
        }
    }

    /**
     * Kullanıcı profilini günceller
     */
    async updateUserProfile(uid: string, data: Partial<UserProfile>): Promise<void> {
        const userRef = doc(this.firestore, 'users', uid);
        await updateDoc(userRef, {
            ...data,
            updatedAt: serverTimestamp()
        });
    }
}

