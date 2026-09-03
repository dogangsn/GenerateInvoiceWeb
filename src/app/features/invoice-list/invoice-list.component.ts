import { Component, OnInit, inject, PLATFORM_ID, ElementRef, ViewChild } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { InvoiceService } from '../../core/services/invoice.service';
import { CustomerService } from '../../core/services/customer.service';
import { AuthService } from '../../core/services/auth.service';
import { LanguageService } from '../../core/services/language.service';
import { Invoice, InvoiceFormData, InvoiceItem } from '../../core/models/invoice.model';
import { Customer } from '../../core/models/customer.model';
import { UserProfile } from '../../core/models/user.model';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
    selector: 'app-invoice-list',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './invoice-list.component.html',
    styleUrl: './invoice-list.component.css'
})
export class InvoiceListComponent implements OnInit {
    private invoiceService = inject(InvoiceService);
    private customerService = inject(CustomerService);
    private authService = inject(AuthService);
    private platformId = inject(PLATFORM_ID);
    lang = inject(LanguageService);

    @ViewChild('invoicePreviewCard') invoicePreviewCardRef!: ElementRef<HTMLElement>;

    invoices: Invoice[] = [];
    filteredInvoices: Invoice[] = [];
    customers: Customer[] = [];
    selectedIds: Set<string> = new Set();
    searchTerm = '';
    statusFilter = 'all';
    isLoading = false;

    // Pagination
    currentPage = 1;
    pageSize = 8;

    // Modal state
    showModal = false;
    isEditing = false;
    editingInvoiceId: string | null = null;
    isSaving = false;

    // Preview modal state
    showPreviewModal = false;
    previewInvoice: Invoice | null = null;
    userProfile: UserProfile | null = null;
    isGeneratingPdf = false;

    // Form data
    formData: InvoiceFormData = this.getEmptyForm();

    // Country & Tax State
    countryName = 'Türkiye';
    taxLabel = 'KDV';
    taxRate = 20;

    // Delete confirmation
    showDeleteConfirm = false;
    deletingInvoiceId: string | null = null;

    // Status options
    statusOptions: { value: Invoice['status']; label: string; color: string }[] = [
        { value: 'draft', label: 'Taslak', color: 'bg-slate-100 text-slate-700' },
        { value: 'sent', label: 'Gönderildi', color: 'bg-blue-100 text-blue-700' },
        { value: 'paid', label: 'Ödendi', color: 'bg-green-100 text-green-700' },
        { value: 'overdue', label: 'Gecikmiş', color: 'bg-red-100 text-red-700' },
        { value: 'cancelled', label: 'İptal', color: 'bg-gray-100 text-gray-500' }
    ];

    ngOnInit(): void {
        if (isPlatformBrowser(this.platformId)) {
            this.loadInvoices();
            this.loadCustomers();
            this.loadUserProfile();
        }
    }

    private loadUserProfile() {
        this.authService.userProfile$.subscribe(profile => {
            this.userProfile = profile;
        });
    }

    private loadInvoices(): void {
        this.isLoading = true;
        this.invoiceService.getInvoices().subscribe({
            next: (data) => {
                this.invoices = data;
                this.filterInvoices();
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Faturalar yüklenirken hata:', err);
                this.isLoading = false;
            }
        });
    }

    private loadCustomers(): void {
        this.customerService.getCustomers().subscribe({
            next: (data) => {
                this.customers = data;
            }
        });
    }

    filterInvoices(): void {
        let result = [...this.invoices];

        if (this.statusFilter !== 'all') {
            result = result.filter(inv => inv.status === this.statusFilter);
        }

        if (this.searchTerm.trim()) {
            const term = this.searchTerm.toLowerCase();
            result = result.filter(inv =>
                inv.invoiceNo.toLowerCase().includes(term) ||
                inv.customerName.toLowerCase().includes(term)
            );
        }

        this.filteredInvoices = result;
        this.currentPage = 1;
    }

    // Pagination getters
    get totalPages(): number {
        return Math.ceil(this.filteredInvoices.length / this.pageSize) || 1;
    }

    get paginatedInvoices(): Invoice[] {
        const start = (this.currentPage - 1) * this.pageSize;
        return this.filteredInvoices.slice(start, start + this.pageSize);
    }

    setPage(page: number): void {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
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
        if (this.selectedIds.size === this.paginatedInvoices.length) {
            this.selectedIds.clear();
        } else {
            this.paginatedInvoices.forEach(inv => {
                if (inv.id) this.selectedIds.add(inv.id);
            });
        }
    }

    isSelected(id: string): boolean {
        return this.selectedIds.has(id);
    }

