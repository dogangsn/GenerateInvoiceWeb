import { Injectable } from '@angular/core';
import { Invoice } from '../models/invoice.model';
import { Observable, of } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class InvoiceService {
    private invoices: Invoice[] = [
        {
            id: '1',
            number: 'INV-001',
            date: '2024-04-18',
            dueDate: '2024-05-02',
            customerName: 'ABC Firması',
            customerTaxId: '1234567890',
            customerAddress: 'Istanbul, Turkey',
            items: [],
            status: 'Draft',
            tags: ['Önemli', 'ABC Firması']
        },
        {
            id: '2',
            number: 'INV-002',
            date: '2024-04-17',
            dueDate: '2024-05-01',
            customerName: 'XYZ Ltd.',
            customerTaxId: '9876543210',
            customerAddress: 'Ankara, Turkey',
            items: [],
            status: 'Draft',
            tags: ['XYZ Ltd.']
        }
    ];

    getInvoices(): Observable<Invoice[]> {
        return of(this.invoices);
    }

    getInvoice(id: string): Observable<Invoice | undefined> {
        return of(this.invoices.find(i => i.id === id));
    }

    createInvoice(invoice: Invoice): Observable<Invoice> {
        this.invoices.push(invoice);
        return of(invoice);
    }

    deleteInvoice(id: string): Observable<boolean> {
        this.invoices = this.invoices.filter(i => i.id !== id);
        return of(true);
    }
}
