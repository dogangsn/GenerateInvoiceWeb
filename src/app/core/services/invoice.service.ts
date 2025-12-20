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

        const { subtotal, taxTotal, total } = this.calculateTotals(data);
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
        // Partial data geldiği için tam hesaplama için mevcut veriye ihtiyaç olabilir ama 
        // şimdilik data içinde gerekli alanların olduğunu varsayıyoruz veya
        // kullanıcıdan tam form datası gelmesi beklenir.
        if (data.items) {
            // Type assertion for Partial<InvoiceFormData> to InvoiceFormData for calculation
            // safe assumption if the logic guarantees items+rates are passed together or defaults strictly handled
            const { subtotal, taxTotal, total } = this.calculateTotals(data as InvoiceFormData);
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
     * Toplamları hesaplar
     */
    private calculateTotals(data: InvoiceFormData): { subtotal: number; taxTotal: number; total: number } {
        let subtotal = 0;
        let totalDiscount = 0;
        const items = data.items || [];

        // 1. Calculate Gross Subtotal & Discount
        items.forEach(item => {
            const quantity = item.quantity || 0;
            const unitPrice = item.unitPrice || 0;
            const gross = quantity * unitPrice;
            const discount = gross * ((item.discount || 0) / 100);

            subtotal += gross;
            totalDiscount += discount;
        });

        const netSubtotal = subtotal - totalDiscount;

        // 2. Calculate Main Tax
        const taxRate = data.taxRate || 0;
        const mainTax = netSubtotal * (taxRate / 100);

        // 3. Calculate Additional Taxes
        let additionalTaxTotal = 0;
        if (data.additionalTaxes) {
            data.additionalTaxes.forEach(tax => {
                additionalTaxTotal += netSubtotal * ((tax.rate || 0) / 100);
            });
        }

        const taxTotal = mainTax + additionalTaxTotal;
        const total = netSubtotal + taxTotal;

        return {
            subtotal, // Gross subtotal stored
            taxTotal, // Total tax (Main + Additional)
            total
        };
    }
}
