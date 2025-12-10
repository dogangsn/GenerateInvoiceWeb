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

    get currentUser(): User | null {
        return this.auth.currentUser;
    }

    async loginWithGoogle() {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(this.auth, provider);
        return result.user;
    }

    async loginWithEmail(email: string, password: string) {
        const result = await signInWithEmailAndPassword(this.auth, email, password);
        return result.user;
    }

    async registerWithEmail(email: string, password: string) {
        const result = await createUserWithEmailAndPassword(this.auth, email, password);
        return result.user;
    }

    async logout() {
        await signOut(this.auth);
        this.router.navigate(['/login']);
    }
}
