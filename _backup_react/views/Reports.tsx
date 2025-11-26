import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export const Reports: React.FC = () => {
  const data = [
    { name: 'A', value: 1000 },
    { name: 'B', value: 2000 },
    { name: 'C', value: 4000 },
    { name: 'D', value: 6000 },
    { name: 'E', value: 8000 },
    { name: 'F', value: 10000 },
    { name: 'G', value: 12000 },
    { name: 'H', value: 11000 },
    { name: 'I', value: 13000 },
  ];

  return (
    <div class="h-full overflow-y-auto p-8">
      <div class="mb-8 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-black text-slate-900">Fatura Raporları</h1>
          <p class="text-slate-500">Faturalarınıza göre özel raporlar oluşturun ve görüntüleyin.</p>
        </div>
        <div class="flex gap-3">
          <button class="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">
            <span className="material-symbols-outlined">print</span>
            Yazdır
          </button>
          <button class="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-blue-700">
             <span className="material-symbols-outlined">download</span>
            Dışa Aktar
          </button>
        </div>
      </div>

      {/* Filters */}
      <div class="mb-8 rounded-xl border border-slate-200 bg-white p-6">
        <h2 class="mb-4 text-xl font-bold text-slate-900">Rapor Kriterleri</h2>
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 items-end">
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">Başlangıç Tarihi</label>
            <div class="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">calendar_month</span>
                <input type="text" defaultValue="05 Aralık 2023" class="w-full rounded-lg border-slate-300 pl-10 focus:border-primary focus:ring-primary" />
            </div>
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">Bitiş Tarihi</label>
            <div class="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">calendar_month</span>
                <input type="text" defaultValue="30 Aralık 2023" class="w-full rounded-lg border-slate-300 pl-10 focus:border-primary focus:ring-primary" />
            </div>
          </div>
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">Rapor Türü</label>
            <select class="w-full rounded-lg border-slate-300 focus:border-primary focus:ring-primary">
              <option>Aylık Satış Raporu</option>
            </select>
          </div>
          <button class="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 font-bold text-white hover:bg-blue-700">
            <span className="material-symbols-outlined">filter_alt</span>
            Rapor Oluştur
          </button>
        </div>
      </div>

      {/* Stats */}
      <div class="mb-8 grid gap-6 sm:grid-cols-3">
        <div class="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-6">
          <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-primary">
             <span className="material-symbols-outlined text-3xl">payments</span>
          </div>
          <div>
            <p class="text-sm text-slate-500">Toplam Ciro</p>
            <p class="text-2xl font-bold text-slate-900">₺1,250,450.75</p>
          </div>
        </div>
        <div class="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-6">
           <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-green-50 text-green-600">
             <span className="material-symbols-outlined text-3xl">receipt_long</span>
          </div>
          <div>
            <p class="text-sm text-slate-500">Toplam Fatura</p>
            <p class="text-2xl font-bold text-slate-900">342</p>
          </div>
        </div>
        <div class="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-6">
            <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-red-50 text-red-600">
             <span className="material-symbols-outlined text-3xl">percent</span>
          </div>
          <div>
            <p class="text-sm text-slate-500">Toplam Vergi</p>
            <p class="text-2xl font-bold text-slate-900">₺225,081.14</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div class="mb-8 rounded-xl border border-slate-200 bg-white p-6">
        <h3 class="mb-6 text-lg font-bold text-slate-900">Aylık Satış Dağılımı</h3>
        <div class="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barCategoryGap="20%">
              <XAxis dataKey="name" hide />
              <YAxis hide />
              <Tooltip cursor={{fill: 'transparent'}} />
              <Bar dataKey="value" fill="#94a3b8" radius={[4, 4, 4, 4]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Details Table */}
      <div class="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div class="p-6 pb-4">
            <h3 class="text-lg font-bold text-slate-900">Rapor Detayları</h3>
        </div>
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th class="px-6 py-3">Fatura No</th>
              <th class="px-6 py-3">Müşteri</th>
              <th class="px-6 py-3">Tarih</th>
              <th class="px-6 py-3">Durum</th>
              <th class="px-6 py-3 text-right">Tutar</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            <tr>
              <td class="px-6 py-4 font-medium text-slate-900">INV-2023-088</td>
              <td class="px-6 py-4 text-slate-600">Teknoloji A.Ş.</td>
              <td class="px-6 py-4 text-slate-600">28 Aralık 2023</td>
              <td class="px-6 py-4"><span class="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-800">Ödendi</span></td>
              <td class="px-6 py-4 text-right font-bold text-slate-900">₺15,200.00</td>
            </tr>
            <tr>
              <td class="px-6 py-4 font-medium text-slate-900">INV-2023-087</td>
              <td class="px-6 py-4 text-slate-600">Yazılım Çözümleri Ltd.</td>
              <td class="px-6 py-4 text-slate-600">26 Aralık 2023</td>
              <td class="px-6 py-4"><span class="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-800">Ödendi</span></td>
              <td class="px-6 py-4 text-right font-bold text-slate-900">₺8,750.50</td>
            </tr>
            <tr>
              <td class="px-6 py-4 font-medium text-slate-900">INV-2023-086</td>
              <td class="px-6 py-4 text-slate-600">Global Lojistik</td>
              <td class="px-6 py-4 text-slate-600">22 Aralık 2023</td>
              <td class="px-6 py-4"><span class="rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-bold text-yellow-800">Beklemede</span></td>
              <td class="px-6 py-4 text-right font-bold text-slate-900">₺32,000.00</td>
            </tr>
             <tr>
              <td class="px-6 py-4 font-medium text-slate-900">INV-2023-085</td>
              <td class="px-6 py-4 text-slate-600">Danışmanlık Hizmetleri</td>
              <td class="px-6 py-4 text-slate-600">15 Aralık 2023</td>
              <td class="px-6 py-4"><span class="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-800">Gecikmiş</span></td>
              <td class="px-6 py-4 text-right font-bold text-slate-900">₺5,500.00</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};