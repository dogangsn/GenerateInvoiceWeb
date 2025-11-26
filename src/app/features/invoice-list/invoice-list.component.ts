import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoiceService } from '../../core/services/invoice.service';
import { Invoice } from '../../core/models/invoice.model';
import { ButtonComponent } from '../../shared/components/button/button.component';


@Component({
    selector: 'app-invoice-list',
    standalone: true,
    imports: [CommonModule, ButtonComponent],
    templateUrl: './invoice-list.component.html',
    styleUrl: './invoice-list.component.css'
})
export class InvoiceListComponent implements OnInit {
    invoices: Invoice[] = [];

    constructor(private invoiceService: InvoiceService) { }

    ngOnInit(): void {
        this.invoiceService.getInvoices().subscribe(data => {
            this.invoices = data;
        });
    }

    getStatusColor(status: string): string {
        switch (status) {
            case 'Draft': return 'bg-yellow-100 text-yellow-800';
            case 'Paid': return 'bg-green-100 text-green-800';
            case 'Sent': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }
}
