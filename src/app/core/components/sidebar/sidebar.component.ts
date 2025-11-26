import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
    menuItems = [
        { id: 'dashboard', icon: 'dashboard', label: 'Panel', route: '/dashboard' },
        { id: 'invoices', icon: 'description', label: 'Faturalar', route: '/invoices' },
        { id: 'create-invoice', icon: 'add_circle', label: 'Fatura Oluştur', route: '/create-invoice' },
        { id: 'customers', icon: 'group', label: 'Müşteriler', route: '/customers' },
        { id: 'reports', icon: 'bar_chart', label: 'Raporlar', route: '/reports' },
        { id: 'settings', icon: 'settings', label: 'Ayarlar', route: '/settings' },
    ];
}
