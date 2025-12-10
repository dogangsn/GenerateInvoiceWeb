import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { InvoiceListComponent } from './features/invoice-list/invoice-list.component';
import { CreateInvoiceComponent } from './features/create-invoice/create-invoice.component';
import { CountrySelectComponent } from './features/country-select/country-select.component';
import { LoginComponent } from './features/login/login.component';
import { MainLayoutComponent } from './core/layouts/main-layout/main-layout.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    // Public Routes (No Sidebar)
    { path: '', component: CountrySelectComponent },
    { path: 'login', component: LoginComponent },
    { path: 'create-invoice', component: CreateInvoiceComponent },

    // Private Routes (With Sidebar) - Protected by Auth Guard
    {
        path: '',
        component: MainLayoutComponent,
        canActivate: [authGuard],
        children: [
            { path: 'dashboard', component: DashboardComponent },
            { path: 'invoices', component: InvoiceListComponent },
            { path: 'customers', loadComponent: () => import('./features/customers/customer-list.component').then(m => m.CustomerListComponent) },
            { path: 'reports', loadComponent: () => import('./features/reports/reports.component').then(m => m.ReportsComponent) },
        ]
    },

    // Fallback
    { path: '**', redirectTo: '' }
];
