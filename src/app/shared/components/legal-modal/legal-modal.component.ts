import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type LegalDocType = 'kvkk' | 'privacy' | 'terms';

@Component({
    selector: 'app-legal-modal',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
        <div class="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[85vh] overflow-hidden">
            <!-- Header -->
            <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                <div class="flex items-center gap-2">
                    <span class="material-symbols-outlined text-primary text-2xl">verified_user</span>
                    <h3 class="text-lg font-bold text-slate-900 dark:text-white">Yasal Bilgilendirme ve Sözleşmeler</h3>
                </div>
                <button (click)="close()" class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors">
                    <span class="material-symbols-outlined text-xl">close</span>
                </button>
            </div>

            <!-- Tabs -->
            <div class="flex border-b border-slate-200 dark:border-slate-800 px-6 bg-slate-50 dark:bg-slate-800/50">
                <button (click)="activeTab = 'terms'"
                    [class.border-primary]="activeTab === 'terms'"
                    [class.text-primary]="activeTab === 'terms'"
                    [class.border-transparent]="activeTab !== 'terms'"
                    class="py-3 px-4 font-semibold text-xs sm:text-sm border-b-2 transition-colors cursor-pointer text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                    Kullanım Şartları
                </button>
                <button (click)="activeTab = 'privacy'"
                    [class.border-primary]="activeTab === 'privacy'"
                    [class.text-primary]="activeTab === 'privacy'"
                    [class.border-transparent]="activeTab !== 'privacy'"
                    class="py-3 px-4 font-semibold text-xs sm:text-sm border-b-2 transition-colors cursor-pointer text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                    Gizlilik & Çerez Politikası
                </button>
                <button (click)="activeTab = 'kvkk'"
                    [class.border-primary]="activeTab === 'kvkk'"
                    [class.text-primary]="activeTab === 'kvkk'"
                    [class.border-transparent]="activeTab !== 'kvkk'"
                    class="py-3 px-4 font-semibold text-xs sm:text-sm border-b-2 transition-colors cursor-pointer text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                    KVKK Metni
                </button>
            </div>

            <!-- Content Area -->
            <div class="flex-1 overflow-y-auto p-6 text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-4 leading-relaxed">
                <!-- Kullanım Şartları -->
                <div *ngIf="activeTab === 'terms'" class="space-y-3">
                    <h4 class="font-bold text-slate-900 dark:text-white text-base">Odivon FaturaPro Kullanım Koşulları</h4>
                    <p>Bu sözleşme, <strong>Odivon FaturaPro</strong> bulut tabanlı fatura ve finans yönetim yazılımını kullanan gerçek veya tüzel kişi ("Kullanıcı") ile Odivon Bilişim Teknolojileri ("Hizmet Sağlayıcı") arasındaki kullanım şartlarını belirler.</p>
                    
                    <h5 class="font-semibold text-slate-800 dark:text-slate-100 mt-3">1. Hizmet Kapsamı</h5>
                    <p>FaturaPro; fatura hazırlama, teklif ve proforma oluşturma, harcama ve gider takibi, müşteri rehberi ve finansal raporlama hizmetleri sunar. Resmi muhasebe veya mali müşavirlik tavsiyesi teşkil etmez; kesilen faturaların yasal beyanı kullanıcı sorumluluğundadır.</p>

                    <h5 class="font-semibold text-slate-800 dark:text-slate-100 mt-3">2. Hesap Güvenliği</h5>
                    <p>Kullanıcı, hesap şifresinin gizliliğinden ve hesabında gerçekleştirilen tüm faaliyetlerden bizzat sorumludur. Şüpheli bir durum tespit edildiğinde derhal destek ekibine bilgi verilmelidir.</p>

                    <h5 class="font-semibold text-slate-800 dark:text-slate-100 mt-3">3. Fikri Mülkiyet & Lisans</h5>
                    <p>FaturaPro yazılımının kaynak kodları, tasarımı, logoları ve arayüzü Hizmet Sağlayıcı'ya aittir. Kullanıcıya verilen hak, seçilen abonelik paketi kapsamında sınırlı bir kullanım lisansıdır.</p>
                </div>

                <!-- Gizlilik & Çerez Politikası -->
                <div *ngIf="activeTab === 'privacy'" class="space-y-3">
                    <h4 class="font-bold text-slate-900 dark:text-white text-base">Gizlilik ve Veri Güvenliği Politikası</h4>
                    <p>Gizliliğiniz bizim için en üst önceliktir. Odivon FaturaPro, finansal verilerinizin ve müşteri bilgilerinizin güvenliği için Google Cloud / Firebase kurumsal altyapısı ve uçtan uca TLS 1.3 şifreleme kullanır.</p>

                    <h5 class="font-semibold text-slate-800 dark:text-slate-100 mt-3">1. Toplanan Veriler</h5>
                    <p>Hesap açılışında ad-soyad, e-posta adresi; fatura oluşturulurken ise firma unvanı, vergi dairesi/numarası, adres ve fatura kalemleri yalnızca hizmetin ifası için işlenir.</p>

                    <h5 class="font-semibold text-slate-800 dark:text-slate-100 mt-3">2. Çerez (Cookie) Kullanımı</h5>
                    <p>Oturumunuzun sürekliliği, koyu/açık tema tercihleriniz ve dil ayarlarınız için zorunlu teknik çerezler kullanılmaktadır. Üçüncü taraf reklam takip çerezi kullanılmamaktadır.</p>

                    <h5 class="font-semibold text-slate-800 dark:text-slate-100 mt-3">3. Veri Paylaşımı</h5>
                    <p>Finansal kayıtlarınız ve cari verileriniz üçüncü şahıslara kesinlikle satılmaz, kiralanmaz ve yasal zorunluluklar hariç üçüncü taraflarla paylaşılmaz.</p>
                </div>

                <!-- KVKK Aydınlatma Metni -->
                <div *ngIf="activeTab === 'kvkk'" class="space-y-3">
                    <h4 class="font-bold text-slate-900 dark:text-white text-base">6698 Sayılı KVKK Uyarınca Aydınlatma Metni</h4>
                    <p>Veri Sorumlusu sıfatıyla Odivon Bilişim Teknolojileri tarafından, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında kişisel verileriniz aşağıda belirtilen usul ve esaslara uygun olarak işlenmektedir.</p>

                    <h5 class="font-semibold text-slate-800 dark:text-slate-100 mt-3">1. İşleme Amaçları</h5>
                    <p>Kimlik, iletişim ve işletme verileriniz; SaaS hizmet sözleşmesinin kurulması, kullanıcı hesabı oluşturulması, faturalandırma ve tahsilat süreçlerinin yürütülmesi amacıyla KVKK 5. maddesine uygun olarak işlenir.</p>

                    <h5 class="font-semibold text-slate-800 dark:text-slate-100 mt-3">2. Haklarınız</h5>
                    <p>KVKK'nın 11. maddesi uyarınca; verilerinizin işlenip işlenmediğini öğrenme, işlenmişse bilgi talep etme, silinmesini veya düzeltilmesini isteme ve kanuna aykırı işleme nedeniyle zararın giderilmesini talep etme haklarına sahipsiniz.</p>
                </div>
            </div>

            <!-- Footer -->
            <div class="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex justify-end">
                <button (click)="close()" class="px-5 py-2 rounded-xl bg-primary text-white font-medium text-xs sm:text-sm hover:bg-blue-700 transition-colors">
                    Anladım & Kapat
                </button>
            </div>
        </div>
    </div>
    `
})
export class LegalModalComponent {
    @Input() isOpen = false;
    @Input() activeTab: LegalDocType = 'terms';
    @Output() closed = new EventEmitter<void>();

    close(): void {
        this.isOpen = false;
        this.closed.emit();
    }
}
