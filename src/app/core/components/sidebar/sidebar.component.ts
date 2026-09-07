import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LanguageService } from '../../services/language.service';
import { ThemeService } from '../../services/theme.service';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
    @Input() isOpen = false;
    @Output() closeMobileMenu = new EventEmitter<void>();

    private authService = inject(AuthService);
    lang = inject(LanguageService);
    themeService = inject(ThemeService);

    menuItems = [
        { id: 'dashboard', icon: 'dashboard', labelKey: 'sidebar.dashboard', route: '/dashboard', isAi: false },
        { id: 'ai-assistant', icon: 'smart_toy', labelKey: 'sidebar.aiAssistant', route: '/ai-assistant', isAi: true },
        { id: 'invoices', icon: 'description', labelKey: 'sidebar.invoices', route: '/invoices', isAi: false },
        { id: 'expenses', icon: 'payments', labelKey: 'sidebar.expenses', route: '/expenses', isAi: false },
        { id: 'customers', icon: 'account_balance_wallet', labelKey: 'sidebar.customers', route: '/customers', isAi: false },
        { id: 'reports', icon: 'bar_chart', labelKey: 'sidebar.reports', route: '/reports', isAi: false },
        { id: 'pricing', icon: 'workspace_premium', labelKey: 'sidebar.pricing', route: '/pricing', isAi: false },
        { id: 'settings', icon: 'settings', labelKey: 'sidebar.settings', route: '/settings', isAi: false },
    ];

    async logout() {
        await this.authService.logout();
    }
}

