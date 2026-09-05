export interface InvoiceItem {
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate?: number;
    discount?: number;
    total?: number;
}

export interface Invoice {
    id?: string;
    invoiceNo: string;
    date: Date | string;
    dueDate: Date | string;
    customerId?: string;
    customerName: string;
    customerEmail?: string;
    customerTaxId?: string;
    customerAddress?: string;
    items: InvoiceItem[];
    subtotal: number;
    taxTotal: number;
    total: number;
    status: 'draft' | 'sent' | 'pending' | 'paid' | 'overdue' | 'cancelled';
    notes?: string;
    userId: string;
    createdAt?: Date;
    updatedAt?: Date;
    // New fields
    invoiceType?: 'commercial' | 'proforma';
    countryCode?: string;
    taxLabel?: string;
    taxRate?: number;
    additionalTaxes?: { name: string; rate: number }[];
}

export interface InvoiceFormData {
    invoiceNo: string;
    date: string;
    dueDate: string;
    customerId?: string;
    customerName: string;
    customerEmail?: string;
    customerTaxId?: string;
    customerAddress?: string;
    items: InvoiceItem[];
    notes?: string;
    status: 'draft' | 'sent' | 'pending' | 'paid' | 'overdue' | 'cancelled';
    // New fields
    invoiceType?: 'commercial' | 'proforma';
    countryCode?: string;
    taxLabel?: string;
    taxRate?: number;
    additionalTaxes?: { name: string; rate: number }[];
}
