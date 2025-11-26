import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Country {
    name: string;
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
export class CountrySelectComponent {
    countries: Country[] = [
        { name: 'Türkiye', flag: '🇹🇷', code: 'TR' },
        { name: 'Almanya', flag: '🇩🇪', code: 'DE' },
        { name: 'Fransa', flag: '🇫🇷', code: 'FR' },
        { name: 'Birleşik Krallık', flag: '🇬🇧', code: 'UK' },
        { name: 'İspanya', flag: '🇪🇸', code: 'ES' },
        { name: 'İtalya', flag: '🇮🇹', code: 'IT' },
        { name: 'Hollanda', flag: '🇳🇱', code: 'NL' },
        { name: 'Kanada', flag: '🇨🇦', code: 'CA' },
        { name: 'Amerika Birleşik Devletleri', flag: '🇺🇸', code: 'US' },
        { name: 'Avustralya', flag: '🇦🇺', code: 'AU' },
    ];

    constructor(private router: Router) { }

    selectCountry(country: Country) {
        console.log('Selected country:', country);
        this.router.navigate(['/create-invoice']);
    }

    goToLogin() {
        this.router.navigate(['/login']);
    }
}
