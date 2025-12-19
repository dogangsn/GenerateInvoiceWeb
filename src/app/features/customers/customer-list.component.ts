import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerService } from '../../core/services/customer.service';
import { Customer, CustomerFormData } from '../../core/models/customer.model';

@Component({
    selector: 'app-customer-list',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './customer-list.component.html',
    styleUrl: './customer-list.component.css'
})
export class CustomerListComponent implements OnInit {
    private customerService = inject(CustomerService);
    private platformId = inject(PLATFORM_ID);

    customers: Customer[] = [];
    filteredCustomers: Customer[] = [];
    selectedIds: Set<string> = new Set();
    searchTerm = '';
    isLoading = false;
    
    // Modal state
    showModal = false;
    isEditing = false;
    editingCustomerId: string | null = null;
    isSaving = false;
    
    // Form data
    formData: CustomerFormData = this.getEmptyForm();

    // Delete confirmation
    showDeleteConfirm = false;
    deletingCustomerId: string | null = null;

    countries = [
        'Türkiye', 'Almanya', 'Fransa', 'Birleşik Krallık', 'İspanya',
        'İtalya', 'Hollanda', 'Kanada', 'ABD', 'Avustralya'
    ];

    ngOnInit(): void {
        // SSR'da veri yükleme yapma
        if (isPlatformBrowser(this.platformId)) {
            this.loadCustomers();
        }
    }

    private loadCustomers(): void {
        this.isLoading = true;
        this.customerService.getCustomers().subscribe({
            next: (data) => {
                this.customers = data;
                this.filterCustomers();
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Müşteriler yüklenirken hata:', err);
                this.isLoading = false;
            }
        });
    }

    filterCustomers(): void {
        if (!this.searchTerm.trim()) {
            this.filteredCustomers = [...this.customers];
        } else {
            const term = this.searchTerm.toLowerCase();
            this.filteredCustomers = this.customers.filter(c =>
                c.name.toLowerCase().includes(term) ||
                c.email.toLowerCase().includes(term) ||
                c.phone.includes(term)
            );
        }
    }

    // Selection methods
    toggleSelection(id: string): void {
        if (this.selectedIds.has(id)) {
            this.selectedIds.delete(id);
        } else {
            this.selectedIds.add(id);
        }
    }

    toggleSelectAll(): void {
        if (this.selectedIds.size === this.filteredCustomers.length) {
            this.selectedIds.clear();
        } else {
            this.filteredCustomers.forEach(c => {
                if (c.id) this.selectedIds.add(c.id);
            });
        }
    }

    isSelected(id: string): boolean {
        return this.selectedIds.has(id);
    }

    get isAllSelected(): boolean {
        return this.filteredCustomers.length > 0 && 
               this.selectedIds.size === this.filteredCustomers.length;
    }

    // Modal methods
    openAddModal(): void {
        this.formData = this.getEmptyForm();
        this.isEditing = false;
        this.editingCustomerId = null;
        this.showModal = true;
    }

    openEditModal(customer: Customer): void {
        this.formData = {
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            country: customer.country,
            address: customer.address || '',
            taxId: customer.taxId || '',
            taxOffice: customer.taxOffice || '',
            notes: customer.notes || ''
        };
        this.isEditing = true;
        this.editingCustomerId = customer.id || null;
        this.showModal = true;
    }

    closeModal(): void {
        this.showModal = false;
        this.formData = this.getEmptyForm();
    }

    async saveCustomer(): Promise<void> {
        if (!this.formData.name || !this.formData.email) return;

        this.isSaving = true;
        try {
            if (this.isEditing && this.editingCustomerId) {
                await this.customerService.updateCustomer(this.editingCustomerId, this.formData);
            } else {
                await this.customerService.addCustomer(this.formData);
            }
            this.closeModal();
        } catch (error) {
            console.error('Müşteri kaydedilirken hata:', error);
        } finally {
            this.isSaving = false;
        }
    }

    // Delete methods
    confirmDelete(id: string): void {
        this.deletingCustomerId = id;
        this.showDeleteConfirm = true;
    }

    cancelDelete(): void {
        this.showDeleteConfirm = false;
        this.deletingCustomerId = null;
    }

    async deleteCustomer(): Promise<void> {
        if (!this.deletingCustomerId) return;

        try {
            await this.customerService.deleteCustomer(this.deletingCustomerId);
            this.selectedIds.delete(this.deletingCustomerId);
        } catch (error) {
            console.error('Müşteri silinirken hata:', error);
        } finally {
            this.cancelDelete();
        }
    }

    async deleteSelected(): Promise<void> {
        if (this.selectedIds.size === 0) return;

        try {
            await this.customerService.deleteCustomers(Array.from(this.selectedIds));
            this.selectedIds.clear();
        } catch (error) {
            console.error('Müşteriler silinirken hata:', error);
        }
    }

    private getEmptyForm(): CustomerFormData {
        return {
            name: '',
            email: '',
            phone: '',
            country: 'Türkiye',
            address: '',
            taxId: '',
            taxOffice: '',
            notes: ''
        };
    }
}
