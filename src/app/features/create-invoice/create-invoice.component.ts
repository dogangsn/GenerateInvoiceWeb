import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { InputComponent } from '../../shared/components/input/input.component';
import { CountryService } from '../../core/services/country.service';
import { Country, TaxRate } from '../../core/models/country.model';

@Component({
    selector: 'app-create-invoice',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, ButtonComponent, InputComponent],
    templateUrl: './create-invoice.component.html',
    styleUrl: './create-invoice.component.css'
})
export class CreateInvoiceComponent implements OnInit {
    private fb = inject(FormBuilder);
    private router = inject(Router);
    private countryService = inject(CountryService);

    invoiceForm: FormGroup;
    selectedCountry: Country | null = null;
    selectedTaxRate: TaxRate | null = null;
    availableTaxRates: TaxRate[] = [];

    constructor() {
        this.invoiceForm = this.fb.group({
            date: [new Date().toISOString().split('T')[0], Validators.required],
            time: [new Date().toTimeString().slice(0, 5)],
            customerName: ['', Validators.required],
            taxId: [''],
            address: [''],
            items: this.fb.array([])
        });

        // Add initial item
        this.addItem();
    }

    ngOnInit() {
        // Seçili ülkeyi al
        this.selectedCountry = this.countryService.getSelectedCountry();
        
        if (!this.selectedCountry) {
            // Ülke seçilmemişse ana sayfaya yönlendir
            this.router.navigate(['/']);
            return;
        }

        // Vergi oranlarını ayarla
        this.availableTaxRates = this.selectedCountry.taxes;
        this.selectedTaxRate = this.countryService.getDefaultTaxRate();
    }

    get items() {
        return this.invoiceForm.get('items') as FormArray;
    }

    addItem() {
        const itemForm = this.fb.group({
            description: ['', Validators.required],
            quantity: [1, [Validators.required, Validators.min(1)]],
            unitPrice: [0, [Validators.required, Validators.min(0)]]
        });
        this.items.push(itemForm);
    }

    removeItem(index: number) {
        this.items.removeAt(index);
    }

    onTaxRateChange(event: Event) {
        const select = event.target as HTMLSelectElement;
        const rate = parseFloat(select.value);
        this.selectedTaxRate = this.availableTaxRates.find(t => t.rate === rate) || null;
    }

    calculateSubtotal(): number {
        return this.items.controls.reduce((acc, item) => {
            const quantity = item.get('quantity')?.value || 0;
            const unitPrice = item.get('unitPrice')?.value || 0;
            return acc + (quantity * unitPrice);
        }, 0);
    }

    calculateTax(): number {
        const taxRate = this.selectedTaxRate?.rate || 0;
        return this.calculateSubtotal() * (taxRate / 100);
    }

    calculateTotal(): number {
        return this.calculateSubtotal() + this.calculateTax();
    }

    formatCurrency(amount: number): string {
        return this.countryService.formatCurrency(amount);
    }

    goBack() {
        this.router.navigate(['/']);
    }

    saveInvoice() {
        if (this.invoiceForm.valid) {
            const invoiceData = {
                ...this.invoiceForm.value,
                country: this.selectedCountry?.code,
                currency: this.selectedCountry?.currency.code,
                taxRate: this.selectedTaxRate,
                subtotal: this.calculateSubtotal(),
                tax: this.calculateTax(),
                total: this.calculateTotal()
            };
            console.log('Invoice Data:', invoiceData);
            // Save logic here
            alert('Fatura başarıyla oluşturuldu!');
            this.router.navigate(['/invoices']);
        } else {
            alert('Lütfen tüm zorunlu alanları doldurun.');
        }
    }
}
