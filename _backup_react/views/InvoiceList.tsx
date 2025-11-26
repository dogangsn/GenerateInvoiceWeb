import React from 'react';

export const InvoiceList: React.FC = () => {
  const drafts = [
    { id: 1, title: 'ABC Firması - Nisan 2024', tags: ['Önemli', 'ABC Firması'], date: '18 Nisan 2024', status: 'Taslak', statusColor: 'bg-yellow-100 text-yellow-800' },
    { id: 2, title: 'XYZ Ltd. - Web Tasarım Projesi', tags: ['XYZ Ltd.'], date: '17 Nisan 2024', status: 'Taslak', statusColor: 'bg-yellow-100 text-yellow-800' },
    { id: 3, title: 'DEF A.Ş. - Danışmanlık Hizmeti', tags: ['Beklemede'], date: '12 Nisan 2024', status: 'Taslak', statusColor: 'bg-yellow-100 text-yellow-800' },
    { id: 4, title: 'GHI Holding - Aylık Bakım', tags: [], date: '06 Nisan 2024', status: 'Tamamlandı', statusColor: 'bg-green-100 text-green-800' },
  ];

  return (
    <div class="flex h-full flex-col overflow-hidden p-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-slate-900">Fatura Taslaklarım</h1>
          <p class="text-slate-500">Kaydedilmiş faturalarınızı yönetin ve düzenleyin.</p>
        </div>
        <button class="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-blue-700">
          Yeni Fatura Oluştur
        </button>
      </div>

      {/* Controls */}
      <div class="mt-6 flex flex-wrap items-center justify-between gap-4 border-y border-slate-200 py-4">
        <div class="flex flex-wrap items-center gap-3">
          <div class="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
              type="text"
              placeholder="Taslaklarda ara..."
              class="h-10 w-64 rounded-lg border border-slate-300 pl-10 text-sm focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
          <button class="flex h-10 items-center gap-2 rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <span className="material-symbols-outlined text-[18px]">sort</span>
            Sırala
          </button>
          <button class="flex h-10 items-center gap-2 rounded-lg border border-slate-300 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50">
             <span className="material-symbols-outlined text-[18px]">filter_list</span>
            Filtrele
          </button>
          <button class="flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-medium text-primary hover:bg-primary/10">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Etiket Ekle
          </button>
        </div>
        <div class="flex gap-2">
          <button class="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100">
            <span className="material-symbols-outlined">grid_view</span>
          </button>
          <button class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <span className="material-symbols-outlined">list</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div class="mt-6 flex-1 overflow-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <table class="w-full min-w-[800px] text-left text-sm">
          <thead class="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th class="w-12 px-4 py-3">
                <input type="checkbox" class="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" />
              </th>
              <th class="px-6 py-3 font-semibold">
                  <div className="flex items-center gap-1 cursor-pointer">
                      Başlık
                      <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                  </div>
              </th>
              <th class="px-6 py-3 font-semibold">Etiketler</th>
              <th class="px-6 py-3 font-semibold">Son Düzenleme</th>
              <th class="px-6 py-3 font-semibold">Durum</th>
              <th class="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            {drafts.map((draft) => (
              <tr key={draft.id} class="group hover:bg-slate-50">
                <td class="px-4 py-4">
                  <input type="checkbox" class="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary" />
                </td>
                <td class="px-6 py-4 font-medium text-slate-900">{draft.title}</td>
                <td class="px-6 py-4">
                  <div class="flex gap-2">
                    {draft.tags.map((tag) => {
                        let bg = 'bg-gray-100 text-gray-800';
                        if(tag === 'Önemli') bg = 'bg-red-100 text-red-800';
                        if(tag === 'ABC Firması') bg = 'bg-blue-100 text-blue-800';
                        if(tag === 'Beklemede') bg = 'bg-orange-100 text-orange-800';
                        return (
                            <span key={tag} class={`rounded-full px-2.5 py-0.5 text-xs font-medium ${bg}`}>
                                {tag}
                            </span>
                        );
                    })}
                  </div>
                </td>
                <td class="px-6 py-4 text-slate-500">{draft.date}</td>
                <td class="px-6 py-4">
                  <span class={`rounded-full px-2.5 py-0.5 text-xs font-bold ${draft.statusColor}`}>
                    {draft.status}
                  </span>
                </td>
                <td class="px-6 py-4 text-right">
                  <div class="flex justify-end gap-3 opacity-0 transition-opacity group-hover:opacity-100">
                    <button class="flex items-center gap-1 text-primary hover:underline">
                         <span className="material-symbols-outlined text-[18px]">edit</span>
                         Düzenle
                    </button>
                    <button class="flex items-center gap-1 text-red-600 hover:underline">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                         Sil
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Actions */}
      <div class="mt-4 flex items-center justify-between">
        <div class="flex items-center gap-3 text-sm text-slate-600">
          <span class="font-medium">4</span> öğe seçildi
          <div class="flex gap-2">
            <button class="flex items-center gap-1 rounded border border-slate-300 bg-white px-2 py-1 hover:bg-slate-50">
                 <span className="material-symbols-outlined text-[16px]">label</span>
                Etiketle
            </button>
            <button class="flex items-center gap-1 rounded border border-slate-300 bg-white px-2 py-1 hover:bg-slate-50">
                <span className="material-symbols-outlined text-[16px]">archive</span>
                Arşivle
            </button>
             <button class="flex items-center gap-1 rounded border border-slate-300 bg-white px-2 py-1 text-red-600 hover:bg-slate-50">
                <span className="material-symbols-outlined text-[16px]">delete</span>
                Sil
            </button>
          </div>
        </div>
        <div class="flex gap-2">
            <button class="rounded border border-slate-300 bg-white px-3 py-1 text-sm hover:bg-slate-50">Önceki</button>
            <button class="rounded border border-slate-300 bg-white px-3 py-1 text-sm hover:bg-slate-50">Sonraki</button>
        </div>
      </div>
    </div>
  );
};