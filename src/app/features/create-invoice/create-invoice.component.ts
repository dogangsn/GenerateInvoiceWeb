import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { InputComponent } from '../../shared/components/input/input.component';
import { InvoiceService } from '../../core/services/invoice.service';
import { InvoiceFormData } from '../../core/models/invoice.model';
import { LanguageService } from '../../core/services/language.service';

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
    private route = inject(ActivatedRoute);
    private invoiceService = inject(InvoiceService);
    lang = inject(LanguageService);

    invoiceForm: FormGroup;
    taxRate: number = 20;
    countryName: string = 'Türkiye';
    countryCode: string = 'TR';
    taxLabel: string = 'KDV';
    isSaving: boolean = false;

    constructor() {
        this.invoiceForm = this.fb.group({
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
            if (params['taxRate']) {
                this.taxRate = Number(params['taxRate']);
            }
            if (params['countryCode']) {
                this.countryCode = params['countryCode'];
                this.setCountryDetails(params['countryCode']);
            }
        });
    }

    setCountryDetails(code: string) {
        const countryMap: { [key: string]: { name: string, taxLabel: string, taxRate: number } } = {
            'TR': { name: 'Türkiye', taxLabel: 'KDV', taxRate: 20 },
            'DE': { name: 'Almanya', taxLabel: 'MwSt', taxRate: 19 },
            'FR': { name: 'Fransa', taxLabel: 'TVA', taxRate: 20 },
            'UK': { name: 'Birleşik Krallık', taxLabel: 'VAT', taxRate: 20 },
            'ES': { name: 'İspanya', taxLabel: 'IVA', taxRate: 21 },
            'IT': { name: 'İtalya', taxLabel: 'IVA', taxRate: 22 },
            'NL': { name: 'Hollanda', taxLabel: 'BTW', taxRate: 21 },
            'CA': { name: 'Kanada', taxLabel: 'GST/HST', taxRate: 5 },
            'US': { name: 'ABD', taxLabel: 'Sales Tax', taxRate: 0 },
            'AU': { name: 'Avustralya', taxLabel: 'GST', taxRate: 10 }
        };

        const details = countryMap[code];
        if (details) {
            this.countryName = details.name;
            this.taxLabel = details.taxLabel;
            this.taxRate = details.taxRate;
        } else {
            this.countryName = code;
            this.taxLabel = 'Tax';
        }
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
        return this.calculateNetSubtotal() * (this.taxRate / 100);
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

        this.isSaving = true;
        try {
            const val = this.invoiceForm.value;
            const invoiceData: InvoiceFormData = {
                invoiceNo: this.invoiceService.generateInvoiceNumber(),
                date: val.date,
                dueDate: val.dueDate || val.date,
                customerName: val.customerName,
                customerEmail: val.customerEmail || '',
                customerTaxId: val.customerTaxId || val.taxId || '',
                customerAddress: val.customerAddress || val.address || '',
                items: val.items,
                additionalTaxes: val.additionalTaxes || [],
                countryCode: this.countryCode,
                taxLabel: this.taxLabel,
                taxRate: this.taxRate,
                notes: '',
                status: 'sent'
            };

            await this.invoiceService.createInvoice(invoiceData);
            alert('Fatura başarıyla kaydedildi!');
            this.router.navigate(['/invoices']);
        } catch (error) {
            console.error('Fatura kaydedilirken hata:', error);
            alert('Fatura oluşturulurken bir hata oluştu.');
        } finally {
            this.isSaving = false;
        }
    }
}
