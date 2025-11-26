import React from 'react';

export const Customers: React.FC = () => {
  const customers = [
    { name: 'Teknoloji A.Ş.', email: 'iletisim@teknoloji.com', phone: '+90 212 123 4567', country: 'Türkiye', selected: false },
    { name: 'Yazılım Çözümleri Ltd.', email: 'destek@yazilim.co.uk', phone: '+44 20 7946 0958', country: 'Birleşik Krallık', selected: true },
    { name: 'Global Lojistik', email: 'info@globallojistik.de', phone: '+49 30 12345678', country: 'Almanya', selected: false },
    { name: 'Danışmanlık Hizmetleri', email: 'contact@consulting.com', phone: '+1 212 555 0123', country: 'ABD', selected: true },
    { name: 'Creative Solutions', email: 'hello@creative.fr', phone: '+33 1 23 45 67 89', country: 'Fransa', selected: false },
  ];

  return (
    <div class="p-8">
      <div class="mb-8 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-black text-slate-900">Müşteriler</h1>
          <p class="text-slate-500">Müşteri listenizi yönetin ve yeni müşteriler ekleyin.</p>
        </div>
        <button class="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">
           <span className="material-symbols-outlined">add</span>
          Yeni Müşteri Ekle
        </button>
      </div>

      <div class="rounded-xl border border-slate-200 bg-white">
        {/* Toolbar */}
        <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 p-4">
          <div class="flex items-center gap-4">
            <p class="text-sm font-medium text-slate-800">2 müşteri seçildi</p>
            <button class="flex items-center gap-1 rounded-lg border border-slate-300 bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-200">
               <span className="material-symbols-outlined text-[18px]">archive</span>
              Arşivle
            </button>
            <button class="flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-100">
               <span className="material-symbols-outlined text-[18px]">delete</span>
              Sil
            </button>
          </div>
          <div class="relative w-full max-w-xs">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
              type="text"
              placeholder="Müşteri ara..."
              class="w-full rounded-lg border-slate-300 pl-10 text-sm focus:border-primary focus:ring-primary"
            />
          </div>
        </div>

        {/* Table */}
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th class="w-12 px-6 py-3">
                  <input type="checkbox" class="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" />
                </th>
                <th class="px-6 py-3">Müşteri Adı</th>
                <th class="px-6 py-3">E-posta</th>
                <th class="px-6 py-3">Telefon</th>
                <th class="px-6 py-3">Ülke</th>
                <th class="px-6 py-3 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              {customers.map((customer, idx) => (
                <tr key={idx} class={`${customer.selected ? 'bg-primary/5' : 'hover:bg-slate-50'}`}>
                  <td class="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={customer.selected}
                      class="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                    />
                  </td>
                  <td class="px-6 py-4 font-medium text-slate-900">{customer.name}</td>
                  <td class="px-6 py-4 text-slate-600">{customer.email}</td>
                  <td class="px-6 py-4 text-slate-600">{customer.phone}</td>
                  <td class="px-6 py-4 text-slate-600">{customer.country}</td>
                  <td class="px-6 py-4 text-right">
                    <div class="flex justify-end gap-2">
                      <button class="text-slate-400 hover:text-primary">
                           <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                      <button class="text-slate-400 hover:text-red-600">
                           <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div class="flex items-center justify-between border-t border-slate-200 p-4">
          <p class="text-sm text-slate-500">Toplam 25 müşteriden 1-5 arası gösteriliyor</p>
          <div class="flex gap-2">
            <button disabled class="rounded-lg border border-slate-300 px-3 py-1 text-sm font-medium text-slate-400 disabled:cursor-not-allowed">
              Önceki
            </button>
            <button class="rounded-lg border border-slate-300 px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Sonraki
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};