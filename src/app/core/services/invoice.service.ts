import { Injectable, inject, PLATFORM_ID, Injector } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Firestore, collection, collectionData, doc, addDoc, updateDoc, deleteDoc, getDoc, query, where, serverTimestamp } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Invoice, InvoiceFormData, InvoiceItem } from '../models/invoice.model';
import { Observable, map, of, from, switchMap } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class InvoiceService {
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
     * Kullanıcının faturalarını gerçek zamanlı olarak getirir
     */
    getInvoices(): Observable<Invoice[]> {
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

                const invoicesCol = collection(firestore, 'invoices');
                const q = query(invoicesCol, where('userId', '==', userId));

                return collectionData(q, { idField: 'id' }).pipe(
                    map(invoices => {
                        return (invoices as Invoice[]).sort((a, b) => {
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
     * Tek bir faturayı getirir
     */
    async getInvoice(id: string): Promise<Invoice | null> {
        if (!isPlatformBrowser(this.platformId) || !this.firestore) return null;

        const invoiceRef = doc(this.firestore, 'invoices', id);
        const invoiceSnap = await getDoc(invoiceRef);
        
        if (invoiceSnap.exists()) {
            return { id: invoiceSnap.id, ...invoiceSnap.data() } as Invoice;
        }
        return null;
    }

    /**
     * Yeni fatura oluşturur
     */
    async createInvoice(data: InvoiceFormData): Promise<string> {
        if (!isPlatformBrowser(this.platformId) || !this.firestore || !this.auth) {
            throw new Error('Bu işlem sadece tarayıcıda yapılabilir');
        }

        await this.auth.authStateReady();
        const userId = this.auth.currentUser?.uid;
        if (!userId) throw new Error('Kullanıcı giriş yapmamış');

        const { subtotal, taxTotal, total } = this.calculateTotals(data.items);
        const invoicesCol = collection(this.firestore, 'invoices');

        const invoiceData = {
            ...data,
            subtotal,
            taxTotal,
            total,
            userId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        const docRef = await addDoc(invoicesCol, invoiceData);
        return docRef.id;
    }

    /**
     * Fatura günceller
     */
    async updateInvoice(id: string, data: Partial<InvoiceFormData>): Promise<void> {
        if (!isPlatformBrowser(this.platformId) || !this.firestore) return;

        const updateData: any = {
            ...data,
            updatedAt: serverTimestamp()
        };

        // Eğer items güncelleniyorsa toplamları yeniden hesapla
        if (data.items) {
            const { subtotal, taxTotal, total } = this.calculateTotals(data.items);
            updateData.subtotal = subtotal;
            updateData.taxTotal = taxTotal;
            updateData.total = total;
        }

        const invoiceRef = doc(this.firestore, 'invoices', id);
        await updateDoc(invoiceRef, updateData);
    }

    /**
     * Fatura durumunu günceller
     */
    async updateInvoiceStatus(id: string, status: Invoice['status']): Promise<void> {
        if (!isPlatformBrowser(this.platformId) || !this.firestore) return;

        const invoiceRef = doc(this.firestore, 'invoices', id);
        await updateDoc(invoiceRef, {
            status,
            updatedAt: serverTimestamp()
        });
    }

    /**
     * Fatura siler
     */
    async deleteInvoice(id: string): Promise<void> {
        if (!isPlatformBrowser(this.platformId) || !this.firestore) return;

        const invoiceRef = doc(this.firestore, 'invoices', id);
        await deleteDoc(invoiceRef);
    }

    /**
     * Birden fazla fatura siler
     */
    async deleteInvoices(ids: string[]): Promise<void> {
        if (!isPlatformBrowser(this.platformId) || !this.firestore) return;

        const deletePromises = ids.map(id => this.deleteInvoice(id));
        await Promise.all(deletePromises);
    }

    /**
     * Yeni fatura numarası üretir
     */
    generateInvoiceNumber(): string {
        const year = new Date().getFullYear();
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `INV-${year}-${random}`;
    }

    /**
     * Fatura kalemlerinden toplamları hesaplar
     */
    private calculateTotals(items: InvoiceItem[]): { subtotal: number; taxTotal: number; total: number } {
        let subtotal = 0;
        let taxTotal = 0;

        items.forEach(item => {
            const itemSubtotal = item.quantity * item.unitPrice;
            const itemTax = itemSubtotal * (item.taxRate / 100);
            subtotal += itemSubtotal;
            taxTotal += itemTax;
        });

        return {
            subtotal,
            taxTotal,
            total: subtotal + taxTotal
        };
    }
}
