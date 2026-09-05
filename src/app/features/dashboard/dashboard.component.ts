import { Component, inject, OnInit, AfterViewInit, ElementRef, ViewChild, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { InvoiceService } from '../../core/services/invoice.service';
import { LanguageService } from '../../core/services/language.service';
import { Invoice } from '../../core/models/invoice.model';
import { Chart, registerables } from 'chart.js';

interface DashboardStats {
    totalInvoices: number;
    pendingInvoices: number;
    paidInvoices: number;
    totalRevenue: number;
    totalBilled: number;
    pendingRevenue: number;
    avgInvoiceValue: number;
    proformaCount: number;
    monthlyGrowth: number;
}

interface RecentInvoice {
    id: string;
    invoiceNo: string;
    customerName: string;
    amount: number;
    status: string;
    invoiceType?: string;
    date: Date | string;
}

interface TopCustomer {
    name: string;
    invoiceCount: number;
    totalAmount: number;
}

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './dashboard.component.html',
    styles: [`:host { display: block; }`]
})
export class DashboardComponent implements OnInit, AfterViewInit {
    private authService = inject(AuthService);
    private invoiceService = inject(InvoiceService);
    private platformId = inject(PLATFORM_ID);
    lang = inject(LanguageService);

    @ViewChild('revenueChart') revenueChartRef!: ElementRef<HTMLCanvasElement>;
    @ViewChild('statusChart') statusChartRef!: ElementRef<HTMLCanvasElement>;

    userName = '';
    userEmail = '';
    currentDate = new Date();

    stats: DashboardStats = {
        totalInvoices: 0,
        pendingInvoices: 0,
        paidInvoices: 0,
        totalRevenue: 0,
        totalBilled: 0,
        pendingRevenue: 0,
        avgInvoiceValue: 0,
        proformaCount: 0,
        monthlyGrowth: 0
    };

    recentInvoices: RecentInvoice[] = [];
    topCustomers: TopCustomer[] = [];
    allInvoices: Invoice[] = [];
    monthlyRevenueData: number[] = new Array(12).fill(0);
    statusCounts = { paid: 0, pending: 0, overdue: 0, draft: 0, cancelled: 0 };

    private revenueChart: Chart | null = null;
    private statusChart: Chart | null = null;

    constructor() {
        if (isPlatformBrowser(this.platformId)) {
            Chart.register(...registerables);
        }
    }

    ngOnInit() {
        this.authService.user$.subscribe(user => {
            if (user) {
                this.userName = user.displayName?.split(' ')[0] || 'Kullanıcı';
                this.userEmail = user.email || '';
            }
        });

        if (isPlatformBrowser(this.platformId)) {
            this.loadLiveData();
        }
    }

    logout() {
        this.authService.logout();
    }

    ngAfterViewInit() {
        if (isPlatformBrowser(this.platformId)) {
            setTimeout(() => {
                this.initRevenueChart();
                this.initStatusChart();
            }, 200);
        }
    }

    private loadLiveData() {
        this.invoiceService.getInvoices().subscribe({
            next: (invoices) => {
                this.allInvoices = invoices;
                this.processInvoiceData(invoices);
                this.updateCharts();
            },
            error: (err) => {
                console.error('Dashboard verisi yüklenirken hata:', err);
            }
        });
    }

