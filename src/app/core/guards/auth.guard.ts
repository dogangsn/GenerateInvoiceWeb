import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';

export const authGuard: CanActivateFn = async (route, state) => {
    const auth = inject(Auth);
    const router = inject(Router);

    // Firebase auth state'inin yüklenmesini bekle
    await auth.authStateReady();
    
    const currentUser = auth.currentUser;
    
    if (currentUser) {
        return true;
    } else {
        router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
        return false;
    }
};



