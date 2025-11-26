import { Injectable } from '@angular/core';
import { Customer } from '../models/customer.model';
import { Observable, of } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class CustomerService {
    private customers: Customer[] = [
        { id: '1', name: 'Teknoloji A.Ş.', email: 'iletisim@teknoloji.com', phone: '+90 212 123 4567', country: 'Türkiye' },
        { id: '2', name: 'Yazılım Çözümleri Ltd.', email: 'destek@yazilim.co.uk', phone: '+44 20 7946 0958', country: 'Birleşik Krallık' },
        { id: '3', name: 'Global Lojistik', email: 'info@globallojistik.de', phone: '+49 30 12345678', country: 'Almanya' },
        { id: '4', name: 'Danışmanlık Hizmetleri', email: 'contact@consulting.com', phone: '+1 212 555 0123', country: 'ABD' },
        { id: '5', name: 'Creative Solutions', email: 'hello@creative.fr', phone: '+33 1 23 45 67 89', country: 'Fransa' },
    ];

    getCustomers(): Observable<Customer[]> {
        return of(this.customers);
    }

    deleteCustomer(id: string): Observable<boolean> {
        this.customers = this.customers.filter(c => c.id !== id);
        return of(true);
    }
}
