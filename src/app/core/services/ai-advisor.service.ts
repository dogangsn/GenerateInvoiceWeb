import { Injectable, inject } from '@angular/core';
import { InvoiceService } from './invoice.service';
import { ExpenseService } from './expense.service';
import { CustomerService } from './customer.service';
import { firstValueFrom } from 'rxjs';
import { Invoice } from '../models/invoice.model';
import { Expense } from '../models/expense.model';
import { Customer } from '../models/customer.model';

export interface FinancialHealthSummary {
    totalSalesVat: number;        // Hesaplanan KDV (391)
    totalExpenseVat: number;      // İndirilecek KDV (191)
    netVatPayable: number;        // Pozitif: Devlete Ödenecek KDV, Negatif: Sonraki Döneme Devreden KDV
    isVatRefund: boolean;         // Devreden KDV mi?
    overdueInvoicesCount: number; // Vadesi geçen fatura adedi
    overdueTotalAmount: number;   // Vadesi geçen toplam alacak tutarı
    upcomingInvoicesAmount: number;// Bu hafta vadesi dolacak alacak tutarı
    totalReceivables: number;     // Toplam açık alacak (ödenmemiş tüm faturalar)
    highRiskCustomersCount: number; // Yüksek riskli cari sayısı
    cashFlowForecast30Days: number;// 30 günlük tahmini net nakit akışı
    recommendations: string[];    // AI Tavsiyeleri
}

export interface AiChatMessage {
    id: string;
    sender: 'user' | 'assistant';
    text: string;
    timestamp: Date;
    suggestedActions?: { label: string; action: string }[];
}

@Injectable({
    providedIn: 'root'
})
export class AiAdvisorService {
    private invoiceService = inject(InvoiceService);
    private expenseService = inject(ExpenseService);
    private customerService = inject(CustomerService);

    /**
     * İşletmenin anlık KDV, vade, alacak ve cari risk sağlığını hesaplar
     */
    async calculateFinancialHealth(): Promise<FinancialHealthSummary> {
        const invoices = await firstValueFrom(this.invoiceService.getInvoices());
        const expenses = await firstValueFrom(this.expenseService.getExpenses());
        const customers = await firstValueFrom(this.customerService.getCustomers());

        const now = new Date();
        const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        const next30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        // KDV Hesaplamaları
        const totalSalesVat = invoices
            .filter(inv => inv.status !== 'cancelled')
            .reduce((sum, inv) => sum + (inv.taxTotal || 0), 0);

        const totalExpenseVat = expenses
            .reduce((sum, exp) => sum + (exp.taxAmount || 0), 0);

        const netVatDiff = totalSalesVat - totalExpenseVat;
        const isVatRefund = netVatDiff < 0;
        const netVatPayable = Math.abs(netVatDiff);

        // Vade Analizi
        let overdueCount = 0;
        let overdueAmount = 0;
        let upcomingAmount = 0;
        let totalReceivables = 0;

        invoices.forEach(inv => {
            if (inv.status !== 'paid' && inv.status !== 'cancelled') {
                const total = inv.total || 0;
                totalReceivables += total;

                const dueDate = inv.dueDate ? new Date(inv.dueDate) : new Date(inv.date);
                if (dueDate < now) {
                    overdueCount++;
                    overdueAmount += total;
                } else if (dueDate <= next7Days) {
                    upcomingAmount += total;
                }
            }
        });

        // Cari Risk Analizi
        let highRiskCount = 0;
        customers.forEach(c => {
            const customerInvoices = invoices.filter(i => i.customerId === c.id || i.customerName === c.name);
            const customerOverdue = customerInvoices
                .filter(i => i.status !== 'paid' && i.status !== 'cancelled' && new Date(i.dueDate || i.date) < now)
                .reduce((s, i) => s + (i.total || 0), 0);

            if (customerOverdue > 10000 || (c.balance && c.balance > 25000)) {
                highRiskCount++;
            }
        });

        // 30 Günlük Tahmini Nakit Akışı: 30 gün içinde vadesi gelen alacaklar - cari ay ortalama gideri
        const upcoming30DaysReceivables = invoices
            .filter(inv => inv.status !== 'paid' && inv.status !== 'cancelled' && new Date(inv.dueDate || inv.date) <= next30Days)
            .reduce((s, i) => s + (i.total || 0), 0);

        const monthlyExpenseAvg = expenses.reduce((s, e) => s + (e.amount || 0), 0);
        const cashFlowForecast30Days = upcoming30DaysReceivables - (monthlyExpenseAvg * 0.7);

        // Akıllı AI Tavsiyeleri
        const recommendations: string[] = [];

        if (isVatRefund) {
            recommendations.push(`💡 Bu dönem indirilecek KDV'niz hesaplanan KDV'den ₺${netVatPayable.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} fazla. Devlete vergi ödemesi çıkmıyor, sonraki aya devreden KDV hakkınız doğdu.`);
        } else if (netVatPayable > 0) {
            recommendations.push(`⚠️ Bu ay tahmini ₺${netVatPayable.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} KDV ödemeniz bulunmaktadır. Ay sonuna kadar olan gider fişlerinizi AI Tarayıcı ile sisteme girerek KDV matrahınızı optimize edebilirsiniz.`);
        }

        if (overdueAmount > 0) {
            recommendations.push(`🚨 Toplam ₺${overdueAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} tutarında ${overdueCount} adet vadesi geçmiş alacağınız var. Cari hesaplardan hızlı mutabakat veya tek tıkla vade hatırlatma e-postası göndermeniz önerilir.`);
        } else {
            recommendations.push(`✅ Tebrikler! Vadesi geçmiş hiçbir faturanız bulunmuyor, alacak tahsilat performansınız mükemmel.`);
        }

        if (cashFlowForecast30Days < 0) {
            recommendations.push(`📉 Önümüzdeki 30 gün için net nakit akışı negatif öngörülüyor (₺${Math.abs(cashFlowForecast30Days).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} açık). Kısa vadeli tahsilatlara öncelik veriniz.`);
        }

        return {
            totalSalesVat,
            totalExpenseVat,
            netVatPayable,
            isVatRefund,
            overdueInvoicesCount: overdueCount,
            overdueTotalAmount: overdueAmount,
            upcomingInvoicesAmount: upcomingAmount,
            totalReceivables,
            highRiskCustomersCount: highRiskCount,
            cashFlowForecast30Days,
            recommendations
        };
    }

