import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { InputComponent } from '../../shared/components/input/input.component';
import { InvoiceService } from '../../core/services/invoice.service';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { InvoiceFormData } from '../../core/models/invoice.model';
import { LanguageService } from '../../core/services/language.service';
import { firstValueFrom } from 'rxjs';

@Component({
    selector: 'app-create-invoice',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule, ButtonComponent, InputComponent],
    templateUrl: './create-invoice.component.html',
    styleUrl: './create-invoice.component.css'
})
export class CreateInvoiceComponent implements OnInit {
    private fb = inject(FormBuilder);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private invoiceService = inject(InvoiceService);
    private authService = inject(AuthService);
    private userService = inject(UserService);
    lang = inject(LanguageService);

    invoiceForm: FormGroup;
    taxRate: number = 20;
    countryName: string = 'Türkiye';
    countryCode: string = 'TR';
    taxLabel: string = 'KDV';
    availableTaxRates: number[] = [20, 10, 1, 0];
    isSaving: boolean = false;
    activeMobileTab: 'form' | 'preview' = 'form';


    constructor() {
        this.invoiceForm = this.fb.group({
            invoiceType: ['commercial', Validators.required],
            countryCode: ['TR'],
            date: [new Date().toISOString().split('T')[0], Validators.required],
            dueDate: [new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]],
            time: ['14:30'],
            customerName: ['', Validators.required],
            customerEmail: [''],
            customerTaxId: [''],
            customerAddress: [''],
            items: this.fb.array([]),
            additionalTaxes: this.fb.array([])
        });

