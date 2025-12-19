import { Component, inject, OnInit, AfterViewInit, ElementRef, ViewChild, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Chart, registerables } from 'chart.js';
import { User } from '@angular/fire/auth';

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
    status: 'paid' | 'pending' | 'overdue';
    date: Date;
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
    private platformId = inject(PLATFORM_ID);

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
        this.loadDemoData();
    }

    logout() {
        this.authService.logout();
    }

    ngAfterViewInit() {
        if (isPlatformBrowser(this.platformId)) {
            setTimeout(() => {
                this.initRevenueChart();
                this.initStatusChart();
            }, 100);
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
                    data: [18500, 22000, 19800, 28500, 32000, 27500, 35000, 38200, 42000, 39500, 45000, 47850],
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
                    data: [18, 5, 1],
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

    private loadDemoData() {
        this.stats = {
            totalInvoices: 24,
            pendingInvoices: 5,
            paidInvoices: 18,
            totalRevenue: 47850,
            monthlyGrowth: 12.5
        };

        this.recentInvoices = [
            { id: '1', invoiceNo: 'INV-2024-001', customerName: 'ABC Teknoloji Ltd.', amount: 12500, status: 'paid', date: new Date() },
            { id: '2', invoiceNo: 'INV-2024-002', customerName: 'XYZ Danışmanlık', amount: 8750, status: 'pending', date: new Date() },
            { id: '3', invoiceNo: 'INV-2024-003', customerName: 'Demo Şirketi A.Ş.', amount: 15200, status: 'paid', date: new Date() },
            { id: '4', invoiceNo: 'INV-2024-004', customerName: 'Test Firması', amount: 3400, status: 'overdue', date: new Date() },
        ];
    }

    getStatusClass(status: string): string {
        const classes: Record<string, string> = {
            'paid': 'bg-green-100 text-green-700',
            'pending': 'bg-orange-100 text-orange-700',
            'overdue': 'bg-red-100 text-red-700'
        };
        return classes[status] || 'bg-slate-100 text-slate-700';
    }

    getStatusText(status: string): string {
        const texts: Record<string, string> = {
            'paid': 'Ödendi',
            'pending': 'Bekliyor',
            'overdue': 'Gecikmiş'
        };
        return texts[status] || status;
    }
}
