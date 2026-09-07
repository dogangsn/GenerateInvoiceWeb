import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ExpenseService } from '../../core/services/expense.service';
import { AiScannerService, ScannedDocumentResult } from '../../core/services/ai-scanner.service';
import { LanguageService } from '../../core/services/language.service';
import { AlertService } from '../../core/services/alert.service';
import { Expense, ExpenseCategory, ExpenseFormData, PaymentMethod } from '../../core/models/expense.model';

@Component({
    selector: 'app-expenses',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    templateUrl: './expenses.component.html'
})
export class ExpensesComponent implements OnInit, OnDestroy {
    private expenseService = inject(ExpenseService);
    private aiScannerService = inject(AiScannerService);
    private alertService = inject(AlertService);
    private fb = inject(FormBuilder);
    lang = inject(LanguageService);

    private sub: Subscription | null = null;
    expenses: Expense[] = [];
    filteredExpenses: Expense[] = [];

    // Filter states
    searchTerm = '';
    selectedCategory: string = 'all';

    // Modal states
    showExpenseModal = false;
    isEditing = false;
    editingExpenseId: string | null = null;
    isSaving = false;

    // AI Scanner Modal states
    showScannerModal = false;
    isScanning = false;
    scannedResult: ScannedDocumentResult | null = null;
    scannerPreviewUrl: string | null = null;
    scannerError: string | null = null;

    // Receipt viewer modal
    previewReceiptUrl: string | null = null;

    // Form
    expenseForm: FormGroup = this.fb.group({
        merchantName: ['', [Validators.required]],
        amount: [0, [Validators.required, Validators.min(0.01)]],
        taxAmount: [0, [Validators.min(0)]],
        taxRate: [20],
        currency: ['TRY'],
        date: [new Date().toISOString().split('T')[0], [Validators.required]],
        category: ['office' as ExpenseCategory, [Validators.required]],
        paymentMethod: ['credit_card' as PaymentMethod, [Validators.required]],
        description: [''],
        receiptUrl: ['']
    });