        // Add initial item
        this.addItem();
    }

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            if (params['type'] === 'proforma') {
                this.invoiceForm.patchValue({ invoiceType: 'proforma' });
            }
            if (params['taxRate']) {
                this.taxRate = Number(params['taxRate']);
            }
            if (params['countryCode']) {
                this.countryCode = params['countryCode'];
                this.invoiceForm.patchValue({ countryCode: params['countryCode'] });
                this.setCountryDetails(params['countryCode']);
            } else {
                this.setCountryDetails('TR');
            }
        });
    }

    onCountryChange(code: string) {
        this.countryCode = code;
        this.setCountryDetails(code);
    }

    setCountryDetails(code: string) {
        const countryMap: { [key: string]: { name: string, taxLabel: string, taxRate: number, rates: number[] } } = {
            'TR': { name: 'Türkiye', taxLabel: 'KDV', taxRate: 20, rates: [20, 10, 1, 0] },
            'DE': { name: 'Almanya', taxLabel: 'MwSt', taxRate: 19, rates: [19, 7, 0] },
            'FR': { name: 'Fransa', taxLabel: 'TVA', taxRate: 20, rates: [20, 10, 5.5, 2.1, 0] },
            'UK': { name: 'Birleşik Krallık', taxLabel: 'VAT', taxRate: 20, rates: [20, 5, 0] },
            'ES': { name: 'İspanya', taxLabel: 'IVA', taxRate: 21, rates: [21, 10, 4, 0] },
            'IT': { name: 'İtalya', taxLabel: 'IVA', taxRate: 22, rates: [22, 10, 5, 4, 0] },
            'NL': { name: 'Hollanda', taxLabel: 'BTW', taxRate: 21, rates: [21, 9, 0] },
            'CA': { name: 'Kanada', taxLabel: 'GST/HST', taxRate: 5, rates: [5, 0] },
            'US': { name: 'ABD', taxLabel: 'Sales Tax', taxRate: 0, rates: [0, 5, 6, 7, 8.875] },
            'AU': { name: 'Avustralya', taxLabel: 'GST', taxRate: 10, rates: [10, 0] }
        };

        const details = countryMap[code] || { name: code, taxLabel: 'Tax', taxRate: 20, rates: [20, 10, 1, 0] };
        this.countryName = details.name;
        this.taxLabel = details.taxLabel;
        this.taxRate = details.taxRate;
        this.availableTaxRates = details.rates;
    }

    get items() {
        return this.invoiceForm.get('items') as FormArray;
    }

    get additionalTaxes() {
        return this.invoiceForm.get('additionalTaxes') as FormArray;
    }

    addAdditionalTax() {
        const taxForm = this.fb.group({
            name: ['Ek Vergi', Validators.required],
            rate: [0, [Validators.required, Validators.min(0), Validators.max(100)]]
        });
        this.additionalTaxes.push(taxForm);
    }

    removeAdditionalTax(index: number) {
        this.additionalTaxes.removeAt(index);
    }

    addItem() {
        const itemForm = this.fb.group({
            description: ['', Validators.required],
            quantity: [1, [Validators.required, Validators.min(1)]],
            unitPrice: [0, [Validators.required, Validators.min(0)]],
            taxRate: [this.taxRate, [Validators.required, Validators.min(0)]],
            discount: [0, [Validators.min(0), Validators.max(100)]]
        });
        this.items.push(itemForm);
    }

    removeItem(index: number) {
        this.items.removeAt(index);
    }

    calculateSubtotal(): number {
        return this.items.controls.reduce((acc, item) => {
            const quantity = item.get('quantity')?.value || 0;
            const unitPrice = item.get('unitPrice')?.value || 0;
            return acc + (quantity * unitPrice);
        }, 0);
    }

    calculateDiscount(): number {
        return this.items.controls.reduce((acc, item) => {
            const quantity = item.get('quantity')?.value || 0;
            const unitPrice = item.get('unitPrice')?.value || 0;
            const discount = item.get('discount')?.value || 0;
            return acc + (quantity * unitPrice * (discount / 100));
        }, 0);
    }

    calculateNetSubtotal(): number {
        return this.calculateSubtotal() - this.calculateDiscount();
    }

    calculateTax(): number {
        return this.items.controls.reduce((acc, item) => {
            const quantity = item.get('quantity')?.value || 0;
            const unitPrice = item.get('unitPrice')?.value || 0;
            const discount = item.get('discount')?.value || 0;
            const rate = item.get('taxRate')?.value !== undefined ? Number(item.get('taxRate')?.value) : this.taxRate;
            const net = (quantity * unitPrice) * (1 - (discount / 100));
            return acc + (net * (rate / 100));
        }, 0);
    }

    calculateAdditionalTaxTotal(): number {
        return this.additionalTaxes.controls.reduce((acc, tax) => {
            const rate = tax.get('rate')?.value || 0;
            return acc + (this.calculateNetSubtotal() * (rate / 100));
        }, 0);
    }

    calculateTotal(): number {
        return this.calculateNetSubtotal() + this.calculateTax() + this.calculateAdditionalTaxTotal();
    }

    goBack() {
        this.router.navigate(['/']);
    }

    async saveInvoice() {
        if (this.invoiceForm.invalid) {
            alert('Lütfen tüm zorunlu alanları doldurun.');
            return;
        }

        // Ücretsiz Plan Fatura Limit Kontrolü (Maks 5 Fatura)
        const currentUser = this.authService.currentUser;
        if (currentUser) {
            const profile = await this.userService.getUserProfile(currentUser.uid);
            if (profile && (profile.plan === 'free' || !profile.plan)) {
                const existingInvoices = await firstValueFrom(this.invoiceService.getInvoices());
                if (existingInvoices.length >= (profile.monthlyInvoiceLimit || 5)) {
                    alert('⚠️ Ücretsiz Plan limitine ulaştınız! (Maksimum 5 Fatura).\n\nSınırsız fatura oluşturmak için lütfen Pro Plana yükseltin.');
                    this.router.navigate(['/pricing']);
                    return;
                }
            }
        }

        this.isSaving = true;
        try {
            const val = this.invoiceForm.value;
            const invoiceData: InvoiceFormData = {
                invoiceNo: this.invoiceService.generateInvoiceNumber(),
                invoiceType: val.invoiceType || 'commercial',
                date: val.date,
                dueDate: val.dueDate || val.date,
                customerName: val.customerName,
                customerEmail: val.customerEmail || '',
                customerTaxId: val.customerTaxId || val.taxId || '',
                customerAddress: val.customerAddress || val.address || '',
                items: val.items.map((it: any) => ({ ...it, taxRate: Number(it.taxRate !== undefined ? it.taxRate : this.taxRate) })),
                additionalTaxes: val.additionalTaxes || [],
                countryCode: this.countryCode,
                taxLabel: this.taxLabel,
                taxRate: this.taxRate,
                notes: '',
                status: val.invoiceType === 'proforma' ? 'draft' : 'sent'
            };

            await this.invoiceService.createInvoice(invoiceData);
            alert((val.invoiceType === 'proforma' ? 'Proforma Fatura' : 'Satış Faturası') + ' başarıyla kaydedildi!');
            this.router.navigate(['/invoices']);
        } catch (error) {
            console.error('Fatura kaydedilirken hata:', error);
            alert('Fatura oluşturulurken bir hata oluştu.');
        } finally {
            this.isSaving = false;
        }
    }
}
