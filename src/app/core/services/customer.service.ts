import { Injectable, inject, PLATFORM_ID, Injector } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Firestore, collection, collectionData, doc, addDoc, updateDoc, deleteDoc, getDoc, getDocs, query, where, serverTimestamp, onSnapshot } from '@angular/fire/firestore';
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
        if (!isPlatformBrowser(this.platformId) || !this.firestore || !this.auth) {
            return of([]);
        }

        const auth = this.auth;
        const firestore = this.firestore;

        return from(auth.authStateReady()).pipe(
            switchMap(() => {
                const userId = auth.currentUser?.uid;
                if (!userId) {
                    return of([]);
                }

                return new Observable<Customer[]>(subscriber => {
                    const customersCol = collection(firestore, 'customers');
                    const q = query(customersCol, where('userId', '==', userId));

                    const unsubscribe = onSnapshot(q, (snapshot) => {
                        const customers: Customer[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Customer);
                        customers.sort((a, b) => {
                            const timeA = this.parseDateToTime(a.createdAt);
                            const timeB = this.parseDateToTime(b.createdAt);
                            return timeB - timeA;
                        });
                        subscriber.next(customers);
                    }, (error) => {
                        console.error('Müşteriler dinlenirken hata:', error);
                        subscriber.error(error);
                    });

                    return () => unsubscribe();
                });
            })
        );
    }

    private parseDateToTime(val: any): number {
        if (!val) return 0;
        if (typeof val.toDate === 'function') return val.toDate().getTime();
        if (typeof val.seconds === 'number') return val.seconds * 1000;
        const d = new Date(val);
        return isNaN(d.getTime()) ? 0 : d.getTime();
    }

    /**
     * Tek bir müşteriyi getirir
     */
    async getCustomer(id: string): Promise<Customer | null> {
        if (!isPlatformBrowser(this.platformId) || !this.firestore) return null;

        const customerRef = doc(this.firestore, 'customers', id);
        const customerSnap = await getDoc(customerRef);

        if (customerSnap.exists()) {
            return { id: customerSnap.id, ...customerSnap.data() } as Customer;
        }
        return null;
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

        const customerData = this.removeUndefinedFields({
            ...data,
            userId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        const docRef = await addDoc(customersCol, customerData);
        return docRef.id;
    }

    /**
     * Müşteri bilgilerini günceller
     */
    async updateCustomer(id: string, data: Partial<CustomerFormData>): Promise<void> {
        if (!isPlatformBrowser(this.platformId) || !this.firestore) return;

        const cleaned = this.removeUndefinedFields({
            ...data,
            updatedAt: serverTimestamp()
        });

        const customerRef = doc(this.firestore, 'customers', id);
        await updateDoc(customerRef, cleaned);
    }

    private removeUndefinedFields(obj: any): any {
        if (obj === null || obj === undefined) return null;
        if (typeof obj !== 'object') return obj;
        if (Array.isArray(obj)) return obj.map(item => this.removeUndefinedFields(item));

        const result: any = {};
        for (const key of Object.keys(obj)) {
            if (obj[key] !== undefined) {
                result[key] = this.removeUndefinedFields(obj[key]);
            }
        }
        return result;
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
