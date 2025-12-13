import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { InputComponent } from '../../shared/components/input/input.component';
import { CountryService } from '../../core/services/country.service';
import { InvoiceService } from '../../core/services/invoice.service';
import { AuthService } from '../../core/services/auth.service';
import { Country, TaxRate } from '../../core/models/country.model';
import { Invoice } from '../../core/models/invoice.model';

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
    private invoiceService = inject(InvoiceService);
    private authService = inject(AuthService);
    private platformId = inject(PLATFORM_ID);

    invoiceForm: FormGroup;
    selectedCountry: Country | null = null;
    selectedTaxRate: TaxRate | null = null;
    availableTaxRates: TaxRate[] = [];
    isSaving = false;

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

    private getInvoiceData(): Partial<Invoice> {
        const formValue = this.invoiceForm.value;
        return {
            date: formValue.date,
            time: formValue.time,
            customerName: formValue.customerName,
            customerTaxId: formValue.taxId,
            customerAddress: formValue.address,
            items: formValue.items,
            countryCode: this.selectedCountry?.code || '',
            countryName: this.selectedCountry?.name || '',
            currencyCode: this.selectedCountry?.currency.code || '',
            currencySymbol: this.selectedCountry?.currency.symbol || '',
            taxName: this.selectedTaxRate?.name || '',
            taxRate: this.selectedTaxRate?.rate || 0,
            subtotal: this.calculateSubtotal(),
            taxAmount: this.calculateTax(),
            total: this.calculateTotal()
        };
    }

    async saveDraft() {
        if (!this.authService.currentUser) {
            alert('Taslak kaydetmek için giriş yapmalısınız.');
            this.router.navigate(['/login']);
            return;
        }

        if (!this.invoiceForm.get('customerName')?.value) {
            alert('Lütfen en az müşteri adını girin.');
            return;
        }

        this.isSaving = true;
        try {
            const invoiceData = this.getInvoiceData();
            invoiceData.status = 'Draft';
            
            const invoiceId = await this.invoiceService.createInvoice(invoiceData);
            console.log('Taslak kaydedildi, ID:', invoiceId);
            alert('Fatura taslağı başarıyla kaydedildi!');
            this.router.navigate(['/invoices']);
        } catch (error: any) {
            console.error('Taslak kaydetme hatası:', error);
            alert('Taslak kaydedilemedi: ' + error.message);
        } finally {
            this.isSaving = false;
        }
    }

    async printInvoice() {
        if (!this.invoiceForm.valid) {
            alert('Lütfen tüm zorunlu alanları doldurun.');
            return;
        }

        // Önce kaydet (kullanıcı giriş yaptıysa)
        if (this.authService.currentUser) {
            this.isSaving = true;
            try {
                const invoiceData = this.getInvoiceData();
                invoiceData.status = 'Printed';
                await this.invoiceService.createInvoice(invoiceData);
            } catch (error) {
                console.error('Fatura kaydetme hatası:', error);
            } finally {
                this.isSaving = false;
            }
        }

        // Yazdır
        if (isPlatformBrowser(this.platformId)) {
            window.print();
        }
    }
}
