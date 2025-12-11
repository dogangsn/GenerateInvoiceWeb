import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CountryService } from '../../core/services/country.service';
import { Country } from '../../core/models/country.model';

@Component({
    selector: 'app-country-select',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './country-select.component.html',
    styleUrl: './country-select.component.css'
})
export class CountrySelectComponent {
    private router = inject(Router);
    private countryService = inject(CountryService);

    countries: Country[] = this.countryService.getAllCountries();

    selectCountry(country: Country) {
        this.countryService.selectCountry(country);
        console.log('Seçilen ülke:', country.name, '- Vergi:', country.taxes.find(t => t.isDefault)?.name, country.taxes.find(t => t.isDefault)?.rate + '%');
        this.router.navigate(['/create-invoice']);
    }

    goToLogin() {
        this.router.navigate(['/login']);
    }

    getDefaultTax(country: Country) {
        return country.taxes.find(t => t.isDefault) || country.taxes[0];
    }
}
