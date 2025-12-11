import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { InputComponent } from '../../shared/components/input/input.component';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { take } from 'rxjs/operators';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ButtonComponent, InputComponent, FormsModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private authService = inject(AuthService);
    private platformId = inject(PLATFORM_ID);

    email = '';
    password = '';
    returnUrl = '/dashboard';
    isLoading = false;
    errorMessage = '';

    ngOnInit() {
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
        
        // Sadece browser'da ve sadece bir kez kontrol et
        if (isPlatformBrowser(this.platformId)) {
            // Kullanıcı zaten giriş yapmışsa dashboard'a yönlendir
            this.authService.user$.pipe(take(1)).subscribe(user => {
                if (user) {
                    console.log('Kullanıcı zaten giriş yapmış:', user.displayName);
                    this.router.navigate([this.returnUrl]);
                }
            });
        }
    }

    async login() {
        if (!this.email || !this.password) {
            this.errorMessage = 'Lütfen e-posta ve şifre giriniz.';
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';
        try {
            await this.authService.loginWithEmail(this.email, this.password);
            this.router.navigate([this.returnUrl]);
        } catch (error: any) {
            console.error('Login error:', error);
            this.errorMessage = this.getErrorMessage(error.code);
        } finally {
            this.isLoading = false;
        }
    }

    async loginWithGoogle() {
        this.isLoading = true;
        this.errorMessage = '';
        try {
            const user = await this.authService.loginWithGoogle();
            if (user) {
                console.log('Google ile giriş başarılı:', user.displayName);
                this.router.navigate([this.returnUrl]);
            }
        } catch (error: any) {
            console.error('Login failed', error);
            this.errorMessage = this.getErrorMessage(error.code);
        } finally {
            this.isLoading = false;
        }
    }

    goBack() {
        this.router.navigate(['/']);
    }

    private getErrorMessage(errorCode: string): string {
        const errorMessages: { [key: string]: string } = {
            'auth/user-not-found': 'Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı.',
            'auth/wrong-password': 'Şifre hatalı. Lütfen tekrar deneyin.',
            'auth/invalid-email': 'Geçersiz e-posta adresi.',
            'auth/user-disabled': 'Bu hesap devre dışı bırakılmış.',
            'auth/too-many-requests': 'Çok fazla başarısız deneme. Lütfen daha sonra tekrar deneyin.',
            'auth/popup-closed-by-user': 'Giriş penceresi kapatıldı. Lütfen tekrar deneyin.',
            'auth/cancelled-popup-request': 'Giriş işlemi iptal edildi.',
            'auth/popup-blocked': 'Popup penceresi engellendi. Lütfen popup engelleyiciyi devre dışı bırakın.',
            'auth/invalid-credential': 'Geçersiz kimlik bilgileri. Lütfen tekrar deneyin.',
        };
        return errorMessages[errorCode] || 'Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.';
    }
}
