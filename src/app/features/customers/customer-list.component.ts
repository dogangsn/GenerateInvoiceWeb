import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerService } from '../../core/services/customer.service';
import { Customer } from '../../core/models/customer.model';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { InputComponent } from '../../shared/components/input/input.component';
import { Observable, of } from 'rxjs';

@Component({
    selector: 'app-customer-list',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonComponent, InputComponent],
    templateUrl: './customer-list.component.html',
    styleUrl: './customer-list.component.css'
})
export class CustomerListComponent implements OnInit {
    private customerService = inject(CustomerService);
    private platformId = inject(PLATFORM_ID);

    customers$: Observable<Customer[]> = of([]);
    isLoading = true;
    showAddForm = false;
    isSaving = false;

    // Yeni müşteri formu
    newCustomer = {
        name: '',
        email: '',
        phone: '',
        address: '',
        taxId: '',
        country: 'Türkiye'
    };

    ngOnInit(): void {
        if (isPlatformBrowser(this.platformId)) {
            this.customers$ = this.customerService.getCustomers();
            this.customers$.subscribe({
                next: () => this.isLoading = false,
                error: (err) => {
                    console.error('Müşteri yükleme hatası:', err);
                    this.isLoading = false;
                }
            });
        } else {
            this.isLoading = false;
        }
    }

    toggleAddForm() {
        this.showAddForm = !this.showAddForm;
        if (!this.showAddForm) {
            this.resetForm();
        }
    }

    resetForm() {
        this.newCustomer = {
            name: '',
            email: '',
            phone: '',
            address: '',
            taxId: '',
            country: 'Türkiye'
        };
    }

    async saveCustomer() {
        if (!this.newCustomer.name) {
            alert('Lütfen müşteri adını girin.');
            return;
        }

        this.isSaving = true;
        try {
            await this.customerService.createCustomer(this.newCustomer);
            this.toggleAddForm();
            alert('Müşteri başarıyla kaydedildi!');
        } catch (error: any) {
            console.error('Müşteri kaydetme hatası:', error);
            alert('Müşteri kaydedilemedi: ' + error.message);
        } finally {
            this.isSaving = false;
        }
    }

    async deleteCustomer(customer: Customer) {
        if (confirm(`"${customer.name}" müşterisini silmek istediğinize emin misiniz?`)) {
            try {
                await this.customerService.deleteCustomer(customer.id!);
            } catch (error) {
                console.error('Silme hatası:', error);
                alert('Müşteri silinemedi.');
            }
        }
    }
}
