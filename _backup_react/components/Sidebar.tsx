import React from 'react';
import { ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onChangeView }) => {
  const navItems = [
    { view: ViewState.DASHBOARD, label: 'Kontrol Paneli', icon: 'dashboard', fill: true },
    { view: ViewState.INVOICES, label: 'Faturalar', icon: 'receipt_long', fill: false },
    { view: ViewState.REPORTS, label: 'Raporlar', icon: 'bar_chart', fill: false }, // Changed to generic bar_chart
    { view: ViewState.CUSTOMERS, label: 'Müşteriler', icon: 'group', fill: false },
  ];

  return (
    <aside class="flex h-screen w-64 flex-col border-r border-slate-200 bg-white p-4 shadow-sm hidden lg:flex">
      {/* User Profile */}
      <div class="mb-8 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
        <img
          src="https://i.pravatar.cc/150?u=Ali"
          alt="User Profile"
          class="h-10 w-10 rounded-full object-cover"
        />
        <div class="flex flex-col">
          <h1 class="text-sm font-bold text-slate-900">Ali Yılmaz</h1>
          <p class="text-xs text-slate-500">ali.yilmaz@sirket.com</p>
        </div>
      </div>

      {/* Navigation */}
      <nav class="flex flex-1 flex-col gap-2">
        {navItems.map((item) => (
          <button
            key={item.view}
            onClick={() => onChangeView(item.view)}
            class={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
              currentView === item.view
                ? 'bg-primary/10 text-primary'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span className={`material-symbols-outlined ${item.fill && currentView === item.view ? 'fill' : ''}`}>
              {item.icon}
            </span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* New Invoice CTA */}
      <div class="mt-auto flex flex-col gap-4">
        <button
          onClick={() => onChangeView(ViewState.CREATE_INVOICE)}
          class="flex h-10 w-full items-center justify-center rounded-lg bg-primary text-sm font-bold text-white shadow-md transition-transform hover:scale-[1.02] hover:bg-blue-700"
        >
           <span className="material-symbols-outlined mr-2 text-[20px]">add_circle</span>
          Yeni Fatura Oluştur
        </button>

        <div class="border-t border-slate-100 pt-4">
          <button class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
            <span className="material-symbols-outlined">settings</span>
            Ayarlar
          </button>
          <button class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
            <span className="material-symbols-outlined">help</span>
            Yardım
          </button>
           <button 
            onClick={() => onChangeView(ViewState.COUNTRY_SELECT)}
            class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
           >
            <span className="material-symbols-outlined">logout</span>
            Çıkış Yap
          </button>
        </div>
      </div>
    </aside>
  );
};