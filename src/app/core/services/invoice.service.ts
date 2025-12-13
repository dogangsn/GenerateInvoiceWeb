import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Firestore, collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs, getDoc, onSnapshot, serverTimestamp } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Invoice } from '../models/invoice.model';
import { Observable, of, BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class InvoiceService {
    private firestore = inject(Firestore);
    private auth = inject(Auth);
    private platformId = inject(PLATFORM_ID);
    
    private invoicesSubject = new BehaviorSubject<Invoice[]>([]);

    /**
     * Kullanıcının tüm faturalarını getirir (realtime)
     */
    getInvoices(): Observable<Invoice[]> {
        // SSR'de boş döndür
        if (!isPlatformBrowser(this.platformId)) {
            return of([]);
        }

        const userId = this.auth.currentUser?.uid;
        if (!userId) return of([]);

        const invoicesRef = collection(this.firestore, 'invoices');
        const q = query(invoicesRef, where('userId', '==', userId));

        // Realtime listener
        onSnapshot(q, (snapshot) => {
            const invoices: Invoice[] = [];
            snapshot.forEach((doc) => {
                invoices.push({ id: doc.id, ...doc.data() } as Invoice);
            });
            // Tarihe göre sırala (yeniden eskiye)
            invoices.sort((a, b) => {
                const dateA = a.date || '';
                const dateB = b.date || '';
                return dateB.localeCompare(dateA);
            });
            this.invoicesSubject.next(invoices);
        }, (error) => {
            console.error('Firestore listener error:', error);
        });

        return this.invoicesSubject.asObservable();
    }

    /**
     * Tek bir faturayı getirir
     */
    async getInvoice(id: string): Promise<Invoice | null> {
        if (!isPlatformBrowser(this.platformId)) return null;
        
        const invoiceRef = doc(this.firestore, 'invoices', id);
        const snapshot = await getDoc(invoiceRef);
        
        if (snapshot.exists()) {
            return { id: snapshot.id, ...snapshot.data() } as Invoice;
        }
        return null;
    }

    /**
     * Yeni fatura oluşturur (taslak olarak)
     */
    async createInvoice(invoiceData: Partial<Invoice>): Promise<string> {
        const userId = this.auth.currentUser?.uid;
        if (!userId) throw new Error('Kullanıcı girişi yapılmamış');

        const invoicesRef = collection(this.firestore, 'invoices');
        
        // Fatura numarası oluştur
        const invoiceNumber = await this.generateInvoiceNumber(invoiceData.countryCode || 'TR');

        const invoice = {
            ...invoiceData,
            number: invoiceNumber,
            userId,
            status: invoiceData.status || 'Draft',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        const docRef = await addDoc(invoicesRef, invoice);
        return docRef.id;
    }

    /**
     * Faturayı günceller
     */
    async updateInvoice(id: string, data: Partial<Invoice>): Promise<void> {
        const invoiceRef = doc(this.firestore, 'invoices', id);
        await updateDoc(invoiceRef, {
            ...data,
            updatedAt: serverTimestamp()
        });
    }

    /**
     * Fatura durumunu günceller
     */
    async updateInvoiceStatus(id: string, status: Invoice['status']): Promise<void> {
        await this.updateInvoice(id, { status });
    }

    /**
     * Faturayı siler
     */
    async deleteInvoice(id: string): Promise<void> {
        const invoiceRef = doc(this.firestore, 'invoices', id);
        await deleteDoc(invoiceRef);
    }

    /**
     * Benzersiz fatura numarası oluşturur
     */
    private async generateInvoiceNumber(countryCode: string): Promise<string> {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `${countryCode}-${year}${month}-${random}`;
    }
}
