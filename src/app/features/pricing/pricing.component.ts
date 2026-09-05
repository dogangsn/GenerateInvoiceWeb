import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { UserProfile } from '../../core/models/user.model';
import { LanguageService } from '../../core/services/language.service';

@Component({
    selector: 'app-pricing',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './pricing.component.html',
    styles: [`:host { display: block; }`]
})
export class PricingComponent implements OnInit {
    private userService = inject(UserService);
    private authService = inject(AuthService);
    lang = inject(LanguageService);

    userProfile: UserProfile | null = null;
    currentPlan: 'free' | 'pro' | 'enterprise' = 'pro';
    isUpdating = false;

    plans = [
        {
            id: 'free',
            name: 'Ücretsiz Plan',
            badge: 'Başlangıç',
            price: '₺0',
            period: '/aylık',
            description: 'Bireysel ve küçük ölçekli kullanım için temel fatura çözümü.',
            features: [
                'Ayda 10 Fatura Kesimi',
                'Standart PDF İndirme & Yazdırma',
                'Temel Gelir Raporlama',
                'E-posta Desteği'
            ],
            notIncluded: [
                'Proforma Fatura Desteği',
                'Özel Şirket Logosu',
                'CSV / Excel Dışa Aktarma',
                'Çoklu Kullanıcı Desteği'
            ],
            color: 'border-slate-200 dark:border-slate-800',
            btnClass: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200'
        },
        {
            id: 'pro',
            name: 'Pro Plan',
            badge: 'En Popüler 🔥',
            price: '₺299',
            period: '/aylık',
            description: 'Büyüyen işletmeler ve profesyoneller için sınırsız güç.',
            features: [
                'Sınırsız Fatura & Proforma Kesimi',
                'Proforma Teklif & Satış Faturası',
                'Özel Logo & Banka Bilgisi Ekleme',
                'CSV & Excel Rapor İndirme',
                'Koyu Tema (Dark Mode)',
                '7/24 Öncelikli Canlı Destek'
            ],
            notIncluded: [
                'Çoklu Kullanıcı Hesabı'
            ],
            color: 'border-primary shadow-xl shadow-primary/15 relative',
            btnClass: 'bg-primary text-white hover:bg-blue-700 shadow-lg shadow-primary/30'
        },
        {
            id: 'enterprise',
            name: 'Kurumsal Plan',
            badge: 'Özel Çözüm',
            price: '₺799',
            period: '/aylık',
            description: 'Şirketler, ajanslar ve ekibi olan büyük kurumlar için.',
            features: [
                'Sınırsız Her Şey',
                'Çoklu Kullanıcı & Yetkilendirme',
                'Otomatik Fatura Hatırlatıcıları',
                'API & Muhasebe Entegrasyonu',
                'Özel Müşteri Temsilcisi',
                '7/24 Telefon & WhatsApp Desteği'
            ],
            notIncluded: [],
            color: 'border-purple-500 dark:border-purple-800 shadow-xl shadow-purple-500/10',
            btnClass: 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-600/30'
        }
    ];

    ngOnInit() {
        this.authService.user$.subscribe(async user => {
            if (user) {
                const profile = await this.userService.getUserProfile(user.uid);
                if (profile) {
                    this.userProfile = profile;
                    this.currentPlan = profile.plan || 'pro';
                }
            }
        });
    }

    async selectPlan(planId: 'free' | 'pro' | 'enterprise') {
        if (this.currentPlan === planId) return;

        const currentUser = this.authService.currentUser;
        if (!currentUser) {
            alert('Lütfen önce giriş yapın.');
            return;
        }

        this.isUpdating = true;
        try {
            await this.userService.updateUserProfile(currentUser.uid, {
                plan: planId,
                monthlyInvoiceLimit: planId === 'free' ? 10 : 999999
            });
            this.currentPlan = planId;
            alert(`Tebrikler! ${planId.toUpperCase()} paketine başarıyla geçiş yaptınız.`);
        } catch (error) {
            console.error('Plan değiştirilirken hata:', error);
            alert('Plan güncellenirken bir hata oluştu.');
        } finally {
            this.isUpdating = false;
        }
    }
}
