import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Auth, GoogleAuthProvider, signInWithPopup, signOut, user, User, signInWithEmailAndPassword, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UserService } from './user.service';
import { UserProfile } from '../models/user.model';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private auth: Auth = inject(Auth);
    private router: Router = inject(Router);
    private userService = inject(UserService);
    private platformId = inject(PLATFORM_ID);

    user$: Observable<User | null> = user(this.auth);
    userProfile: UserProfile | null = null;

    get currentUser(): User | null {
        return this.auth.currentUser;
    }

    async loginWithGoogle(): Promise<User | null> {
        if (!isPlatformBrowser(this.platformId)) return null;
        
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(this.auth, provider);
        
        if (result.user) {
            // Kullanıcıyı Firestore'a kaydet
            try {
                this.userProfile = await this.userService.createOrUpdateUserProfile(result.user);
                console.log('Kullanıcı profili kaydedildi:', this.userProfile);
            } catch (error) {
                console.error('Profil kaydetme hatası (devam ediliyor):', error);
            }
        }
        
        return result.user;
    }

    async loginWithEmail(email: string, password: string) {
        const result = await signInWithEmailAndPassword(this.auth, email, password);
        // Kullanıcıyı Firestore'a kaydet
        this.userProfile = await this.userService.createOrUpdateUserProfile(result.user);
        return result.user;
    }

    async registerWithEmail(email: string, password: string) {
        const result = await createUserWithEmailAndPassword(this.auth, email, password);
        // Yeni kullanıcıyı Firestore'a kaydet
        this.userProfile = await this.userService.createOrUpdateUserProfile(result.user);
        return result.user;
    }

    async logout() {
        await signOut(this.auth);
        this.userProfile = null;
        this.router.navigate(['/login']);
    }

    async loadUserProfile(): Promise<UserProfile | null> {
        if (this.currentUser) {
            this.userProfile = await this.userService.getUserProfile(this.currentUser.uid);
        }
        return this.userProfile;
    }
}
