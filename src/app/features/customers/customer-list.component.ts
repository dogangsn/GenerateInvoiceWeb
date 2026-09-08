import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CustomerService } from '../../core/services/customer.service';
import { InvoiceService } from '../../core/services/invoice.service';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../core/services/user.service';
import { LanguageService } from '../../core/services/language.service';
import { AlertService } from '../../core/services/alert.service';
import { Customer, CustomerFormData, ReconciliationStatus } from '../../core/models/customer.model';
import { Invoice } from '../../core/models/invoice.model';

@Component({
    selector: 'app-customer-list',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './customer-list.component.html',
    styleUrl: './customer-list.component.css'
})
export class CustomerListComponent implements OnInit {
    private customerService = inject(CustomerService);
    private invoiceService = inject(InvoiceService);
    private authService = inject(AuthService);
    private userService = inject(UserService);
    private alertService = inject(AlertService);
    private router = inject(Router);
    private platformId = inject(PLATFORM_ID);
    lang = inject(LanguageService);

    customers: Customer[] = [];
    filteredCustomers: Customer[] = [];
    invoices: Invoice[] = [];
    selectedIds: Set<string> = new Set();
    searchTerm = '';
    riskFilter: 'all' | 'low' | 'medium' | 'high' = 'all';
    isLoading = false;

    // Pagination
    currentPage = 1;
    pageSize = 8;

    // Modal state (Add / Edit)
    showModal = false;
    isEditing = false;
    editingCustomerId: string | null = null;
    isSaving = false;

    // Cari Hesap Ekstresi (Statement Modal)
    showStatementModal = false;
    selectedCustomerForStatement: Customer | null = null;
    statementInvoices: Invoice[] = [];

    // Hızlı Mutabakat Modalı (Reconciliation Modal)
    showReconciliationModal = false;
    selectedCustomerForReconciliation: Customer | null = null;
    reconciliationPeriod = '2026-08';
    reconciliationStatus: ReconciliationStatus = 'pending';
    reconciliationNotes = '';
    isSavingReconciliation = false;

    // Risk Analizi Modalı
    showRiskModal = false;
    selectedCustomerForRisk: Customer | null = null;
    selectedCustomerRiskData: { score: number; level: 'low' | 'medium' | 'high'; reason: string } | null = null;

    // Form data
    formData: CustomerFormData = this.getEmptyForm();

    countries = [
        'Türkiye', 'Dubai (BAE)', 'Almanya', 'Fransa', 'Birleşik Krallık', 'İspanya',
        'İtalya', 'Hollanda', 'Kanada', 'ABD', 'Avustralya'
    ];

    ngOnInit(): void {
        if (isPlatformBrowser(this.platformId)) {
            this.loadInvoices();
            this.loadCustomers();
        }
    }

