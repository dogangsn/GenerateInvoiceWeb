import React from 'react';

export const Dashboard: React.FC = () => {
  const recentActivity = [
    { id: 'INV-2024-008', customer: 'Teknoloji A.Ş.', date: '15.07.2024', amount: '₺5,000.00', status: 'Ödendi' },
    { id: 'INV-2024-007', customer: 'Hizmet Ltd.', date: '12.07.2024', amount: '₺1,250.00', status: 'Bekliyor' },
    { id: 'INV-2024-006', customer: 'Danışmanlık Co.', date: '10.07.2024', amount: '₺3,400.00', status: 'Gecikmiş' },
    { id: 'INV-2024-005', customer: 'E-Ticaret Platformu', date: '05.07.2024', amount: '₺750.00', status: 'Ödendi' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ödendi': return 'bg-green-100 text-green-800';
      case 'Bekliyor': return 'bg-yellow-100 text-yellow-800';
      case 'Gecikmiş': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div class="p-8">
      <header class="mb-8 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-slate-900">Kontrol Paneli</h1>
          <p class="text-slate-500">Fatura yönetimine genel bakış.</p>
        </div>
        <div class="flex items-center gap-4">
            <button class="relative rounded-full p-2 text-slate-400 hover:bg-slate-100">
                <span className="material-symbols-outlined">notifications</span>
                <span class="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500"></span>
            </button>
        </div>
      </header>

      {/* Stats Cards */}
      <div class="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p class="mb-1 text-sm font-medium text-slate-500">Bu Ayki Toplam Ciro</p>
          <p class="mb-1 text-3xl font-bold text-slate-900">₺25,450.00</p>
          <p class="text-sm font-medium text-green-600">+5.2%</p>
        </div>
        <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p class="mb-1 text-sm font-medium text-slate-500">Ödenmeyi Bekleyen</p>
          <p class="mb-1 text-3xl font-bold text-slate-900">₺8,200.00</p>
          <p class="text-sm font-medium text-orange-500">12 Fatura</p>
        </div>
        <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p class="mb-1 text-sm font-medium text-slate-500">Toplam Taslak Sayısı</p>
          <p class="mb-1 text-3xl font-bold text-slate-900">5</p>
          <button class="text-sm font-medium text-primary hover:underline">Taslakları Görüntüle</button>
        </div>
        <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <p class="mb-1 text-sm font-medium text-slate-500">Gecikmiş Faturalar</p>
          <p class="mb-1 text-3xl font-bold text-slate-900">2</p>
          <p class="text-sm font-medium text-red-600">Acil dikkat gerekli</p>
        </div>
      </div>

      <div class="grid gap-8 lg:grid-cols-3">
        {/* Recent Activity Table */}
        <div class="lg:col-span-2">
          <h2 class="mb-4 text-xl font-bold text-slate-900">Son Hareketler</h2>
          <div class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <table class="w-full text-left text-sm text-slate-600">
              <thead class="bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th class="px-6 py-4">Fatura No</th>
                  <th class="px-6 py-4">Müşteri</th>
                  <th class="px-6 py-4">Tarih</th>
                  <th class="px-6 py-4">Tutar</th>
                  <th class="px-6 py-4">Durum</th>
                  <th class="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200">
                {recentActivity.map((item) => (
                  <tr key={item.id} class="hover:bg-slate-50">
                    <td class="px-6 py-4 font-medium">{item.id}</td>
                    <td class="px-6 py-4 font-semibold text-slate-900">{item.customer}</td>
                    <td class="px-6 py-4">{item.date}</td>
                    <td class="px-6 py-4">{item.amount}</td>
                    <td class="px-6 py-4">
                      <span class={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td class="px-6 py-4 text-right">
                      <button class="font-medium text-primary hover:underline">Görüntüle</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Notifications */}
        <div>
          <h2 class="mb-4 text-xl font-bold text-slate-900">Önemli Bildirimler</h2>
          <div class="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div class="flex items-start gap-4 rounded-lg p-2 transition-colors hover:bg-slate-50">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                <span className="material-symbols-outlined">hourglass_top</span>
              </div>
              <div>
                <p class="text-sm font-medium text-slate-800">INV-2024-009 faturasının vadesi yarın doluyor.</p>
                <button class="mt-1 text-xs font-bold text-primary hover:underline">Faturayı Görüntüle</button>
              </div>
            </div>
            
            <div class="flex items-start gap-4 rounded-lg p-2 transition-colors hover:bg-slate-50">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                <span className="material-symbols-outlined">error</span>
              </div>
              <div>
                <p class="text-sm font-medium text-slate-800">INV-2024-006 faturası gecikmeye düştü.</p>
                <button class="mt-1 text-xs font-bold text-primary hover:underline">İşlem Yap</button>
              </div>
            </div>

             <div class="flex items-start gap-4 rounded-lg p-2 transition-colors hover:bg-slate-50">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                <span className="material-symbols-outlined">check_circle</span>
              </div>
              <div>
                <p class="text-sm font-medium text-slate-800">Teknoloji A.Ş. ₺5,000.00 tutarındaki ödemeyi yaptı.</p>
                <p class="mt-1 text-xs text-slate-500">1 saat önce</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};