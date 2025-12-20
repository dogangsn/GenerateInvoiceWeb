import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { InputComponent } from '../../shared/components/input/input.component';
import { CardComponent } from '../../shared/components/card/card.component';

@Component({
    selector: 'app-create-invoice',
    standalone: true,

    imports: [CommonModule, ReactiveFormsModule, ButtonComponent, InputComponent],
    templateUrl: './create-invoice.component.html',
    styleUrl: './create-invoice.component.css'
})
export class CreateInvoiceComponent implements OnInit {
    invoiceForm: FormGroup;
    taxRate: number = 20;
    countryName: string = 'Türkiye';
    taxLabel: string = 'KDV';

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private route: ActivatedRoute
    ) {
        this.invoiceForm = this.fb.group({
            date: [new Date().toISOString().split('T')[0], Validators.required],
            time: ['14:30'],
            customerName: ['', Validators.required],
            taxId: [''],
            address: [''],
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
                this.setCountryDetails(params['countryCode']);
            }
        });
    }

    setCountryDetails(code: string) {
        const countryMap: { [key: string]: { name: string, taxLabel: string } } = {
            'TR': { name: 'Türkiye', taxLabel: 'KDV' },
            'DE': { name: 'Almanya', taxLabel: 'MwSt' },
            'FR': { name: 'Fransa', taxLabel: 'TVA' },
            'UK': { name: 'Birleşik Krallık', taxLabel: 'VAT' },
            'ES': { name: 'İspanya', taxLabel: 'IVA' },
            'IT': { name: 'İtalya', taxLabel: 'IVA' },
            'NL': { name: 'Hollanda', taxLabel: 'BTW' },
            'CA': { name: 'Kanada', taxLabel: 'GST/HST' },
            'US': { name: 'ABD', taxLabel: 'Sales Tax' },
            'AU': { name: 'Avustralya', taxLabel: 'GST' }
        };

        const details = countryMap[code];
        if (details) {
            this.countryName = details.name;
            this.taxLabel = details.taxLabel;
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

    saveInvoice() {
        if (this.invoiceForm.valid) {
            console.log('Invoice Data:', {
                ...this.invoiceForm.value,
                calculations: {
                    subtotal: this.calculateSubtotal(),
                    discount: this.calculateDiscount(),
                    tax: this.calculateTax(),
                    additionalTaxTotal: this.calculateAdditionalTaxTotal(),
                    total: this.calculateTotal()
                }
            });
            // Save logic here
            alert('Fatura başarıyla oluşturuldu!');
            this.router.navigate(['/invoices']);
        } else {
            alert('Lütfen tüm zorunlu alanları doldurun.');
        }
    }
}
