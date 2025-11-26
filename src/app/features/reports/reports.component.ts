import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent } from '../../shared/components/card/card.component';
import { ButtonComponent } from '../../shared/components/button/button.component';

@Component({
    selector: 'app-reports',
    standalone: true,
    imports: [CommonModule, CardComponent, ButtonComponent],
    templateUrl: './reports.component.html',
    styleUrl: './reports.component.css'
})
export class ReportsComponent {
    // Mock data for the chart
    monthlySales = [
        { month: 'Oca', value: 30 },
        { month: 'Şub', value: 45 },
        { month: 'Mar', value: 35 },
        { month: 'Nis', value: 60 },
        { month: 'May', value: 50 },
        { month: 'Haz', value: 75 },
        { month: 'Tem', value: 65 },
        { month: 'Ağu', value: 80 },
        { month: 'Eyl', value: 70 },
        { month: 'Eki', value: 85 },
        { month: 'Kas', value: 90 },
        { month: 'Ara', value: 100 },
    ];

    recentTransactions = [
        { id: 'INV-2023-088', customer: 'Teknoloji A.Ş.', date: '28 Aralık 2023', status: 'Ödendi', amount: '₺15,200.00', statusClass: 'bg-green-100 text-green-800' },
        { id: 'INV-2023-087', customer: 'Yazılım Çözümleri Ltd.', date: '26 Aralık 2023', status: 'Ödendi', amount: '₺8,750.50', statusClass: 'bg-green-100 text-green-800' },
        { id: 'INV-2023-086', customer: 'Global Lojistik', date: '22 Aralık 2023', status: 'Beklemede', amount: '₺32,000.00', statusClass: 'bg-yellow-100 text-yellow-800' },
        { id: 'INV-2023-085', customer: 'Danışmanlık Hizmetleri', date: '15 Aralık 2023', status: 'Gecikmiş', amount: '₺5,500.00', statusClass: 'bg-red-100 text-red-800' },
    ];
}
