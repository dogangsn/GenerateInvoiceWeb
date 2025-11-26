import React from 'react';
import { ViewState } from '../types';

interface CountrySelectProps {
  onSelect: () => void;
}

export const CountrySelect: React.FC<CountrySelectProps> = ({ onSelect }) => {
  const countries = [
    { name: 'Türkiye', flag: 'https://flagcdn.com/w320/tr.png' },
    { name: 'Almanya', flag: 'https://flagcdn.com/w320/de.png' },
    { name: 'Fransa', flag: 'https://flagcdn.com/w320/fr.png' },
    { name: 'Birleşik Krallık', flag: 'https://flagcdn.com/w320/gb.png' },
    { name: 'İspanya', flag: 'https://flagcdn.com/w320/es.png' },
    { name: 'İtalya', flag: 'https://flagcdn.com/w320/it.png' },
    { name: 'Hollanda', flag: 'https://flagcdn.com/w320/nl.png' },
    { name: 'Kanada', flag: 'https://flagcdn.com/w320/ca.png' },
    { name: 'ABD', flag: 'https://flagcdn.com/w320/us.png' },
    { name: 'Avustralya', flag: 'https://flagcdn.com/w320/au.png' },
  ];

  return (
    <div class="min-h-screen w-full bg-white">
      {/* Header */}
      <header class="flex items-center justify-between border-b border-slate-100 px-8 py-4">
        <div class="flex items-center gap-2 text-primary">
            <span className="material-symbols-outlined fill text-3xl">receipt</span>
          <h1 class="text-xl font-bold text-slate-900">Fatura Uygulaması</h1>
        </div>
        <button className="rounded-lg bg-primary px-6 py-2 text-sm font-bold text-white">Giriş Yap</button>
      </header>

      {/* Main Content */}
      <main class="container mx-auto mt-10 max-w-5xl px-4">
        <div class="mb-12 text-center">
          <h2 class="mb-2 text-4xl font-black text-slate-900">İşlem Yapılacak Ülkeyi Seçiniz</h2>
          <p class="text-slate-500">Oluşturulacak fatura, seçtiğiniz ülkenin vergi ve format kurallarına uygun olacaktır.</p>
        </div>

        <div class="mb-8">
          <p class="mb-2 font-medium text-slate-900">Adım 1/3: Ülke Seçimi</p>
          <div class="h-2 w-full rounded-full bg-slate-100">
            <div class="h-2 w-1/3 rounded-full bg-primary"></div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {countries.map((country) => (
            <button
              key={country.name}
              onClick={onSelect}
              class="group flex flex-col items-center gap-3 rounded-xl p-2 transition-all hover:-translate-y-1 hover:bg-slate-50"
            >
              <div
                class="aspect-square w-full rounded-xl bg-cover bg-center shadow-sm transition-shadow group-hover:shadow-md"
                style={{ backgroundImage: `url(${country.flag})` }}
              ></div>
              <span class="font-medium text-slate-800">{country.name}</span>
            </button>
          ))}
        </div>
      </main>
      
      <footer class="mt-20 border-t border-slate-100 py-10 text-center text-sm text-slate-500">
          <div class="mb-4 flex justify-center gap-6">
              <a href="#" class="hover:text-slate-800">Gizlilik Politikası</a>
              <a href="#" class="hover:text-slate-800">Kullanım Koşulları</a>
              <a href="#" class="hover:text-slate-800">Yardım</a>
          </div>
          <p>© Fatura Uygulaması 2024</p>
      </footer>
    </div>
  );
};