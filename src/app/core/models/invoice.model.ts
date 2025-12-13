export interface InvoiceItem {
    description: string;
    quantity: number;
    unitPrice: number;
}

export interface Invoice {
    id?: string;
    number: string;
    date: string;
    time: string;
    customerName: string;
    customerTaxId: string;
    customerAddress: string;
    items: InvoiceItem[];
    status: 'Draft' | 'Sent' | 'Paid' | 'Printed';
    
    // Ülke ve vergi bilgileri
    countryCode: string;
    countryName: string;
    currencyCode: string;
    currencySymbol: string;
    taxName: string;
    taxRate: number;
    
    // Hesaplanan değerler
    subtotal: number;
    taxAmount: number;
    total: number;
    
    // Meta bilgiler
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}
