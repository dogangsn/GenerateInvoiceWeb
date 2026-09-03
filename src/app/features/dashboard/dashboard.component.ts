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
    monthlyGrowth: number;
}

interface RecentInvoice {
    id: string;
    invoiceNo: string;
    customerName: string;
    amount: number;
    status: string;
    date: Date | string;
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
        monthlyGrowth: 0
    };

    recentInvoices: RecentInvoice[] = [];
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
        let totalRevenue = 0;
        let pending = 0;
        let paid = 0;
        let overdue = 0;
        let draft = 0;
        let cancelled = 0;

        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();
        
        const monthlyRev = new Array(12).fill(0);
        let currentMonthRevenue = 0;
        let lastMonthRevenue = 0;

        invoices.forEach(inv => {
            const status = inv.status || 'draft';
            if (status === 'paid') paid++;
            else if (status === 'pending' || status === 'sent') pending++;
            else if (status === 'overdue') overdue++;
            else if (status === 'draft') draft++;
            else if (status === 'cancelled') cancelled++;

            const amount = inv.total || 0;
            if (status === 'paid') {
                totalRevenue += amount;
            }

            // Date processing for monthly chart
            const invDate = inv.date ? new Date(inv.date) : new Date();
            if (invDate.getFullYear() === currentYear) {
                const month = invDate.getMonth();
                if (status === 'paid') {
                    monthlyRev[month] += amount;
                }
                if (month === currentMonth && status === 'paid') {
                    currentMonthRevenue += amount;
                }
                if (month === currentMonth - 1 && status === 'paid') {
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

        this.stats = {
            totalInvoices: invoices.length,
            pendingInvoices: pending,
            paidInvoices: paid,
            totalRevenue,
            monthlyGrowth: Math.round(growth * 10) / 10
        };

        this.statusCounts = { paid, pending, overdue, draft, cancelled };
        this.monthlyRevenueData = monthlyRev;

        // Recent 5 invoices
        this.recentInvoices = invoices.slice(0, 5).map(inv => ({
            id: inv.id || '',
            invoiceNo: inv.invoiceNo,
            customerName: inv.customerName,
            amount: inv.total || 0,
            status: inv.status || 'draft',
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
                    label: 'Gelir (₺)',
                    data: [...this.monthlyRevenueData],
                    borderColor: '#3b82f6',
                    backgroundColor: gradient,
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#3b82f6',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 0,
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
            'paid': 'bg-green-100 text-green-700',
            'pending': 'bg-orange-100 text-orange-700',
            'overdue': 'bg-red-100 text-red-700',
            'draft': 'bg-slate-100 text-slate-700',
            'cancelled': 'bg-gray-100 text-gray-500'
        };
        return classes[status] || 'bg-slate-100 text-slate-700';
    }

    getStatusText(status: string): string {
        const texts: Record<string, string> = {
            'paid': 'Ödendi',
            'pending': 'Bekliyor',
            'overdue': 'Gecikmiş',
            'draft': 'Taslak',
            'cancelled': 'İptal'
        };
        return texts[status] || status;
    }
}
