export interface InvoiceItem {
    description: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
}

export interface Invoice {
    id: string;
    number: string;
    date: string;
    dueDate: string;
    customerName: string;
    customerTaxId: string;
    customerAddress: string;
    items: InvoiceItem[];
    status: 'Draft' | 'Sent' | 'Paid';
    tags: string[];
}