    get isAllSelected(): boolean {
        return this.paginatedInvoices.length > 0 &&
            this.selectedIds.size === this.paginatedInvoices.length;
    }

    // Modal methods
    openAddModal(): void {
        this.formData = this.getEmptyForm();
        this.formData.invoiceNo = this.invoiceService.generateInvoiceNumber();
        this.isEditing = false;
        this.editingInvoiceId = null;
        this.setCountryDetails('TR');
        this.showModal = true;
    }

    openEditModal(invoice: Invoice): void {
        this.formData = {
            invoiceNo: invoice.invoiceNo,
            date: this.formatDateForInput(invoice.date),
            dueDate: this.formatDateForInput(invoice.dueDate),
            customerId: invoice.customerId,
            customerName: invoice.customerName,
            customerEmail: invoice.customerEmail || '',
            customerTaxId: invoice.customerTaxId || '',
            customerAddress: invoice.customerAddress || '',
            items: invoice.items.map(item => ({ ...item, discount: item.discount || 0 })),
            notes: invoice.notes || '',
            status: invoice.status,
            countryCode: invoice.countryCode || 'TR',
            additionalTaxes: invoice.additionalTaxes || []
        };

        this.setCountryDetails(invoice.countryCode || 'TR');
        if (invoice.taxRate !== undefined) this.taxRate = invoice.taxRate;
        if (invoice.taxLabel) this.taxLabel = invoice.taxLabel;

        this.isEditing = true;
        this.editingInvoiceId = invoice.id || null;
        this.showModal = true;
    }

    closeModal(): void {
        this.showModal = false;
        this.formData = this.getEmptyForm();
    }

    async saveInvoice(): Promise<void> {
        if (!this.formData.customerName || this.formData.items.length === 0) return;

        const invoiceData: InvoiceFormData = {
            ...this.formData,
            countryCode: this.formData.countryCode,
            taxLabel: this.taxLabel,
            taxRate: this.taxRate
        };

        this.isSaving = true;
        try {
            if (this.isEditing && this.editingInvoiceId) {
                await this.invoiceService.updateInvoice(this.editingInvoiceId, invoiceData);
            } else {
                await this.invoiceService.createInvoice(invoiceData);
            }
            this.closeModal();
            this.loadInvoices();
        } catch (error: any) {
            console.error('Fatura kaydedilirken hata:', error);
            alert('Fatura kaydedilirken bir hata oluştu: ' + (error?.message || error));
        } finally {
            this.isSaving = false;
        }
    }

    // Customer selection
    onCustomerSelect(customerId: string): void {
        const customer = this.customers.find(c => c.id === customerId);
        if (customer) {
            this.formData.customerId = customer.id;
            this.formData.customerName = customer.name;
            this.formData.customerEmail = customer.email;
            this.formData.customerTaxId = customer.taxId || '';
            this.formData.customerAddress = customer.address || '';
        }
    }

