import React from 'react';

export const CreateInvoice: React.FC = () => {
  return (
    <div class="p-8">
      <h1 class="mb-8 text-4xl font-black text-slate-900">Yeni Fatura Oluştur</h1>

      <div class="grid gap-8 lg:grid-cols-2">
        {/* Left Column: Form Inputs */}
        <div class="flex flex-col gap-6">
          {/* Invoice Info */}
          <div class="rounded-xl bg-white p-6 shadow-sm">
            <h2 class="mb-4 border-b border-slate-200 pb-4 text-xl font-bold text-slate-900">Fatura Bilgileri</h2>
            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <label class="mb-2 block text-sm font-medium text-slate-900">Fatura Tipi</label>
                <select class="w-full rounded-lg border-slate-300 py-3 focus:border-primary focus:ring-primary">
                  <option>Satış</option>
                  <option>İade</option>
                </select>
              </div>
              <div>
                <label class="mb-2 block text-sm font-medium text-slate-900">Fatura Senaryosu</label>
                <select class="w-full rounded-lg border-slate-300 py-3 focus:border-primary focus:ring-primary">
                  <option>Temel Fatura</option>
                  <option>Ticari Fatura</option>
                </select>
              </div>
              <div>
                <label class="mb-2 block text-sm font-medium text-slate-900">Fatura Tarihi</label>
                <input type="date" defaultValue="2024-05-24" class="w-full rounded-lg border-slate-300 py-3 focus:border-primary focus:ring-primary" />
              </div>
              <div>
                <label class="mb-2 block text-sm font-medium text-slate-900">Fatura Saati</label>
                <input type="time" defaultValue="14:30" class="w-full rounded-lg border-slate-300 py-3 focus:border-primary focus:ring-primary" />
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div class="rounded-xl bg-white p-6 shadow-sm">
            <h2 class="mb-4 border-b border-slate-200 pb-4 text-xl font-bold text-slate-900">Müşteri Bilgileri</h2>
            <div class="grid gap-4 sm:grid-cols-2">
              <div class="sm:col-span-2">
                <label class="mb-2 block text-sm font-medium text-slate-900">Müşteri Adı / Ünvanı</label>
                <input type="text" placeholder="Müşteri adını girin" class="w-full rounded-lg border-slate-300 py-3 focus:border-primary focus:ring-primary" />
              </div>
              <div>
                <label class="mb-2 block text-sm font-medium text-slate-900">Vergi Numarası</label>
                <input type="text" placeholder="Vergi numarasını girin" class="w-full rounded-lg border-slate-300 py-3 focus:border-primary focus:ring-primary" />
              </div>
              <div>
                <label class="mb-2 block text-sm font-medium text-slate-900">Adres</label>
                <input type="text" placeholder="Müşteri adresini girin" class="w-full rounded-lg border-slate-300 py-3 focus:border-primary focus:ring-primary" />
              </div>
            </div>
          </div>

           {/* Tax Settings */}
           <div class="rounded-xl bg-white p-6 shadow-sm">
             <h2 class="mb-4 border-b border-slate-200 pb-4 text-xl font-bold text-slate-900">Vergi Ayarları (Türkiye)</h2>
             <div class="space-y-4">
               <div class="grid grid-cols-12 gap-2 text-sm font-semibold text-slate-500">
                 <div class="col-span-6">Vergi Adı</div>
                 <div class="col-span-3 text-center">Oran (%)</div>
                 <div class="col-span-2 text-center">Uygula</div>
                 <div class="col-span-1"></div>
               </div>
               <div class="grid grid-cols-12 items-center gap-2">
                 <input type="text" defaultValue="KDV" class="col-span-6 h-10 rounded-lg border-slate-300 text-sm" />
                 <input type="number" defaultValue="20" class="col-span-3 h-10 rounded-lg border-slate-300 text-center text-sm" />
                 <div class="col-span-2 flex justify-center"><input type="checkbox" checked class="h-5 w-5 rounded border-slate-300 text-primary focus:ring-primary" /></div>
                 <button class="col-span-1 text-slate-400 hover:text-red-500 flex justify-center"><span className="material-symbols-outlined text-[18px]">delete</span></button>
               </div>
                <div class="grid grid-cols-12 items-center gap-2">
                 <input type="text" defaultValue="ÖİV" class="col-span-6 h-10 rounded-lg border-slate-300 text-sm" />
                 <input type="number" defaultValue="10" class="col-span-3 h-10 rounded-lg border-slate-300 text-center text-sm" />
                 <div class="col-span-2 flex justify-center"><input type="checkbox" class="h-5 w-5 rounded border-slate-300 text-primary focus:ring-primary" /></div>
                 <button class="col-span-1 text-slate-400 hover:text-red-500 flex justify-center"><span className="material-symbols-outlined text-[18px]">delete</span></button>
               </div>
               <button class="flex items-center gap-2 text-sm font-bold text-primary hover:underline">
                 <span className="material-symbols-outlined text-[18px]">add_circle</span>
                 Yeni Vergi Ekle
               </button>
             </div>
           </div>

           {/* Line Items */}
           <div class="rounded-xl bg-white p-6 shadow-sm">
             <h2 class="mb-4 border-b border-slate-200 pb-4 text-xl font-bold text-slate-900">Fatura Kalemleri</h2>
              <div class="space-y-4">
                 <div class="hidden grid-cols-12 gap-2 px-2 text-sm font-semibold text-slate-500 md:grid">
                   <div class="col-span-3">Açıklama</div>
                   <div class="col-span-1 text-center">Miktar</div>
                   <div class="col-span-2 text-right">Birim Fiyat</div>
                   <div class="col-span-3">Vergiler</div>
                   <div class="col-span-2 text-right">Toplam</div>
                   <div class="col-span-1"></div>
                 </div>
                 {/* Item 1 */}
                 <div class="grid grid-cols-1 gap-2 border-b border-slate-100 pb-4 md:grid-cols-12 md:items-center md:border-none md:pb-0">
                   <input type="text" defaultValue="Web Tasarım Hizmeti" class="h-10 rounded-lg border-slate-300 text-sm md:col-span-3" placeholder="Ürün" />
                   <input type="number" defaultValue="1" class="h-10 rounded-lg border-slate-300 text-center text-sm md:col-span-1" />
                   <input type="text" defaultValue="150.00" class="h-10 rounded-lg border-slate-300 text-right text-sm md:col-span-2" />
                   <div class="md:col-span-3">
                     <select multiple class="h-10 w-full rounded-lg border-slate-300 text-sm">
                       <option selected>KDV %20</option>
                       <option>ÖİV %10</option>
                     </select>
                   </div>
                   <p class="text-right text-sm font-medium md:col-span-2">₺180.00</p>
                   <button class="flex justify-center text-slate-400 hover:text-red-500 md:col-span-1"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                 </div>
                 {/* Item 2 */}
                  <div class="grid grid-cols-1 gap-2 border-b border-slate-100 pb-4 md:grid-cols-12 md:items-center md:border-none md:pb-0">
                   <input type="text" defaultValue="Logo Tasarımı" class="h-10 rounded-lg border-slate-300 text-sm md:col-span-3" placeholder="Ürün" />
                   <input type="number" defaultValue="2" class="h-10 rounded-lg border-slate-300 text-center text-sm md:col-span-1" />
                   <input type="text" defaultValue="75.00" class="h-10 rounded-lg border-slate-300 text-right text-sm md:col-span-2" />
                   <div class="md:col-span-3">
                     <select multiple class="h-10 w-full rounded-lg border-slate-300 text-sm">
                       <option selected>KDV %20</option>
                       <option selected>ÖİV %10</option>
                     </select>
                   </div>
                   <p class="text-right text-sm font-medium md:col-span-2">₺195.00</p>
                   <button class="flex justify-center text-slate-400 hover:text-red-500 md:col-span-1"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                 </div>
                 <button class="flex items-center gap-2 text-sm font-bold text-primary hover:underline">
                    <span className="material-symbols-outlined text-[18px]">add_circle</span>
                   Yeni Kalem Ekle
                 </button>
              </div>
              
              <div class="mt-6 flex flex-col justify-end gap-3 sm:flex-row">
                <button class="h-11 rounded-lg bg-slate-200 px-6 text-sm font-bold text-slate-900 hover:bg-slate-300">Taslak Olarak Kaydet</button>
                <button class="h-11 rounded-lg bg-primary px-6 text-sm font-bold text-white hover:bg-blue-700">Faturayı Oluştur</button>
              </div>
           </div>
        </div>

        {/* Right Column: Preview */}
        <div class="h-fit rounded-xl border border-slate-200 bg-white p-8 shadow-lg">
          <div class="mb-8 flex items-start justify-between border-b border-slate-200 pb-8">
            <div>
              <h3 class="text-xl font-bold text-slate-800">Şirket Adınız</h3>
              <p class="text-sm text-slate-500">Vergi Dairesi, Vergi No: 1234567890</p>
              <p class="text-sm text-slate-500">Adresiniz, Şehir, Ülke</p>
            </div>
            <h1 class="text-3xl font-extrabold tracking-wider text-slate-800">FATURA</h1>
          </div>

          <div class="mb-6 flex justify-between">
            <div>
              <p class="font-semibold text-slate-700">Alıcı:</p>
              <p class="text-slate-600">Müşteri Adı / Ünvanı</p>
              <p class="text-slate-600">Müşteri Adresi</p>
              <p class="text-slate-600">Vergi No: 9876543210</p>
            </div>
            <div class="text-right">
              <p><span class="font-semibold text-slate-700">Fatura No:</span> INV-00123</p>
              <p><span class="font-semibold text-slate-700">Tarih:</span> 24/05/2024</p>
              <p><span class="font-semibold text-slate-700">Son Ödeme:</span> 08/06/2024</p>
            </div>
          </div>

          <table class="mb-6 w-full text-left">
            <thead class="border-b-2 border-slate-300">
              <tr>
                <th class="py-2 pr-2 font-semibold text-slate-700">Açıklama</th>
                <th class="px-2 py-2 text-center font-semibold text-slate-700">Miktar</th>
                <th class="px-2 py-2 text-right font-semibold text-slate-700">Birim Fiyat</th>
                <th class="pl-2 py-2 text-right font-semibold text-slate-700">Toplam</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              <tr>
                <td class="py-3 pr-2">Web Tasarım Hizmeti</td>
                <td class="px-2 py-3 text-center">1</td>
                <td class="px-2 py-3 text-right">₺150.00</td>
                <td class="pl-2 py-3 text-right">₺180.00</td>
              </tr>
              <tr>
                <td class="py-3 pr-2">Logo Tasarımı</td>
                <td class="px-2 py-3 text-center">2</td>
                <td class="px-2 py-3 text-right">₺75.00</td>
                <td class="pl-2 py-3 text-right">₺195.00</td>
              </tr>
            </tbody>
          </table>

          <div class="flex justify-end">
            <div class="w-full max-w-xs space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-slate-600">Ara Toplam:</span>
                <span class="font-medium text-slate-800">₺300.00</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">KDV (%20):</span>
                <span class="font-medium text-slate-800">₺60.00</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-600">ÖİV (%10):</span>
                <span class="font-medium text-slate-800">₺15.00</span>
              </div>
              <div class="mt-2 flex justify-between border-t-2 border-slate-300 pt-2">
                <span class="text-lg font-bold text-slate-800">Genel Toplam:</span>
                <span class="text-lg font-bold text-slate-800">₺375.00</span>
              </div>
            </div>
          </div>

          <div class="mt-8 border-t border-slate-200 pt-4 text-center">
            <p class="text-xs text-slate-500">Ödemeleriniz için teşekkür ederiz. Sorularınız için bizimle iletişime geçebilirsiniz.</p>
          </div>
        </div>
      </div>
    </div>
  );
};