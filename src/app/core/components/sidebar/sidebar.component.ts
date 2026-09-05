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
        { id: 'dashboard', icon: 'dashboard', labelKey: 'sidebar.dashboard', route: '/dashboard' },
        { id: 'invoices', icon: 'description', labelKey: 'sidebar.invoices', route: '/invoices' },
        { id: 'customers', icon: 'group', labelKey: 'sidebar.customers', route: '/customers' },
        { id: 'reports', icon: 'bar_chart', labelKey: 'sidebar.reports', route: '/reports' },
        { id: 'pricing', icon: 'workspace_premium', labelKey: 'sidebar.pricing', route: '/pricing' },
        { id: 'settings', icon: 'settings', labelKey: 'sidebar.settings', route: '/settings' },
    ];

    async logout() {
        await this.authService.logout();
    }
}

