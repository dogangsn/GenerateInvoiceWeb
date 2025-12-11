import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { Country, COUNTRIES, TaxRate } from '../models/country.model';

@Injectable({
    providedIn: 'root'
})
export class CountryService {
    private platformId = inject(PLATFORM_ID);
    private selectedCountrySubject = new BehaviorSubject<Country | null>(null);
    
    selectedCountry$: Observable<Country | null> = this.selectedCountrySubject.asObservable();

    constructor() {
        // LocalStorage'dan seçili ülkeyi yükle
        if (isPlatformBrowser(this.platformId)) {
            const savedCountryCode = localStorage.getItem('selectedCountry');
            if (savedCountryCode) {
                const country = this.getCountryByCode(savedCountryCode);
                if (country) {
                    this.selectedCountrySubject.next(country);
                }
            }
        }
    }

    /**
     * Tüm desteklenen ülkeleri döndürür
     */
    getAllCountries(): Country[] {
        return COUNTRIES;
    }

    /**
     * Ülke koduna göre ülke bilgisini döndürür
     */
    getCountryByCode(code: string): Country | undefined {
        return COUNTRIES.find(c => c.code === code);
    }

    /**
     * Seçili ülkeyi döndürür
     */
    getSelectedCountry(): Country | null {
        return this.selectedCountrySubject.value;
    }

    /**
     * Ülke seçimini yapar ve kaydeder
     */
    selectCountry(country: Country): void {
        this.selectedCountrySubject.next(country);
        if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('selectedCountry', country.code);
        }
    }

    /**
     * Ülke seçimini temizler
     */
    clearSelection(): void {
        this.selectedCountrySubject.next(null);
        if (isPlatformBrowser(this.platformId)) {
            localStorage.removeItem('selectedCountry');
        }
    }

    /**
     * Seçili ülkenin varsayılan vergi oranını döndürür
     */
    getDefaultTaxRate(): TaxRate | null {
        const country = this.getSelectedCountry();
        if (!country) return null;
        return country.taxes.find(t => t.isDefault) || country.taxes[0] || null;
    }

    /**
     * Seçili ülkenin tüm vergi oranlarını döndürür
     */
    getTaxRates(): TaxRate[] {
        const country = this.getSelectedCountry();
        return country?.taxes || [];
    }

    /**
     * Para birimini formatlar
     */
    formatCurrency(amount: number): string {
        const country = this.getSelectedCountry();
        if (!country) return amount.toFixed(2);

        const formatted = amount.toFixed(2)
            .replace('.', country.decimalSeparator)
            .replace(/\B(?=(\d{3})+(?!\d))/g, country.thousandSeparator);

        return `${country.currency.symbol}${formatted}`;
    }

    /**
     * Vergi hesaplar
     */
    calculateTax(amount: number, taxRate: number): number {
        return amount * (taxRate / 100);
    }

    /**
     * Vergi dahil toplam hesaplar
     */
    calculateTotal(subtotal: number, taxRate: number): number {
        return subtotal + this.calculateTax(subtotal, taxRate);
    }
}

