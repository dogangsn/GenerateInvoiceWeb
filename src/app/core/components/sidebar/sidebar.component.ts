import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
    private authService = inject(AuthService);
    lang = inject(LanguageService);

    menuItems = [
        { id: 'dashboard', icon: 'dashboard', labelKey: 'sidebar.dashboard', route: '/dashboard' },
        { id: 'invoices', icon: 'description', labelKey: 'sidebar.invoices', route: '/invoices' },
        { id: 'create-invoice', icon: 'add_circle', labelKey: 'sidebar.createInvoice', route: '/create-invoice' },
        { id: 'customers', icon: 'group', labelKey: 'sidebar.customers', route: '/customers' },
        { id: 'reports', icon: 'bar_chart', labelKey: 'sidebar.reports', route: '/reports' },
        { id: 'settings', icon: 'settings', labelKey: 'sidebar.settings', route: '/settings' },
    ];

    async logout() {
        await this.authService.logout();
    }
}
