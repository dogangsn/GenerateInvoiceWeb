export interface TaxRate {
    name: string;           // Vergi adı (KDV, VAT, GST, etc.)
    rate: number;           // Vergi oranı (%)
    isDefault: boolean;     // Varsayılan vergi mi?
}

export interface Country {
    code: string;           // ISO kodu (TR, DE, US, etc.)
    name: string;           // Ülke adı
    flag: string;           // Emoji bayrak
    currency: {
        code: string;       // Para birimi kodu (TRY, EUR, USD, etc.)
        symbol: string;     // Para birimi simgesi (₺, €, $, etc.)
        name: string;       // Para birimi adı
    };
    taxes: TaxRate[];       // Vergi oranları listesi
    invoicePrefix: string;  // Fatura numarası öneki
    dateFormat: string;     // Tarih formatı
    decimalSeparator: string;   // Ondalık ayırıcı
    thousandSeparator: string;  // Binlik ayırıcı
    taxIdLabel: string;     // Vergi numarası etiketi
    taxIdFormat: string;    // Vergi numarası formatı (regex)
    rules: {
        requireTaxId: boolean;      // Vergi numarası zorunlu mu?
        requireAddress: boolean;    // Adres zorunlu mu?
        allowMultipleTaxes: boolean; // Çoklu vergi uygulanabilir mi?
    };
}

