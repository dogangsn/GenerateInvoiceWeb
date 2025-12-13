import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { InvoiceService } from '../../core/services/invoice.service';
import { Invoice } from '../../core/models/invoice.model';
import { ButtonComponent } from '../../shared/components/button/button.component';
import { Observable, of } from 'rxjs';

@Component({
    selector: 'app-invoice-list',
    standalone: true,
    imports: [CommonModule, ButtonComponent],
    templateUrl: './invoice-list.component.html',
    styleUrl: './invoice-list.component.css'
})
export class InvoiceListComponent implements OnInit {
    private invoiceService = inject(InvoiceService);
    private router = inject(Router);
    private platformId = inject(PLATFORM_ID);

    invoices$: Observable<Invoice[]> = of([]);
    isLoading = true;

    ngOnInit(): void {
        if (isPlatformBrowser(this.platformId)) {
            this.invoices$ = this.invoiceService.getInvoices();
            this.invoices$.subscribe({
                next: () => this.isLoading = false,
                error: (err) => {
                    console.error('Fatura yükleme hatası:', err);
                    this.isLoading = false;
                }
            });
        } else {
            this.isLoading = false;
        }
    }

    getStatusColor(status: string): string {
        switch (status) {
            case 'Draft': return 'bg-yellow-100 text-yellow-800';
            case 'Paid': return 'bg-green-100 text-green-800';
            case 'Sent': return 'bg-blue-100 text-blue-800';
            case 'Printed': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }

    getStatusText(status: string): string {
        switch (status) {
            case 'Draft': return 'Taslak';
            case 'Paid': return 'Ödendi';
            case 'Sent': return 'Gönderildi';
            case 'Printed': return 'Yazdırıldı';
            default: return status;
        }
    }

    async deleteInvoice(invoice: Invoice) {
        if (confirm(`"${invoice.customerName}" faturasını silmek istediğinize emin misiniz?`)) {
            try {
                await this.invoiceService.deleteInvoice(invoice.id!);
            } catch (error) {
                console.error('Silme hatası:', error);
                alert('Fatura silinemedi.');
            }
        }
    }

    createNewInvoice() {
        this.router.navigate(['/']);
    }
}