    /**
     * Doğal dildeki kullanıcı sorusuna gerçek verilere dayalı akıllı cevap üretir
     */
    async answerFinancialQuery(query: string): Promise<string> {
        const q = query.toLowerCase().trim();
        const health = await this.calculateFinancialHealth();

        if (q.includes('kdv') || q.includes('vergi')) {
            if (health.isVatRefund) {
                return `📊 **KDV Durumu Analizi:**\n\n• **Hesaplanan KDV (Satışlar):** ₺${health.totalSalesVat.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}\n• **İndirilecek KDV (Giderler):** ₺${health.totalExpenseVat.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}\n\n🎉 **Sonuç:** Bu dönem **₺${health.netVatPayable.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}** tutarında **Sonraki Döneme Devreden KDV** bakiyeniz mevcuttur. Devlete KDV ödemesi çıkmamaktadır.`;
            } else {
                return `📊 **KDV Durumu Analizi:**\n\n• **Hesaplanan KDV (Satışlar):** ₺${health.totalSalesVat.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}\n• **İndirilecek KDV (Giderler):** ₺${health.totalExpenseVat.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}\n\n⚠️ **Sonuç:** Bu dönem tahmini **₺${health.netVatPayable.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}** **Ödenecek KDV** tutarı oluşmuştur. Giderlerinizi eksiksiz kaydederek KDV yükünüzü dengeleyebilirsiniz.`;
            }
        }

        if (q.includes('vade') || q.includes('gecik') || q.includes('alacak')) {
            if (health.overdueTotalAmount > 0) {
                return `⏰ **Vade & Alacak Takip Raporu:**\n\n• **Vadesi Geçmiş Fatura Adedi:** ${health.overdueInvoicesCount}\n• **Geciken Toplam Tutar:** ₺${health.overdueTotalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}\n• **Bu Hafta Vadesi Dolan:** ₺${health.upcomingInvoicesAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}\n• **Toplam Bekleyen Alacak:** ₺${health.totalReceivables.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}\n\n💡 **Öneri:** Faturalar menüsündeki "Vadesi Geçenler" sekmesinden ilgili müşterilere tek tıkla vade hatırlatması iletebilirsiniz.`;
            } else {
                return `✨ **Vade Durumu:** Vadesi geçmiş hiçbir alacağınız bulunmuyor! Tüm faturalarınız vadesinde ödenmiş veya vadesi henüz dolmamıştır. Toplam açık alacak tutarınız: ₺${health.totalReceivables.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}.`;
            }
        }

        if (q.includes('risk') || q.includes('müşteri') || q.includes('cari')) {
            return `🛡️ **Cari Risk Değerlendirmesi:**\n\n• **Yüksek Riskli Cari Sayısı:** ${health.highRiskCustomersCount}\n• **Gecikmiş Alacak Tutarı:** ₺${health.overdueTotalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}\n\n📌 **AI Tavsiyesi:** Cari Hesaplar menüsünden yüksek riskli carilerin borç bakiyesini inceleyip yeni fatura kesmeden önce **Hızlı Mutabakat Formu** göndermeniz önerilir.`;
        }

        if (q.includes('nakit') || q.includes('öngörü') || q.includes('tahmin') || q.includes('durum')) {
            const net = health.cashFlowForecast30Days;
            const sign = net >= 0 ? '+' : '-';
            return `📈 **Önümüzdeki 30 Günlük Nakit Akışı Öngörüsü:**\n\n• **Gelecek 30 Günlük Alacaklar:** ₺${health.upcomingInvoicesAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}+\n• **Tahmini Net Nakit Dengesi:** ${sign}₺${Math.abs(net).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}\n\n${net >= 0 ? '🟢 Nakit akışı görünümünüz pozitif ve sağlıklı.' : '🔴 Nakit akışında geçici bir daralma öngörülüyor. Öncelikli tahsilatları tamamlayınız.'}`;
        }

        // Genel yanıt
        return `🤖 **Odivon FaturaPro AI Özeti:**\n\nİşletmenizin finansal verilerini analiz ettim:\n\n1. **KDV Durumu:** ${health.isVatRefund ? 'Devreden KDV mevcut (₺' + health.netVatPayable.toFixed(2) + ')' : 'Tahmini Ödenecek KDV: ₺' + health.netVatPayable.toFixed(2)}\n2. **Vadesi Geçen Alacak:** ₺${health.overdueTotalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} (${health.overdueInvoicesCount} fatura)\n3. **Toplam Açık Alacak:** ₺${health.totalReceivables.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}\n\nÖzel bir analiz için "KDV durumum nedir?", "Vadesi geçen alacaklarım?", "Cari risk analizi" gibi sorular sorabilirsiniz.`;
    }
}
