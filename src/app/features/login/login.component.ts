import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { LanguageService } from '../../core/services/language.service';
import { LegalModalComponent, LegalDocType } from '../../shared/components/legal-modal/legal-modal.component';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule, LegalModalComponent],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private authService = inject(AuthService);
    lang = inject(LanguageService);

    isRegisterMode = false;
    displayName = '';
    email = '';
    password = '';
    confirmPassword = '';
    acceptTerms = false;
    returnUrl = '/dashboard';
    isLoading = false;
    errorMessage = '';
    successMessage = '';

    // Legal modal
    showLegalModal = false;
    legalModalTab: LegalDocType = 'terms';

    ngOnInit() {
        this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
        if (this.route.snapshot.queryParams['mode'] === 'register') {
            this.isRegisterMode = true;
        }
    }

    toggleMode(isRegister: boolean) {
        this.isRegisterMode = isRegister;
        this.errorMessage = '';
        this.successMessage = '';
    }

    openLegal(tab: LegalDocType) {
        this.legalModalTab = tab;
        this.showLegalModal = true;
    }

    async onSubmit() {
        if (this.isRegisterMode) {
            await this.register();
        } else {
            await this.login();
        }
    }

    async login() {
        if (!this.email || !this.password) {
            this.errorMessage = 'Lütfen e-posta ve şifre giriniz.';
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';
        this.successMessage = '';
        try {
            await this.authService.loginWithEmail(this.email.trim(), this.password);
            this.router.navigate([this.returnUrl]);
        } catch (error: any) {
            console.error('Login error:', error);
            this.errorMessage = this.getErrorMessage(error.code);
        } finally {
            this.isLoading = false;
        }
    }

    async register() {
        if (!this.displayName.trim() || !this.email.trim() || !this.password) {
            this.errorMessage = 'Lütfen ad, e-posta ve şifre alanlarını doldurunuz.';
            return;
        }

        if (this.password.length < 6) {
            this.errorMessage = 'Şifre en az 6 karakter uzunluğunda olmalıdır.';
            return;
        }

        if (this.password !== this.confirmPassword) {
            this.errorMessage = 'Girdiğiniz şifreler birbiriyle eşleşmiyor.';
            return;
        }

        if (!this.acceptTerms) {
            this.errorMessage = 'Kayıt olmak için lütfen Kullanım Şartları ve Gizlilik Politikasını onaylayınız.';
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';
        this.successMessage = '';
        try {
            await this.authService.registerWithEmail(this.email.trim(), this.password, this.displayName.trim());
            this.router.navigate([this.returnUrl]);
        } catch (error: any) {
            console.error('Register error:', error);
            this.errorMessage = this.getErrorMessage(error.code);
        } finally {
            this.isLoading = false;
        }
    }

    async loginWithGoogle() {
        this.isLoading = true;
        this.errorMessage = '';
        this.successMessage = '';
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

    async forgotPassword() {
        if (!this.email) {
            this.errorMessage = 'Şifre sıfırlama bağlantısı göndermek için e-posta adresinizi giriniz.';
            return;
        }

        this.isLoading = true;
        this.errorMessage = '';
        this.successMessage = '';
        try {
            await this.authService.resetPassword(this.email.trim());
            this.successMessage = 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.';
        } catch (error: any) {
            console.error('Reset password error:', error);
            this.errorMessage = this.getErrorMessage(error.code);
        } finally {
            this.isLoading = false;
        }
    }

    private getErrorMessage(errorCode: string): string {
        const errorMessages: { [key: string]: string } = {
            'auth/email-already-in-use': 'Bu e-posta adresi ile kayıtlı bir hesap zaten mevcut.',
            'auth/weak-password': 'Şifre çok zayıf. Lütfen en az 6 karakterli bir şifre seçiniz.',
            'auth/user-not-found': 'Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı.',
            'auth/wrong-password': 'Şifre hatalı. Lütfen tekrar deneyin.',
            'auth/invalid-email': 'Geçersiz e-posta adresi biçimi.',
            'auth/user-disabled': 'Bu hesap devre dışı bırakılmış.',
            'auth/too-many-requests': 'Çok fazla başarısız deneme. Lütfen daha sonra tekrar deneyin.',
            'auth/popup-closed-by-user': 'Giriş penceresi kapatıldı. Lütfen tekrar deneyin.',
            'auth/cancelled-popup-request': 'Giriş işlemi iptal edildi.',
            'auth/popup-blocked': 'Popup penceresi engellendi. Lütfen popup engelleyiciyi devre dışı bırakın.',
            'auth/invalid-credential': 'Geçersiz kimlik bilgileri. Lütfen tekrar deneyin.',
            'auth/operation-not-allowed': 'E-posta ile giriş sağlayıcısı henüz Firebase panelinde aktif edilmemiş. Lütfen Google ile giriş yapınız veya sistem yöneticisine danışınız.',
        };
        return errorMessages[errorCode] || 'İşlem sırasında bir hata oluştu. Lütfen tekrar deneyin.';
    }
}

