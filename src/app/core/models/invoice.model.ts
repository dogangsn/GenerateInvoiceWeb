export interface InvoiceItem {
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
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
    status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
    notes?: string;
    userId: string;
    createdAt?: Date;
    updatedAt?: Date;
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
    status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
}