// Desteklenen ülkeler
export const COUNTRIES: Country[] = [
    {
        code: 'TR',
        name: 'Türkiye',
        flag: '🇹🇷',
        currency: { code: 'TRY', symbol: '₺', name: 'Türk Lirası' },
        taxes: [
            { name: 'KDV', rate: 20, isDefault: true },
            { name: 'KDV', rate: 10, isDefault: false },
            { name: 'KDV', rate: 1, isDefault: false },
            { name: 'ÖTV', rate: 0, isDefault: false },
        ],
        invoicePrefix: 'TR',
        dateFormat: 'dd/MM/yyyy',
        decimalSeparator: ',',
        thousandSeparator: '.',
        taxIdLabel: 'Vergi Numarası',
        taxIdFormat: '^[0-9]{10,11}$',
        rules: {
            requireTaxId: true,
            requireAddress: true,
            allowMultipleTaxes: true,
        }
    },
    {
        code: 'DE',
        name: 'Almanya',
        flag: '🇩🇪',
        currency: { code: 'EUR', symbol: '€', name: 'Euro' },
        taxes: [
            { name: 'MwSt', rate: 19, isDefault: true },
            { name: 'MwSt', rate: 7, isDefault: false },
            { name: 'MwSt', rate: 0, isDefault: false },
        ],
        invoicePrefix: 'DE',
        dateFormat: 'dd.MM.yyyy',
        decimalSeparator: ',',
        thousandSeparator: '.',
        taxIdLabel: 'USt-IdNr',
        taxIdFormat: '^DE[0-9]{9}$',
        rules: {
            requireTaxId: true,
            requireAddress: true,
            allowMultipleTaxes: false,
        }
    },
    {
        code: 'FR',
        name: 'Fransa',
        flag: '🇫🇷',
        currency: { code: 'EUR', symbol: '€', name: 'Euro' },
        taxes: [
            { name: 'TVA', rate: 20, isDefault: true },
            { name: 'TVA', rate: 10, isDefault: false },
            { name: 'TVA', rate: 5.5, isDefault: false },
            { name: 'TVA', rate: 2.1, isDefault: false },
        ],
        invoicePrefix: 'FR',
        dateFormat: 'dd/MM/yyyy',
        decimalSeparator: ',',
        thousandSeparator: ' ',
        taxIdLabel: 'Numéro TVA',
        taxIdFormat: '^FR[0-9A-Z]{2}[0-9]{9}$',
        rules: {
            requireTaxId: true,
            requireAddress: true,
            allowMultipleTaxes: false,
        }
    },
    {
        code: 'GB',
        name: 'Birleşik Krallık',
        flag: '🇬🇧',
        currency: { code: 'GBP', symbol: '£', name: 'İngiliz Sterlini' },
        taxes: [
            { name: 'VAT', rate: 20, isDefault: true },
            { name: 'VAT', rate: 5, isDefault: false },
            { name: 'VAT', rate: 0, isDefault: false },
        ],
        invoicePrefix: 'UK',
        dateFormat: 'dd/MM/yyyy',
        decimalSeparator: '.',
        thousandSeparator: ',',
        taxIdLabel: 'VAT Number',
        taxIdFormat: '^GB[0-9]{9}$',
        rules: {
            requireTaxId: false,
            requireAddress: true,
            allowMultipleTaxes: false,
        }
    },
    {
        code: 'US',
        name: 'Amerika Birleşik Devletleri',
        flag: '🇺🇸',
        currency: { code: 'USD', symbol: '$', name: 'Amerikan Doları' },
        taxes: [
            { name: 'Sales Tax', rate: 0, isDefault: true },
            { name: 'Sales Tax', rate: 6, isDefault: false },
            { name: 'Sales Tax', rate: 7.25, isDefault: false },
            { name: 'Sales Tax', rate: 8.875, isDefault: false },
        ],
        invoicePrefix: 'US',
        dateFormat: 'MM/dd/yyyy',
        decimalSeparator: '.',
        thousandSeparator: ',',
        taxIdLabel: 'EIN / Tax ID',
        taxIdFormat: '^[0-9]{2}-[0-9]{7}$',
        rules: {
            requireTaxId: false,
            requireAddress: true,
            allowMultipleTaxes: true,
        }
    },
    {
        code: 'ES',
        name: 'İspanya',
        flag: '🇪🇸',
        currency: { code: 'EUR', symbol: '€', name: 'Euro' },
        taxes: [
            { name: 'IVA', rate: 21, isDefault: true },
            { name: 'IVA', rate: 10, isDefault: false },
            { name: 'IVA', rate: 4, isDefault: false },
        ],
        invoicePrefix: 'ES',
        dateFormat: 'dd/MM/yyyy',
        decimalSeparator: ',',
        thousandSeparator: '.',
        taxIdLabel: 'NIF/CIF',
        taxIdFormat: '^[A-Z][0-9]{8}$',
        rules: {
            requireTaxId: true,
            requireAddress: true,
            allowMultipleTaxes: false,
        }
    },
    {
        code: 'IT',
        name: 'İtalya',
        flag: '🇮🇹',
        currency: { code: 'EUR', symbol: '€', name: 'Euro' },
        taxes: [
            { name: 'IVA', rate: 22, isDefault: true },
            { name: 'IVA', rate: 10, isDefault: false },
            { name: 'IVA', rate: 5, isDefault: false },
            { name: 'IVA', rate: 4, isDefault: false },
        ],
        invoicePrefix: 'IT',
        dateFormat: 'dd/MM/yyyy',
        decimalSeparator: ',',
        thousandSeparator: '.',
        taxIdLabel: 'Partita IVA',
        taxIdFormat: '^IT[0-9]{11}$',
        rules: {
            requireTaxId: true,
            requireAddress: true,
            allowMultipleTaxes: false,
        }
    },
    {
        code: 'NL',
        name: 'Hollanda',
        flag: '🇳🇱',
        currency: { code: 'EUR', symbol: '€', name: 'Euro' },
        taxes: [
            { name: 'BTW', rate: 21, isDefault: true },
            { name: 'BTW', rate: 9, isDefault: false },
            { name: 'BTW', rate: 0, isDefault: false },
        ],
        invoicePrefix: 'NL',
        dateFormat: 'dd-MM-yyyy',
        decimalSeparator: ',',
        thousandSeparator: '.',
        taxIdLabel: 'BTW-nummer',
        taxIdFormat: '^NL[0-9]{9}B[0-9]{2}$',
        rules: {
            requireTaxId: true,
            requireAddress: true,
            allowMultipleTaxes: false,
        }
    },
    {
        code: 'CA',
        name: 'Kanada',
        flag: '🇨🇦',
        currency: { code: 'CAD', symbol: 'C$', name: 'Kanada Doları' },
        taxes: [
            { name: 'GST', rate: 5, isDefault: true },
            { name: 'HST', rate: 13, isDefault: false },
            { name: 'PST', rate: 7, isDefault: false },
            { name: 'QST', rate: 9.975, isDefault: false },
        ],
        invoicePrefix: 'CA',
        dateFormat: 'yyyy-MM-dd',
        decimalSeparator: '.',
        thousandSeparator: ',',
        taxIdLabel: 'GST/HST Number',
        taxIdFormat: '^[0-9]{9}RT[0-9]{4}$',
        rules: {
            requireTaxId: false,
            requireAddress: true,
            allowMultipleTaxes: true,
        }
    },
    {
        code: 'AU',
        name: 'Avustralya',
        flag: '🇦🇺',
        currency: { code: 'AUD', symbol: 'A$', name: 'Avustralya Doları' },
        taxes: [
            { name: 'GST', rate: 10, isDefault: true },
            { name: 'GST', rate: 0, isDefault: false },
        ],
        invoicePrefix: 'AU',
        dateFormat: 'dd/MM/yyyy',
        decimalSeparator: '.',
        thousandSeparator: ',',
        taxIdLabel: 'ABN',
        taxIdFormat: '^[0-9]{11}$',
        rules: {
            requireTaxId: true,
            requireAddress: true,
            allowMultipleTaxes: false,
        }
    },
];

