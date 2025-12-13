import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Firestore, collection, addDoc, updateDoc, deleteDoc, doc, query, where, onSnapshot, getDoc, serverTimestamp } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Customer } from '../models/customer.model';
import { Observable, of, BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class CustomerService {
    private firestore = inject(Firestore);
    private auth = inject(Auth);
    private platformId = inject(PLATFORM_ID);

    private customersSubject = new BehaviorSubject<Customer[]>([]);

    /**
     * Kullanıcının tüm müşterilerini getirir (realtime)
     */
    getCustomers(): Observable<Customer[]> {
        if (!isPlatformBrowser(this.platformId)) {
            return of([]);
        }

        const userId = this.auth.currentUser?.uid;
        if (!userId) return of([]);

        const customersRef = collection(this.firestore, 'customers');
        const q = query(customersRef, where('userId', '==', userId));

        onSnapshot(q, (snapshot) => {
            const customers: Customer[] = [];
            snapshot.forEach((doc) => {
                customers.push({ id: doc.id, ...doc.data() } as Customer);
            });
            // İsme göre sırala
            customers.sort((a, b) => a.name.localeCompare(b.name));
            this.customersSubject.next(customers);
        }, (error) => {
            console.error('Firestore customer listener error:', error);
        });

        return this.customersSubject.asObservable();
    }

    /**
     * Tek bir müşteriyi getirir
     */
    async getCustomer(id: string): Promise<Customer | null> {
        if (!isPlatformBrowser(this.platformId)) return null;

        const customerRef = doc(this.firestore, 'customers', id);
        const snapshot = await getDoc(customerRef);

        if (snapshot.exists()) {
            return { id: snapshot.id, ...snapshot.data() } as Customer;
        }
        return null;
    }

    /**
     * Yeni müşteri oluşturur
     */
    async createCustomer(customerData: Partial<Customer>): Promise<string> {
        const userId = this.auth.currentUser?.uid;
        if (!userId) throw new Error('Kullanıcı girişi yapılmamış');

        const customersRef = collection(this.firestore, 'customers');

        const customer = {
            ...customerData,
            userId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        const docRef = await addDoc(customersRef, customer);
        return docRef.id;
    }

    /**
     * Müşteriyi günceller
     */
    async updateCustomer(id: string, data: Partial<Customer>): Promise<void> {
        const customerRef = doc(this.firestore, 'customers', id);
        await updateDoc(customerRef, {
            ...data,
            updatedAt: serverTimestamp()
        });
    }

    /**
     * Müşteriyi siler
     */
    async deleteCustomer(id: string): Promise<void> {
        const customerRef = doc(this.firestore, 'customers', id);
        await deleteDoc(customerRef);
    }
}
