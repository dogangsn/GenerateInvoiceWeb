import { Injectable, inject } from '@angular/core';
import { Auth, GoogleAuthProvider, signInWithPopup, signOut, user, User, signInWithEmailAndPassword, createUserWithEmailAndPassword } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private auth: Auth = inject(Auth);
    private router: Router = inject(Router);

    user$: Observable<User | null> = user(this.auth);

    constructor() { }

    async loginWithGoogle() {
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(this.auth, provider);
            console.log('User signed in:', result.user);
            this.router.navigate(['/dashboard']);
            return result.user;
        } catch (error) {
            console.error('Error signing in with Google:', error);
            throw error;
        }
    }

    async loginWithEmail(email: string, password: string) {
        try {
            const result = await signInWithEmailAndPassword(this.auth, email, password);
            console.log('User logged in:', result.user);
            this.router.navigate(['/dashboard']);
            return result.user;
        } catch (error) {
            console.error('Error logging in:', error);
            throw error;
        }
    }

    async registerWithEmail(email: string, password: string) {
        try {
            const result = await createUserWithEmailAndPassword(this.auth, email, password);
            console.log('User registered:', result.user);
            this.router.navigate(['/dashboard']);
            return result.user;
        } catch (error) {
            console.error('Error registering:', error);
            throw error;
        }
    }

    async logout() {
        try {
            await signOut(this.auth);
            this.router.navigate(['/login']);
        } catch (error) {
            console.error('Error signing out:', error);
            throw error;
        }
    }
}
