export interface TaxRateOption {
    rate: number;
    label: string;
}

export interface CountryConfig {
    code: string;
    nameKey: string;
    defaultName: string;
    flag: string;
    flagUrl: string;
    taxLabel: string;
    defaultRate: number;
    currency: string;
    currencySymbol: string;
    rates: TaxRateOption[];
}

export const COUNTRIES_CONFIG: CountryConfig[] = [
    {
        code: 'TR',
        nameKey: 'countries.turkey',
        defaultName: 'Türkiye',
        flag: '🇹🇷',
        flagUrl: 'https://flagcdn.com/w80/tr.png',
        taxLabel: 'KDV',
        defaultRate: 20,
        currency: 'TRY',
        currencySymbol: '₺',
        rates: [
            { rate: 20, label: '%20 (Standart KDV)' },
            { rate: 10, label: '%10 (İndirimli - Gıda, Turizm, Tıp vb.)' },
            { rate: 1, label: '%1 (Temel İhtiyaç / Tarım)' },
            { rate: 0, label: '%0 (KDV Muafiyeti / İhracat)' }
        ]
    },
    {
        code: 'AE',
        nameKey: 'countries.dubai',
        defaultName: 'Dubai (BAE)',
        flag: '🇦🇪',
        flagUrl: 'https://flagcdn.com/w80/ae.png',
        taxLabel: 'VAT',
        defaultRate: 5,
        currency: 'AED',
        currencySymbol: 'AED',
        rates: [
            { rate: 5, label: '%5 (Standart VAT)' },
            { rate: 0, label: '%0 (Sıfır Oran / Zero-Rated & Muaf)' }
        ]
    },
    {
        code: 'DE',
        nameKey: 'countries.germany',
        defaultName: 'Almanya',
        flag: '🇩🇪',
        flagUrl: 'https://flagcdn.com/w80/de.png',
        taxLabel: 'MwSt',
        defaultRate: 19,
        currency: 'EUR',
        currencySymbol: '€',
        rates: [
            { rate: 19, label: '%19 (Regelsteuersatz - Standart)' },
            { rate: 7, label: '%7 (Ermäßigter Satz - İndirimli)' },
            { rate: 0, label: '%0 (Steuerfrei - Muaf)' }
        ]
    },
    {
        code: 'FR',
        nameKey: 'countries.france',
        defaultName: 'Fransa',
        flag: '🇫🇷',
        flagUrl: 'https://flagcdn.com/w80/fr.png',
        taxLabel: 'TVA',
        defaultRate: 20,
        currency: 'EUR',
        currencySymbol: '€',
        rates: [
            { rate: 20, label: '%20 (Taux Normal - Standart)' },
            { rate: 10, label: '%10 (Taux Intermédiaire - Ara Oran)' },
            { rate: 5.5, label: '%5.5 (Taux Réduit - İndirimli)' },
            { rate: 2.1, label: '%2.1 (Taux Particulier - Özel)' },
            { rate: 0, label: '%0 (Exonéré - Muaf)' }
        ]
    },
    {
        code: 'UK',
        nameKey: 'countries.uk',
        defaultName: 'Birleşik Krallık',
        flag: '🇬🇧',
        flagUrl: 'https://flagcdn.com/w80/gb.png',
        taxLabel: 'VAT',
        defaultRate: 20,
        currency: 'GBP',
        currencySymbol: '£',
        rates: [
            { rate: 20, label: '%20 (Standard Rate)' },
            { rate: 5, label: '%5 (Reduced Rate)' },
            { rate: 0, label: '%0 (Zero-Rated / Exempt)' }
        ]
    },
    {
        code: 'ES',
        nameKey: 'countries.spain',
        defaultName: 'İspanya',
        flag: '🇪🇸',
        flagUrl: 'https://flagcdn.com/w80/es.png',
        taxLabel: 'IVA',
        defaultRate: 21,
        currency: 'EUR',
        currencySymbol: '€',
        rates: [
            { rate: 21, label: '%21 (Tipo General - Standart)' },
            { rate: 10, label: '%10 (Tipo Reducido - İndirimli)' },
            { rate: 4, label: '%4 (Tipo Superreducido - Süper İndirimli)' },
            { rate: 0, label: '%0 (Exento - Muaf)' }
        ]
    },
    {
        code: 'IT',
        nameKey: 'countries.italy',
        defaultName: 'İtalya',
        flag: '🇮🇹',
        flagUrl: 'https://flagcdn.com/w80/it.png',
        taxLabel: 'IVA',
        defaultRate: 22,
        currency: 'EUR',
        currencySymbol: '€',
        rates: [
            { rate: 22, label: '%22 (Aliquota Ordinaria - Standart)' },
            { rate: 10, label: '%10 (Aliquota Ridotta - İndirimli)' },
            { rate: 5, label: '%5 (Aliquota Ridotta - Özel)' },
            { rate: 4, label: '%4 (Aliquota Minima - Minimum)' },
            { rate: 0, label: '%0 (Esente - Muaf)' }
        ]
    },
    {
        code: 'NL',
        nameKey: 'countries.netherlands',
        defaultName: 'Hollanda',
        flag: '🇳🇱',
        flagUrl: 'https://flagcdn.com/w80/nl.png',
        taxLabel: 'BTW',
        defaultRate: 21,
        currency: 'EUR',
        currencySymbol: '€',
        rates: [
            { rate: 21, label: '%21 (Algemeen Tarief - Standart)' },
            { rate: 9, label: '%9 (Verlaagd Tarief - İndirimli)' },
            { rate: 0, label: '%0 (Vrijgesteld - Muaf)' }
        ]
    },
    {
        code: 'CA',
        nameKey: 'countries.canada',
        defaultName: 'Kanada',
        flag: '🇨🇦',
        flagUrl: 'https://flagcdn.com/w80/ca.png',
        taxLabel: 'GST/HST',
        defaultRate: 5,
        currency: 'CAD',
        currencySymbol: 'CA$',
        rates: [
            { rate: 5, label: '%5 (Federal GST)' },
            { rate: 0, label: '%0 (Zero-Rated - Muaf)' }
        ]
    },
    {
        code: 'US',
        nameKey: 'countries.usa',
        defaultName: 'ABD',
        flag: '🇺🇸',
        flagUrl: 'https://flagcdn.com/w80/us.png',
        taxLabel: 'Sales Tax',
        defaultRate: 0,
        currency: 'USD',
        currencySymbol: '$',
        rates: [
            { rate: 0, label: '%0 (Vergisiz / Muaf)' },
            { rate: 5, label: '%5 (Eyalet Ortalaması)' },
            { rate: 6, label: '%6 (Eyalet Ortalaması)' },
            { rate: 7, label: '%7 (Eyalet Ortalaması)' },
            { rate: 8.875, label: '%8.875 (NYC Oranı)' }
        ]
    },
    {
        code: 'AU',
        nameKey: 'countries.australia',
        defaultName: 'Avustralya',
        flag: '🇦🇺',
        flagUrl: 'https://flagcdn.com/w80/au.png',
        taxLabel: 'GST',
        defaultRate: 10,
        currency: 'AUD',
        currencySymbol: 'A$',
        rates: [
            { rate: 10, label: '%10 (Standard GST)' },
            { rate: 0, label: '%0 (GST-Free - Muaf)' }
        ]
    }
];

export const COUNTRY_MAP: { [code: string]: CountryConfig } = COUNTRIES_CONFIG.reduce((acc, curr) => {
    acc[curr.code] = curr;
    return acc;
}, {} as { [code: string]: CountryConfig });
