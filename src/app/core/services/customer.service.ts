import { Injectable, inject, PLATFORM_ID, Injector } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Firestore, collection, collectionData, doc, addDoc, updateDoc, deleteDoc, query, where, serverTimestamp } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Customer, CustomerFormData } from '../models/customer.model';
import { Observable, map, of, from, switchMap } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class CustomerService {
    private platformId = inject(PLATFORM_ID);
    private injector = inject(Injector);
    
    // Lazy injection - sadece browser'da kullanılacak
    private _firestore: Firestore | null = null;
    private _auth: Auth | null = null;

    private get firestore(): Firestore | null {
        if (!isPlatformBrowser(this.platformId)) return null;
        if (!this._firestore) {
            this._firestore = this.injector.get(Firestore);
        }
        return this._firestore;
    }

    private get auth(): Auth | null {
        if (!isPlatformBrowser(this.platformId)) return null;
        if (!this._auth) {
            this._auth = this.injector.get(Auth);
        }
        return this._auth;
    }

    /**
     * Kullanıcının müşterilerini gerçek zamanlı olarak getirir
     */
    getCustomers(): Observable<Customer[]> {
        // SSR'da boş döndür
        if (!isPlatformBrowser(this.platformId) || !this.firestore || !this.auth) {
            return of([]);
        }

        const auth = this.auth;
        const firestore = this.firestore;

        // Auth state hazır olana kadar bekle
        return from(auth.authStateReady()).pipe(
            switchMap(() => {
                const userId = auth.currentUser?.uid;
                if (!userId) {
                    return of([]);
                }

                const customersCol = collection(firestore, 'customers');
                const q = query(customersCol, where('userId', '==', userId));

                return collectionData(q, { idField: 'id' }).pipe(
                    map(customers => {
                        // Client-side sıralama (en yeni önce)
                        return (customers as Customer[]).sort((a, b) => {
                            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                            return dateB - dateA;
                        });
                    })
                );
            })
        );
    }

    /**
     * Yeni müşteri ekler
     */
    async addCustomer(data: CustomerFormData): Promise<string> {
        if (!isPlatformBrowser(this.platformId) || !this.firestore || !this.auth) {
            throw new Error('Bu işlem sadece tarayıcıda yapılabilir');
        }

        await this.auth.authStateReady();
        const userId = this.auth.currentUser?.uid;
        if (!userId) throw new Error('Kullanıcı giriş yapmamış');

        const customersCol = collection(this.firestore, 'customers');

        const customerData = {
            ...data,
            userId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        const docRef = await addDoc(customersCol, customerData);
        return docRef.id;
    }

    /**
     * Müşteri bilgilerini günceller
     */
    async updateCustomer(id: string, data: Partial<CustomerFormData>): Promise<void> {
        if (!isPlatformBrowser(this.platformId) || !this.firestore) return;

        const customerRef = doc(this.firestore, 'customers', id);
        await updateDoc(customerRef, {
            ...data,
            updatedAt: serverTimestamp()
        });
    }

    /**
     * Müşteri siler
     */
    async deleteCustomer(id: string): Promise<void> {
        if (!isPlatformBrowser(this.platformId) || !this.firestore) return;

        const customerRef = doc(this.firestore, 'customers', id);
        await deleteDoc(customerRef);
    }

    /**
     * Birden fazla müşteri siler
     */
    async deleteCustomers(ids: string[]): Promise<void> {
        if (!isPlatformBrowser(this.platformId) || !this.firestore) return;

        const deletePromises = ids.map(id => this.deleteCustomer(id));
        await Promise.all(deletePromises);
    }
}
