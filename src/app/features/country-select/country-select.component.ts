import { Component, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { AuthService } from '../../core/services/auth.service';
import { LanguageService } from '../../core/services/language.service';
import { User } from '@angular/fire/auth';

interface Country {
    nameKey: string;
    flag: string;
    code: string;
}

@Component({
    selector: 'app-country-select',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './country-select.component.html',
    styleUrl: './country-select.component.css'
})
export class CountrySelectComponent implements OnInit {
    private router = inject(Router);
    private auth = inject(Auth);
    private authService = inject(AuthService);
    private platformId = inject(PLATFORM_ID);
    lang = inject(LanguageService);

    user = signal<User | null>(null);
    isLoggedIn = signal(false);
    isLoading = signal(true);

    countries: Country[] = [
        { nameKey: 'countries.turkey', flag: '🇹🇷', code: 'TR' },
        { nameKey: 'countries.germany', flag: '🇩🇪', code: 'DE' },
        { nameKey: 'countries.france', flag: '🇫🇷', code: 'FR' },
        { nameKey: 'countries.uk', flag: '🇬🇧', code: 'UK' },
        { nameKey: 'countries.spain', flag: '🇪🇸', code: 'ES' },
        { nameKey: 'countries.italy', flag: '🇮🇹', code: 'IT' },
        { nameKey: 'countries.netherlands', flag: '🇳🇱', code: 'NL' },
        { nameKey: 'countries.canada', flag: '🇨🇦', code: 'CA' },
        { nameKey: 'countries.usa', flag: '🇺🇸', code: 'US' },
        { nameKey: 'countries.australia', flag: '🇦🇺', code: 'AU' },
    ];

    async ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            // Auth state'inin yüklenmesini bekle
            await this.auth.authStateReady();
            
            this.user.set(this.auth.currentUser);
            this.isLoggedIn.set(!!this.auth.currentUser);
            this.isLoading.set(false);

            // Auth değişikliklerini dinle
            this.authService.user$.subscribe(firebaseUser => {
                this.user.set(firebaseUser);
                this.isLoggedIn.set(!!firebaseUser);
            });
        } else {
            this.isLoading.set(false);
        }
    }

    selectCountry(country: Country) {
        console.log('Selected country:', country);
        this.router.navigate(['/create-invoice']);
    }

    goToLogin() {
        this.router.navigate(['/login']);
    }

    goToDashboard() {
        this.router.navigate(['/dashboard']);
    }

    logout() {
        this.authService.logout();
    }
}