    private processInvoiceData(invoices: Invoice[]) {
        let totalPaidRevenue = 0;
        let totalBilledSum = 0;
        let pendingRevenueSum = 0;
        let pendingCount = 0;
        let paidCount = 0;
        let overdueCount = 0;
        let draftCount = 0;
        let cancelledCount = 0;
        let proformaCnt = 0;

        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();
        
        const monthlyRev = new Array(12).fill(0);
        let currentMonthRevenue = 0;
        let lastMonthRevenue = 0;

        const customerMap: { [name: string]: { count: number, total: number } } = {};

        invoices.forEach(inv => {
            const status = inv.status || 'draft';
            const amount = inv.total || 0;
            totalBilledSum += amount;

            if (inv.invoiceType === 'proforma') {
                proformaCnt++;
            }

            if (status === 'paid') {
                paidCount++;
                totalPaidRevenue += amount;
            } else if (status === 'pending' || status === 'sent') {
                pendingCount++;
                pendingRevenueSum += amount;
            } else if (status === 'overdue') {
                overdueCount++;
                pendingRevenueSum += amount;
            } else if (status === 'draft') {
                draftCount++;
            } else if (status === 'cancelled') {
                cancelledCount++;
            }

            // Top Customers Aggregation
            if (inv.customerName) {
                if (!customerMap[inv.customerName]) {
                    customerMap[inv.customerName] = { count: 0, total: 0 };
                }
                customerMap[inv.customerName].count++;
                customerMap[inv.customerName].total += amount;
            }

            // Monthly breakdown
            const invDate = inv.date ? new Date(inv.date) : new Date();
            if (invDate.getFullYear() === currentYear) {
                const month = invDate.getMonth();
                monthlyRev[month] += amount;

                if (month === currentMonth) {
                    currentMonthRevenue += amount;
                }
                if (month === currentMonth - 1) {
                    lastMonthRevenue += amount;
                }
            }
        });

        // Growth rate
        let growth = 0;
        if (lastMonthRevenue > 0) {
            growth = ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
        } else if (currentMonthRevenue > 0) {
            growth = 100;
        }

        const count = invoices.length;

        this.stats = {
            totalInvoices: count,
            pendingInvoices: pendingCount,
            paidInvoices: paidCount,
            totalRevenue: totalPaidRevenue,
            totalBilled: totalBilledSum,
            pendingRevenue: pendingRevenueSum,
            avgInvoiceValue: count > 0 ? totalBilledSum / count : 0,
            proformaCount: proformaCnt,
            monthlyGrowth: Math.round(growth * 10) / 10
        };

        this.statusCounts = {
            paid: paidCount,
            pending: pendingCount,
            overdue: overdueCount,
            draft: draftCount,
            cancelled: cancelledCount
        };

        this.monthlyRevenueData = monthlyRev;

        // Top Customers
        this.topCustomers = Object.keys(customerMap)
            .map(name => ({
                name,
                invoiceCount: customerMap[name].count,
                totalAmount: customerMap[name].total
            }))
            .sort((a, b) => b.totalAmount - a.totalAmount)
            .slice(0, 4);

        // Recent 5 invoices
        this.recentInvoices = invoices.slice(0, 5).map(inv => ({
            id: inv.id || '',
            invoiceNo: inv.invoiceNo,
            customerName: inv.customerName,
            amount: inv.total || 0,
            status: inv.status || 'draft',
            invoiceType: inv.invoiceType || 'commercial',
            date: inv.date
        }));
    }

    private updateCharts() {
        if (this.revenueChart) {
            this.revenueChart.data.datasets[0].data = [...this.monthlyRevenueData];
            this.revenueChart.update();
        }
        if (this.statusChart) {
            this.statusChart.data.datasets[0].data = [
                this.statusCounts.paid,
                this.statusCounts.pending,
                this.statusCounts.overdue
            ];
            this.statusChart.update();
        }
    }

    private initRevenueChart() {
        if (!this.revenueChartRef?.nativeElement) return;

        const ctx = this.revenueChartRef.nativeElement.getContext('2d');
        if (!ctx) return;

        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');

        this.revenueChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
                datasets: [{
                    label: 'Kesilen Ciro (₺)',
                    data: [...this.monthlyRevenueData],
                    borderColor: '#3b82f6',
                    backgroundColor: gradient,
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#3b82f6',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 3,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: '#1e293b',
                        titleFont: { size: 13, weight: 'bold' },
                        bodyFont: { size: 12 },
                        padding: 12,
                        cornerRadius: 8,
                        callbacks: {
                            label: (ctx) => `₺${Number(ctx.raw).toLocaleString('tr-TR')}`
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { color: '#94a3b8', font: { size: 11 } }
                    },
                    y: {
                        grid: { color: '#f1f5f9' },
                        ticks: {
                            color: '#94a3b8',
                            font: { size: 11 },
                            callback: (value) => `₺${Number(value).toLocaleString('tr-TR')}`
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }

    private initStatusChart() {
        if (!this.statusChartRef?.nativeElement) return;

        const ctx = this.statusChartRef.nativeElement.getContext('2d');
        if (!ctx) return;

        this.statusChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Ödendi', 'Bekliyor', 'Gecikmiş'],
                datasets: [{
                    data: [
                        this.statusCounts.paid,
                        this.statusCounts.pending,
                        this.statusCounts.overdue
                    ],
                    backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
                    borderWidth: 0,
                    hoverOffset: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 16,
                            usePointStyle: true,
                            pointStyle: 'circle',
                            font: { size: 12 }
                        }
                    },
                    tooltip: {
                        backgroundColor: '#1e293b',
                        padding: 12,
                        cornerRadius: 8
                    }
                }
            }
        });
    }

    getStatusClass(status: string): string {
        const classes: Record<string, string> = {
            'paid': 'bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400',
            'pending': 'bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400',
            'sent': 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400',
            'overdue': 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400',
            'draft': 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
            'cancelled': 'bg-gray-100 dark:bg-gray-800 text-gray-500'
        };
        return classes[status] || 'bg-slate-100 text-slate-700';
    }

    getStatusText(status: string): string {
        const texts: Record<string, string> = {
            'paid': 'Ödendi',
            'pending': 'Bekliyor',
            'sent': 'Gönderildi',
            'overdue': 'Gecikmiş',
            'draft': 'Taslak',
            'cancelled': 'İptal'
        };
        return texts[status] || status;
    }
}
