import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { InputComponent } from '../../shared/components/input/input.component';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ButtonComponent, InputComponent, FormsModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})
export class LoginComponent {
    email = '';
    password = '';

    constructor(private router: Router, private authService: AuthService) { }

    async login() {
        if (!this.email || !this.password) {
            alert('Lütfen e-posta ve şifre giriniz.');
            return;
        }

        try {
            await this.authService.loginWithEmail(this.email, this.password);
        } catch (error: any) {
            console.error('Login error:', error);
            alert('Giriş başarısız: ' + error.message);
        }
    }

    async loginWithGoogle() {
        try {
            await this.authService.loginWithGoogle();
        } catch (error) {
            console.error('Login failed', error);
        }
    }
}
