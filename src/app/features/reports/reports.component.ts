import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InvoiceService } from '../../core/services/invoice.service';
import { LanguageService } from '../../core/services/language.service';
import { Invoice } from '../../core/models/invoice.model';

@Component({
    selector: 'app-reports',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './reports.component.html',
    styleUrl: './reports.component.css'
})
export class ReportsComponent implements OnInit {
    private invoiceService = inject(InvoiceService);
    private platformId = inject(PLATFORM_ID);
    lang = inject(LanguageService);

    invoices: Invoice[] = [];
    filteredInvoices: Invoice[] = [];
    isLoading = false;

    // Filters
    startDate: string = '';
    endDate: string = '';
    reportType: string = 'all';

    // Summary Metrics
    totalRevenue: number = 0;
    totalInvoicesCount: number = 0;
    totalTax: number = 0;

    monthlySales: { month: string; value: number; amount: number }[] = [
        { month: 'Oca', value: 0, amount: 0 },
        { month: 'Şub', value: 0, amount: 0 },
        { month: 'Mar', value: 0, amount: 0 },
        { month: 'Nis', value: 0, amount: 0 },
        { month: 'May', value: 0, amount: 0 },
        { month: 'Haz', value: 0, amount: 0 },
        { month: 'Tem', value: 0, amount: 0 },
        { month: 'Ağu', value: 0, amount: 0 },
        { month: 'Eyl', value: 0, amount: 0 },
        { month: 'Eki', value: 0, amount: 0 },
        { month: 'Kas', value: 0, amount: 0 },
        { month: 'Ara', value: 0, amount: 0 },
    ];

    ngOnInit(): void {
        const today = new Date();
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        this.startDate = startOfYear.toISOString().split('T')[0];
        this.endDate = today.toISOString().split('T')[0];

        if (isPlatformBrowser(this.platformId)) {
            this.loadReportsData();
        }
    }

    private loadReportsData(): void {
        this.isLoading = true;
        this.invoiceService.getInvoices().subscribe({
            next: (data) => {
                this.invoices = data;
                this.applyFilter();
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Rapor verisi yüklenirken hata:', err);
                this.isLoading = false;
            }
        });
    }

    applyFilter(): void {
        let result = [...this.invoices];

        if (this.startDate) {
            const start = new Date(this.startDate).getTime();
            result = result.filter(inv => inv.date ? new Date(inv.date).getTime() >= start : true);
        }

        if (this.endDate) {
            const end = new Date(this.endDate).getTime() + 86400000;
            result = result.filter(inv => inv.date ? new Date(inv.date).getTime() <= end : true);
        }

        if (this.reportType !== 'all') {
            result = result.filter(inv => inv.status === this.reportType);
        }

        this.filteredInvoices = result;
        this.calculateMetrics(result);
    }

    private calculateMetrics(invoices: Invoice[]): void {
        let revenue = 0;
        let tax = 0;
        const currentYear = new Date().getFullYear();
        const monthlyAmounts = new Array(12).fill(0);

        invoices.forEach(inv => {
            const amt = inv.total || 0;
            const taxAmt = inv.taxTotal || 0;

            if (inv.status === 'paid') {
                revenue += amt;
            }
            tax += taxAmt;

            if (inv.date) {
                const d = new Date(inv.date);
                if (d.getFullYear() === currentYear && inv.status === 'paid') {
                    monthlyAmounts[d.getMonth()] += amt;
                }
            }
        });

        this.totalRevenue = revenue;
        this.totalInvoicesCount = invoices.length;
        this.totalTax = tax;

        // Calculate heights for monthly chart
        const maxAmount = Math.max(...monthlyAmounts, 1);
        const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

        this.monthlySales = monthlyAmounts.map((amt, idx) => ({
            month: months[idx],
            amount: amt,
            value: Math.round((amt / maxAmount) * 100)
        }));
    }

    exportReportToCsv(): void {
        if (this.filteredInvoices.length === 0) return;

        const headers = ['Fatura No', 'Müşteri', 'Tarih', 'Vade', 'Vergi Toplamı', 'Genel Toplam', 'Durum'];
        const rows = this.filteredInvoices.map(inv => [
            `"${inv.invoiceNo}"`,
            `"${inv.customerName}"`,
            `"${inv.date}"`,
            `"${inv.dueDate}"`,
            `"${inv.taxTotal || 0}"`,
            `"${inv.total || 0}"`,
            `"${this.getStatusLabel(inv.status)}"`
        ]);

        const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `fatura_raporu_${new Date().toISOString().split('T')[0]}.csv`);
        link.click();
    }

    printReport(): void {
        if (isPlatformBrowser(this.platformId)) {
            window.print();
        }
    }

    getStatusClass(status: string): string {
        const classes: Record<string, string> = {
            'paid': 'bg-green-100 text-green-700',
            'pending': 'bg-orange-100 text-orange-700',
            'overdue': 'bg-red-100 text-red-700',
            'draft': 'bg-slate-100 text-slate-700',
            'cancelled': 'bg-gray-100 text-gray-500'
        };
        return classes[status] || 'bg-slate-100 text-slate-700';
    }

    getStatusLabel(status: string): string {
        const labels: Record<string, string> = {
            'paid': 'Ödendi',
            'pending': 'Bekliyor',
            'overdue': 'Gecikmiş',
            'draft': 'Taslak',
            'cancelled': 'İptal'
        };
        return labels[status] || status;
    }
}
