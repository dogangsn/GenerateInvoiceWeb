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
    taxRate: number = 20; // Default tax rate
    countryName: string = 'Türkiye'; // Default country

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
            items: this.fb.array([])
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
                this.setCountryName(params['countryCode']);
            }
        });
    }

    setCountryName(code: string) {
        const countryMap: { [key: string]: string } = {
            'TR': 'Türkiye',
            'DE': 'Almanya',
            'FR': 'Fransa',
            'UK': 'Birleşik Krallık',
            'ES': 'İspanya',
            'IT': 'İtalya',
            'NL': 'Hollanda',
            'CA': 'Kanada',
            'US': 'ABD',
            'AU': 'Avustralya'
        };
        this.countryName = countryMap[code] || code;
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

    calculateSubtotal(): number {
        return this.items.controls.reduce((acc, item) => {
            const quantity = item.get('quantity')?.value || 0;
            const unitPrice = item.get('unitPrice')?.value || 0;
            return acc + (quantity * unitPrice);
        }, 0);
    }

    calculateTax(): number {
        return this.calculateSubtotal() * (this.taxRate / 100);
    }

    calculateTotal(): number {
        return this.calculateSubtotal() + this.calculateTax();
    }

    goBack() {
        this.router.navigate(['/']);
    }

    saveInvoice() {
        if (this.invoiceForm.valid) {
            console.log('Invoice Data:', this.invoiceForm.value);
            // Save logic here
            alert('Fatura başarıyla oluşturuldu!');
            this.router.navigate(['/invoices']);
        } else {
            alert('Lütfen tüm zorunlu alanları doldurun.');
        }
    }
}
