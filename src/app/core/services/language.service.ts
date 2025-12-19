import { Injectable, signal, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Language = 'tr' | 'en';

const translations: Record<Language, Record<string, string>> = {
    tr: {
        // Auth
        'auth.login': 'Giriş Yap',
        'auth.logout': 'Çıkış Yap',
        'auth.loginWithGoogle': 'Google ile Giriş Yap',
        'auth.orWithEmail': 'veya e-posta ile',
        'auth.password': 'Şifre',
        'auth.rememberMe': 'Beni Hatırla',
        'auth.forgotPassword': 'Şifremi Unuttum',
        'auth.welcome': 'Hoş Geldiniz',
        'auth.enterCredentials': 'Hesabınıza erişmek için bilgilerinizi girin.',
        'auth.loggingIn': 'Giriş yapılıyor...',

        // Sidebar
        'sidebar.dashboard': 'Panel',
        'sidebar.invoices': 'Faturalar',
        'sidebar.createInvoice': 'Fatura Oluştur',
        'sidebar.customers': 'Müşteriler',
        'sidebar.reports': 'Raporlar',
        'sidebar.settings': 'Ayarlar',

        // Dashboard
        'dashboard.welcome': 'Hoş Geldiniz',
        'dashboard.summary': 'İşte bugünkü özet bilgileriniz',
        'dashboard.totalRevenue': 'Toplam Gelir',
        'dashboard.totalInvoices': 'Toplam Fatura',
        'dashboard.pending': 'Bekleyen',
        'dashboard.paid': 'Ödenen',
        'dashboard.newInvoice': 'Yeni Fatura',

        // Countries
        'countries.title': 'İşlem Yapılacak Ülkeyi Seçiniz',
        'countries.subtitle': 'Oluşturulacak fatura, seçtiğiniz ülkenin vergi ve format kurallarına uygun olacaktır.',
        'countries.turkey': 'Türkiye',
        'countries.germany': 'Almanya',
        'countries.france': 'Fransa',
        'countries.uk': 'Birleşik Krallık',
        'countries.spain': 'İspanya',
        'countries.italy': 'İtalya',
        'countries.netherlands': 'Hollanda',
        'countries.canada': 'Kanada',
        'countries.usa': 'ABD',
        'countries.australia': 'Avustralya',

        // Common
        'common.save': 'Kaydet',
        'common.cancel': 'İptal',
        'common.delete': 'Sil',
        'common.edit': 'Düzenle',
        'common.add': 'Ekle',
        'common.search': 'Ara',
        'common.email': 'E-posta',
        'common.loading': 'Yükleniyor...',

        // Invoices
        'invoices.title': 'Faturalar',
        'invoices.new': 'Yeni Fatura',

        // Customers
        'customers.title': 'Müşteriler',
        'customers.new': 'Yeni Müşteri',
    },
    en: {
        // Auth
        'auth.login': 'Login',
        'auth.logout': 'Logout',
        'auth.loginWithGoogle': 'Login with Google',
        'auth.orWithEmail': 'or with email',
        'auth.password': 'Password',
        'auth.rememberMe': 'Remember Me',
        'auth.forgotPassword': 'Forgot Password',
        'auth.welcome': 'Welcome',
        'auth.enterCredentials': 'Enter your credentials to access your account.',
        'auth.loggingIn': 'Logging in...',

        // Sidebar
        'sidebar.dashboard': 'Dashboard',
        'sidebar.invoices': 'Invoices',
        'sidebar.createInvoice': 'Create Invoice',
        'sidebar.customers': 'Customers',
        'sidebar.reports': 'Reports',
        'sidebar.settings': 'Settings',

        // Dashboard
        'dashboard.welcome': 'Welcome',
        'dashboard.summary': 'Here is your summary for today',
        'dashboard.totalRevenue': 'Total Revenue',
        'dashboard.totalInvoices': 'Total Invoices',
        'dashboard.pending': 'Pending',
        'dashboard.paid': 'Paid',
        'dashboard.newInvoice': 'New Invoice',

        // Countries
        'countries.title': 'Select Country for Transaction',
        'countries.subtitle': 'The invoice will comply with the tax and format rules of the selected country.',
        'countries.turkey': 'Turkey',
        'countries.germany': 'Germany',
        'countries.france': 'France',
        'countries.uk': 'United Kingdom',
        'countries.spain': 'Spain',
        'countries.italy': 'Italy',
        'countries.netherlands': 'Netherlands',
        'countries.canada': 'Canada',
        'countries.usa': 'USA',
        'countries.australia': 'Australia',

        // Common
        'common.save': 'Save',
        'common.cancel': 'Cancel',
        'common.delete': 'Delete',
        'common.edit': 'Edit',
        'common.add': 'Add',
        'common.search': 'Search',
        'common.email': 'Email',
        'common.loading': 'Loading...',

        // Invoices
        'invoices.title': 'Invoices',
        'invoices.new': 'New Invoice',

        // Customers
        'customers.title': 'Customers',
        'customers.new': 'New Customer',
    }
};

@Injectable({
    providedIn: 'root'
})
export class LanguageService {
    private platformId = inject(PLATFORM_ID);
    
    currentLang = signal<Language>('tr');

    constructor() {
        if (isPlatformBrowser(this.platformId)) {
            const saved = localStorage.getItem('lang') as Language;
            if (saved && (saved === 'tr' || saved === 'en')) {
                this.currentLang.set(saved);
            }
        }
    }

    setLanguage(lang: Language) {
        this.currentLang.set(lang);
        if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('lang', lang);
        }
    }

    t(key: string): string {
        return translations[this.currentLang()][key] || key;
    }

    get lang(): Language {
        return this.currentLang();
    }
}