    readonly categories: { value: ExpenseCategory; labelTr: string; labelEn: string; icon: string; color: string }[] = [
        { value: 'food', labelTr: 'Yemek & Temsil', labelEn: 'Food & Meals', icon: 'restaurant', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300' },
        { value: 'transport', labelTr: 'Ulaşım & Yakıt', labelEn: 'Transport & Fuel', icon: 'directions_car', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300' },
        { value: 'office', labelTr: 'Ofis & Kırtasiye', labelEn: 'Office & Supplies', icon: 'desk', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300' },
        { value: 'utilities', labelTr: 'Kira & Faturalar', labelEn: 'Rent & Utilities', icon: 'bolt', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/60 dark:text-yellow-300' },
        { value: 'software', labelTr: 'Yazılım & SaaS', labelEn: 'Software & SaaS', icon: 'terminal', color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300' },
        { value: 'marketing', labelTr: 'Pazarlama & Reklam', labelEn: 'Marketing & Ads', icon: 'campaign', color: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300' },
        { value: 'travel', labelTr: 'Seyahat & Konaklama', labelEn: 'Travel & Lodging', icon: 'flight', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300' },
        { value: 'consulting', labelTr: 'Danışmanlık & Hizmet', labelEn: 'Consulting', icon: 'handshake', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' },
        { value: 'salary', labelTr: 'Maaş & Personel', labelEn: 'Salary & Payroll', icon: 'badge', color: 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300' },
        { value: 'tax', labelTr: 'Vergi & Harç', labelEn: 'Tax & Duties', icon: 'account_balance', color: 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300' },
        { value: 'other', labelTr: 'Diğer Giderler', labelEn: 'Other', icon: 'more_horiz', color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300' },
    ];

    readonly paymentMethods: { value: PaymentMethod; labelTr: string; labelEn: string }[] = [
        { value: 'credit_card', labelTr: 'Kredi Kartı', labelEn: 'Credit Card' },
        { value: 'cash', labelTr: 'Nakit', labelEn: 'Cash' },
        { value: 'bank_transfer', labelTr: 'Havale / EFT', labelEn: 'Bank Transfer' },
        { value: 'company_card', labelTr: 'Şirket Kartı', labelEn: 'Company Card' },
        { value: 'other', labelTr: 'Diğer', labelEn: 'Other' },
    ];

    ngOnInit(): void {
        this.sub = this.expenseService.getExpenses().subscribe(expenses => {
            this.expenses = expenses;
            this.applyFilters();
        });
    }

    ngOnDestroy(): void {
        this.sub?.unsubscribe();
    }

    applyFilters(): void {
        const query = this.searchTerm.trim().toLowerCase();
        this.filteredExpenses = this.expenses.filter(item => {
            const mName = item.merchantName || item.title || item.supplierName || '';
            const desc = item.description || item.notes || '';
            const matchesQuery = !query ||
                mName.toLowerCase().includes(query) ||
                desc.toLowerCase().includes(query);
            const matchesCategory = this.selectedCategory === 'all' || item.category === this.selectedCategory;
            return matchesQuery && matchesCategory;
        });
    }

    // Calculations
    get totalAmount(): number {
        return this.expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
    }

    get thisMonthAmount(): number {
        const currentYearMonth = new Date().toISOString().substring(0, 7);
        return this.expenses
            .filter(e => {
                const dStr = typeof e.date === 'string' ? e.date : (e.date ? new Date(e.date).toISOString() : '');
                return dStr.startsWith(currentYearMonth);
            })
            .reduce((acc, curr) => acc + (curr.amount || 0), 0);
    }

    get totalTaxAmount(): number {
        return this.expenses.reduce((acc, curr) => acc + (curr.taxAmount || 0), 0);
    }

    getCategoryMeta(cat: ExpenseCategory) {
        return this.categories.find(c => c.value === cat) || this.categories[this.categories.length - 1];
    }

    getPaymentMethodLabel(method: PaymentMethod): string {
        const pm = this.paymentMethods.find(m => m.value === method);
        if (!pm) return method;
        return this.lang.lang === 'tr' ? pm.labelTr : pm.labelEn;
    }

    // Modal Actions
    openAddModal(): void {
        this.isEditing = false;
        this.editingExpenseId = null;
        this.expenseForm.reset({
            merchantName: '',
            amount: 0,
            taxAmount: 0,
            taxRate: 20,
            currency: 'TRY',
            date: new Date().toISOString().split('T')[0],
            category: 'office',
            paymentMethod: 'credit_card',
            description: '',
            receiptUrl: ''
        });
        this.showExpenseModal = true;
    }

    openEditModal(expense: Expense): void {
        this.isEditing = true;
        this.editingExpenseId = expense.id || null;
        this.expenseForm.patchValue({
            merchantName: expense.merchantName || expense.title || expense.supplierName || '',
            amount: expense.amount,
            taxAmount: expense.taxAmount || 0,
            taxRate: expense.taxRate || 20,
            currency: expense.currency || 'TRY',
            date: typeof expense.date === 'string' ? expense.date : new Date(expense.date).toISOString().split('T')[0],
            category: expense.category,
            paymentMethod: expense.paymentMethod,
            description: expense.description || expense.notes || '',
            receiptUrl: expense.receiptImage || ''
        });
        this.showExpenseModal = true;
    }

    closeExpenseModal(): void {
        this.showExpenseModal = false;
        this.isEditing = false;
        this.editingExpenseId = null;
    }

    async saveExpense(): Promise<void> {
        if (this.expenseForm.invalid) {
            this.expenseForm.markAllAsTouched();
            return;
        }

        this.isSaving = true;
        const formData: ExpenseFormData = this.expenseForm.value;

        try {
            if (this.isEditing && this.editingExpenseId) {
                await this.expenseService.updateExpense(this.editingExpenseId, formData);
                this.alertService.toast('Gider güncellendi', 'success');
            } else {
                await this.expenseService.createExpense(formData);
                this.alertService.toast('Gider kaydedildi', 'success');
            }
            this.closeExpenseModal();
        } catch (err) {
            console.error('Failed to save expense:', err);
            this.alertService.error('Hata', 'Gider kaydedilirken bir hata oluştu.');
        } finally {
            this.isSaving = false;
        }
    }

    async deleteExpense(id: string): Promise<void> {
        const confirmed = await this.alertService.confirm(
            'Gider Silinsin mi?',
            this.lang.t('expenses.deleteConfirm'),
            'Evet, Sil',
            'Vazgeç'
        );

        if (confirmed) {
            try {
                await this.expenseService.deleteExpense(id);
                this.alertService.toast('Gider silindi', 'info');
            } catch (err) {
                console.error('Failed to delete expense:', err);
                this.alertService.error('Hata', 'Gider silinirken bir hata oluştu.');
            }
        }
    }

    // Receipt Attachment Handling inside Expense Form
    async onReceiptFileSelected(event: Event): Promise<void> {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            const file = input.files[0];
            try {
                const base64 = await this.aiScannerService.fileToBase64(file);
                this.expenseForm.patchValue({ receiptUrl: base64 });
            } catch (e) {
                console.error('Failed to convert receipt to base64', e);
            }
        }
    }

    removeFormReceipt(): void {
        this.expenseForm.patchValue({ receiptUrl: '' });
    }

    // AI Scanner Modal Actions
    openScannerModal(): void {
        this.scannedResult = null;
        this.scannerPreviewUrl = null;
        this.scannerError = null;
        this.isScanning = false;
        this.showScannerModal = true;
    }

    closeScannerModal(): void {
        this.showScannerModal = false;
        this.scannedResult = null;
        this.scannerPreviewUrl = null;
        this.scannerError = null;
    }

    async onScannerFileSelected(event: Event): Promise<void> {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            const file = input.files[0];
            await this.processScannerFile(file);
        }
    }

    onScannerDrop(event: DragEvent): void {
        event.preventDefault();
        if (event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length > 0) {
            const file = event.dataTransfer.files[0];
            this.processScannerFile(file);
        }
    }

    private async processScannerFile(file: File): Promise<void> {
        try {
            this.isScanning = true;
            this.scannerError = null;
            const base64 = await this.aiScannerService.fileToBase64(file);
            this.scannerPreviewUrl = base64;

            const result = await this.aiScannerService.scanReceiptOrInvoice(file);
            this.scannedResult = result;
        } catch (err: any) {
            console.error('AI Scanning failed:', err);
            this.scannerError = err.message || 'Belge taranırken bir hata oluştu.';
        } finally {
            this.isScanning = false;
        }
    }

    applyScannedResultToExpense(): void {
        if (!this.scannedResult) return;

        // Auto map category if predicted or default to office/food
        let matchedCat: ExpenseCategory = 'office';
        if (this.scannedResult.category) {
            const found = this.categories.find(c => c.value === this.scannedResult?.category);
            if (found) matchedCat = found.value;
        }

        this.openAddModal();
        this.expenseForm.patchValue({
            merchantName: this.scannedResult.merchantName || '',
            amount: this.scannedResult.totalAmount || 0,
            taxAmount: this.scannedResult.taxAmount || 0,
            taxRate: this.scannedResult.taxRate || 20,
            currency: this.scannedResult.currency || 'TRY',
            date: this.scannedResult.date || new Date().toISOString().split('T')[0],
            category: matchedCat,
            description: this.scannedResult.items && this.scannedResult.items.length > 0 
                ? this.scannedResult.items.map(i => `${i.description} (${i.totalPrice} TL)`).join(', ')
                : (this.scannedResult.rawText?.substring(0, 100) || ''),
            receiptUrl: this.scannerPreviewUrl || ''
        });

        this.closeScannerModal();
    }

    // Receipt Full Image Preview
    openReceiptPreview(url: string): void {
        this.previewReceiptUrl = url;
    }

    closeReceiptPreview(): void {
        this.previewReceiptUrl = null;
    }

    // Export CSV
    exportToCsv(): void {
        if (this.filteredExpenses.length === 0) {
            this.alertService.warning('Kayıt Bulunamadı', 'Dışa aktarılacak gider kaydı bulunamadı.');
            return;
        }

        const headers = ['Tarih', 'Firma / Açıklama', 'Kategori', 'Tutar', 'KDV', 'Para Birimi', 'Ödeme Yöntemi'];
        const rows = this.filteredExpenses.map(e => [
            `"${typeof e.date === 'string' ? e.date : (e.date ? new Date(e.date).toLocaleDateString('tr-TR') : '')}"`,
            `"${(e.merchantName || e.title || e.supplierName || '').replace(/"/g, '""')}"`,
            `"${this.getCategoryMeta(e.category).labelTr}"`,
            e.amount.toString(),
            (e.taxAmount || 0).toString(),
            `"${e.currency || 'TRY'}"`,
            `"${this.getPaymentMethodLabel(e.paymentMethod)}"`
        ]);

        const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `Giderler_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}