    // Country selection
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
            this.taxRate = 0;
        }
        this.formData.countryCode = code;
        this.formData.taxRate = this.taxRate;
        this.formData.taxLabel = this.taxLabel;
    }

    onCountryChange(code: string) {
        this.setCountryDetails(code);
    }

    // Additional Taxes
    addAdditionalTax() {
        if (!this.formData.additionalTaxes) {
            this.formData.additionalTaxes = [];
        }
        this.formData.additionalTaxes.push({ name: 'Ek Vergi', rate: 0 });
    }

    removeAdditionalTax(index: number) {
        if (this.formData.additionalTaxes) {
            this.formData.additionalTaxes.splice(index, 1);
        }
    }

    // Item methods
    addItem(): void {
        this.formData.items.push({
            description: '',
            quantity: 1,
            unitPrice: 0,
            discount: 0
        });
    }

    removeItem(index: number): void {
        this.formData.items.splice(index, 1);
    }

    calculateItemTotal(item: InvoiceItem): number {
        const gross = item.quantity * item.unitPrice;
        const discountAmount = gross * ((item.discount || 0) / 100);
        return gross - discountAmount;
    }

    // Calculations
    get formSubtotal(): number {
        return this.formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    }

    get formTotalDiscount(): number {
        return this.formData.items.reduce((sum, item) => {
            const gross = item.quantity * item.unitPrice;
            return sum + (gross * ((item.discount || 0) / 100));
        }, 0);
    }

    get formNetSubtotal(): number {
        return this.formSubtotal - this.formTotalDiscount;
    }

    get formTaxTotal(): number {
        return this.formNetSubtotal * (this.taxRate / 100);
    }

    get formAdditionalTaxTotal(): number {
        if (!this.formData.additionalTaxes) return 0;
        return this.formData.additionalTaxes.reduce((sum, tax) => {
            return sum + (this.formNetSubtotal * (tax.rate / 100));
        }, 0);
    }

    get formTotal(): number {
        return this.formNetSubtotal + this.formTaxTotal + this.formAdditionalTaxTotal;
    }

    // Preview & PDF
    openPreviewModal(invoice: Invoice): void {
        this.previewInvoice = invoice;
        this.showPreviewModal = true;
    }

    closePreviewModal(): void {
        this.showPreviewModal = false;
        this.previewInvoice = null;
    }

    async downloadPdf(): Promise<void> {
        if (!isPlatformBrowser(this.platformId) || !this.invoicePreviewCardRef?.nativeElement || !this.previewInvoice) return;

        this.isGeneratingPdf = true;
        try {
            const element = this.invoicePreviewCardRef.nativeElement;
            const canvas = await html2canvas(element, { scale: 2, useCORS: true });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 210;
            const pageHeight = 297;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, Math.min(imgHeight, pageHeight));
            pdf.save(`${this.previewInvoice.invoiceNo}.pdf`);
        } catch (error) {
            console.error('PDF oluşturma hatası:', error);
        } finally {
            this.isGeneratingPdf = false;
        }
    }

    printInvoice(): void {
        if (isPlatformBrowser(this.platformId)) {
            window.print();
        }
    }

    exportToCsv(): void {
        if (this.filteredInvoices.length === 0) return;
        const headers = ['Fatura No', 'Müşteri Adı', 'E-posta', 'Tarih', 'Vade Tarihi', 'Tutar (TL)', 'Durum'];
        const rows = this.filteredInvoices.map(inv => [
            `"${inv.invoiceNo}"`,
            `"${inv.customerName}"`,
            `"${inv.customerEmail || ''}"`,
            `"${inv.date}"`,
            `"${inv.dueDate}"`,
            `"${inv.total || 0}"`,
            `"${this.getStatusLabel(inv.status)}"`
        ]);

        const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `faturalar_${new Date().toISOString().split('T')[0]}.csv`);
        link.click();
    }

    // Delete methods
    confirmDelete(id: string): void {
        this.deletingInvoiceId = id;
        this.showDeleteConfirm = true;
    }

    cancelDelete(): void {
        this.showDeleteConfirm = false;
        this.deletingInvoiceId = null;
    }

    async deleteInvoice(): Promise<void> {
        if (!this.deletingInvoiceId) return;

        try {
            await this.invoiceService.deleteInvoice(this.deletingInvoiceId);
            this.selectedIds.delete(this.deletingInvoiceId);
            this.loadInvoices();
        } catch (error) {
            console.error('Fatura silinirken hata:', error);
        } finally {
            this.cancelDelete();
        }
    }

    async deleteSelected(): Promise<void> {
        if (this.selectedIds.size === 0) return;

        try {
            await this.invoiceService.deleteInvoices(Array.from(this.selectedIds));
            this.selectedIds.clear();
            this.loadInvoices();
        } catch (error) {
            console.error('Faturalar silinirken hata:', error);
        }
    }

    // Status methods
    async updateStatus(invoice: Invoice, status: Invoice['status']): Promise<void> {
        if (!invoice.id) return;
        try {
            await this.invoiceService.updateInvoiceStatus(invoice.id, status);
            this.loadInvoices();
        } catch (error) {
            console.error('Durum güncellenirken hata:', error);
        }
    }

    getStatusColor(status: string): string {
        const option = this.statusOptions.find(s => s.value === status);
        return option?.color || 'bg-gray-100 text-gray-700';
    }

    getStatusLabel(status: string): string {
        const option = this.statusOptions.find(s => s.value === status);
        return option?.label || status;
    }

    // Helpers
    private formatDateForInput(date: Date | string): string {
        if (!date) return '';
        const d = new Date(date);
        return d.toISOString().split('T')[0];
    }

    private getEmptyForm(): InvoiceFormData {
        const today = new Date();
        const dueDate = new Date();
        dueDate.setDate(today.getDate() + 14);

        return {
            invoiceNo: '',
            date: today.toISOString().split('T')[0],
            dueDate: dueDate.toISOString().split('T')[0],
            customerName: '',
            customerEmail: '',
            customerTaxId: '',
            customerAddress: '',
            items: [{
                description: '',
                quantity: 1,
                unitPrice: 0,
                discount: 0
            }],
            notes: '',
            status: 'draft',
            countryCode: 'TR',
            additionalTaxes: []
        };
    }
}