    private loadInvoices(): void {
        this.invoiceService.getInvoices().subscribe({
            next: (data) => {
                this.invoices = data;
            },
            error: (err) => console.error('Faturalar yüklenirken hata:', err)
        });
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
                console.error('Cari hesaplar yüklenirken hata:', err);
                this.isLoading = false;
            }
        });
    }

    filterCustomers(): void {
        let result = [...this.customers];

        if (this.searchTerm.trim()) {
            const term = this.searchTerm.toLowerCase();
            result = result.filter(c =>
                c.name.toLowerCase().includes(term) ||
                (c.email && c.email.toLowerCase().includes(term)) ||
                (c.phone && c.phone.includes(term)) ||
                (c.taxId && c.taxId.includes(term))
            );
        }

        if (this.riskFilter !== 'all') {
            result = result.filter(c => {
                const risk = this.getCustomerRisk(c);
                return risk.level === this.riskFilter;
            });
        }

        this.filteredCustomers = result;
        this.currentPage = 1;
    }

    // Cari Bakiye Hesaplama
    getCustomerBalance(customer: Customer): number {
        if (customer.balance !== undefined && customer.balance !== null) {
            return customer.balance;
        }
        // Faturalardan dinamik hesaplama (Ödenmemişler)
        const customerInvs = this.invoices.filter(i => 
            (i.customerId === customer.id || i.customerName === customer.name) &&
            i.status !== 'paid' && i.status !== 'cancelled'
        );
        return customerInvs.reduce((sum, inv) => sum + (inv.total || 0), 0);
    }

    getCustomerTotalInvoiced(customer: Customer): number {
        const customerInvs = this.invoices.filter(i => 
            (i.customerId === customer.id || i.customerName === customer.name) &&
            i.status !== 'cancelled'
        );
        return customerInvs.reduce((sum, inv) => sum + (inv.total || 0), 0);
    }

    getCustomerRisk(customer: Customer): { score: number; level: 'low' | 'medium' | 'high'; reason: string } {
        const customerInvs = this.invoices.filter(i => i.customerId === customer.id || i.customerName === customer.name);
        return this.customerService.calculateCustomerRisk(customer, customerInvs);
    }

    // Cari Hesap Ekstresi
    openStatementModal(customer: Customer): void {
        this.selectedCustomerForStatement = customer;
        this.statementInvoices = this.invoices.filter(i => 
            (i.customerId === customer.id || i.customerName === customer.name) &&
            i.status !== 'cancelled'
        ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        this.showStatementModal = true;
    }

    closeStatementModal(): void {
        this.showStatementModal = false;
        this.selectedCustomerForStatement = null;
    }

    printStatement(): void {
        window.print();
    }

    // Hızlı Mutabakat
    openReconciliationModal(customer: Customer): void {
        this.selectedCustomerForReconciliation = customer;
        this.reconciliationStatus = customer.reconciliationStatus || 'pending';
        this.reconciliationNotes = customer.reconciliationNotes || '';
        this.showReconciliationModal = true;
    }

    closeReconciliationModal(): void {
        this.showReconciliationModal = false;
        this.selectedCustomerForReconciliation = null;
    }

    async saveReconciliation(): Promise<void> {
        if (!this.selectedCustomerForReconciliation?.id) return;

        this.isSavingReconciliation = true;
        try {
            await this.customerService.updateReconciliation(
                this.selectedCustomerForReconciliation.id,
                this.reconciliationStatus,
                this.reconciliationNotes
            );
            this.alertService.toast('Mutabakat durumu güncellendi', 'success');
            this.closeReconciliationModal();
            this.loadCustomers();
        } catch (err) {
            this.alertService.error('Hata', 'Mutabakat kaydedilemedi.');
        } finally {
            this.isSavingReconciliation = false;
        }
    }

    getReconciliationLetterText(): string {
        if (!this.selectedCustomerForReconciliation) return '';
        const c = this.selectedCustomerForReconciliation;
        const balance = this.getCustomerBalance(c);
        const dateStr = new Date().toLocaleDateString('tr-TR');
        return `Sayın ${c.name},\n\nŞirketimiz kayıtlarına göre ${dateStr} tarihi itibarıyla cari hesabınız ₺${balance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} bakiyesi vermektedir.\n\nKayıtlarınız ile mutabık olup olmadığınızı bildirmenizi rica ederiz.\n\nOdivon FaturaPro Mutabakat Servisi`;
    }

    shareViaWhatsApp(): void {
        const text = encodeURIComponent(this.getReconciliationLetterText());
        const phone = this.selectedCustomerForReconciliation?.phone ? this.selectedCustomerForReconciliation.phone.replace(/\D/g, '') : '';
        const url = phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`;
        window.open(url, '_blank');
    }

    // Risk Analizi Modalı
    openRiskModal(customer: Customer): void {
        this.selectedCustomerForRisk = customer;
        this.selectedCustomerRiskData = this.getCustomerRisk(customer);
        this.showRiskModal = true;
    }

    closeRiskModal(): void {
        this.showRiskModal = false;
        this.selectedCustomerForRisk = null;
        this.selectedCustomerRiskData = null;
    }

    // Pagination getters
    get totalPages(): number {
        return Math.ceil(this.filteredCustomers.length / this.pageSize) || 1;
    }

    get paginatedCustomers(): Customer[] {
        const start = (this.currentPage - 1) * this.pageSize;
        return this.filteredCustomers.slice(start, start + this.pageSize);
    }

    goToPage(page: number): void {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
        }
    }

    // Selection methods
    toggleSelect(id: string): void {
        if (this.selectedIds.has(id)) {
            this.selectedIds.delete(id);
        } else {
            this.selectedIds.add(id);
        }
    }

    toggleSelectAll(): void {
        if (this.selectedIds.size === this.paginatedCustomers.length) {
            this.selectedIds.clear();
        } else {
            this.paginatedCustomers.forEach(c => {
                if (c.id) this.selectedIds.add(c.id);
            });
        }
    }

    isSelected(id: string): boolean {
        return this.selectedIds.has(id);
    }

    get isAllSelected(): boolean {
        return this.paginatedCustomers.length > 0 &&
            this.selectedIds.size === this.paginatedCustomers.length;
    }

    // Add / Edit Modal
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
            notes: customer.notes || '',
            creditLimit: customer.creditLimit || 0,
            balance: customer.balance || 0
        };
        this.isEditing = true;
        this.editingCustomerId = customer.id || null;
        this.showModal = true;
    }

    closeModal(): void {
        this.showModal = false;
        this.isEditing = false;
        this.editingCustomerId = null;
        this.formData = this.getEmptyForm();
    }

    async saveCustomer(): Promise<void> {
        if (!this.formData.name || !this.formData.email) {
            this.alertService.warning('Eksik Bilgi', 'Lütfen cari unvanını ve e-posta adresini doldurun.');
            return;
        }

        this.isSaving = true;
        try {
            if (this.isEditing && this.editingCustomerId) {
                await this.customerService.updateCustomer(this.editingCustomerId, this.formData);
                this.alertService.toast('Cari hesap güncellendi', 'success');
            } else {
                await this.customerService.addCustomer(this.formData);
                this.alertService.toast('Yeni cari hesap oluşturuldu', 'success');
            }
            this.closeModal();
            this.loadCustomers();
        } catch (error: any) {
            console.error('Cari kaydedilirken hata:', error);
            this.alertService.error('Hata', 'Cari hesap kaydedilirken bir hata oluştu.');
        } finally {
            this.isSaving = false;
        }
    }

    async deleteCustomer(id: string): Promise<void> {
        const confirmed = await this.alertService.confirm({
            title: 'Cari Hesabı Sil',
            text: 'Bu cari hesabı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
            confirmButtonText: 'Evet, Sil',
            cancelButtonText: 'İptal',
            isDanger: true
        });

        if (!confirmed) return;

        try {
            await this.customerService.deleteCustomer(id);
            this.alertService.toast('Cari hesap silindi', 'success');
            this.loadCustomers();
        } catch (error) {
            this.alertService.error('Hata', 'Cari hesap silinemedi.');
        }
    }

    async deleteSelected(): Promise<void> {
        if (this.selectedIds.size === 0) return;

        const count = this.selectedIds.size;
        const confirmed = await this.alertService.confirm({
            title: 'Toplu Silme',
            text: `Seçilen ${count} cari hesabı silmek istediğinizden emin misiniz?`,
            confirmButtonText: `Evet, ${count} Cariyi Sil`,
            cancelButtonText: 'İptal',
            isDanger: true
        });

        if (!confirmed) return;

        try {
            await this.customerService.deleteCustomers(Array.from(this.selectedIds));
            this.selectedIds.clear();
            this.alertService.toast(`${count} cari hesap silindi`, 'success');
            this.loadCustomers();
        } catch (error) {
            this.alertService.error('Hata', 'Cari hesaplar silinemedi.');
        }
    }

    exportToCsv(): void {
        if (this.customers.length === 0) {
            this.alertService.warning('Veri Yok', 'Dışa aktarılacak cari hesap bulunamadı.');
            return;
        }

        const headers = ['Cari Unvan', 'E-posta', 'Telefon', 'Vergi Dairesi', 'Vergi No', 'Cari Bakiye (TL)', 'Risk Seviyesi', 'Mutabakat Durumu'];
        const rows = this.customers.map(c => [
            `"${c.name}"`,
            `"${c.email}"`,
            `"${c.phone}"`,
            `"${c.taxOffice || ''}"`,
            `"${c.taxId || ''}"`,
            `"${this.getCustomerBalance(c)}"`,
            `"${this.getCustomerRisk(c).level.toUpperCase()}"`,
            `"${c.reconciliationStatus || 'pending'}"`
        ]);

        const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Cari_Hesaplar_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
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
            notes: '',
            creditLimit: 50000,
            balance: 0
        };
    }
}
