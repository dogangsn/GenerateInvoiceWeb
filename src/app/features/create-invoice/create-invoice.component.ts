import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
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
export class CreateInvoiceComponent {
    invoiceForm: FormGroup;

    constructor(private fb: FormBuilder, private router: Router) {
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
        return this.calculateSubtotal() * 0.20; // 20% KDV
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
