export type ExpenseCategory =
    | 'food'
    | 'transport'
    | 'fuel'
    | 'office'
    | 'utilities'
    | 'software'
    | 'marketing'
    | 'travel'
    | 'consulting'
    | 'salary'
    | 'tax'
    | 'rent'
    | 'other';

export type PaymentMethod = 'credit_card' | 'cash' | 'bank_transfer' | 'company_card' | 'other';

export interface Expense {
    id: string;
    userId?: string;
    title: string;
    category: ExpenseCategory;
    date: string | Date;
    amount: number;
    taxRate: number;
    taxAmount: number;
    isTaxInclusive?: boolean;
    subtotal?: number;
    currency?: string;
    paymentMethod: PaymentMethod;
    receiptImage?: string; // Base64 data URL or storage URL
    receiptUrl?: string; // alias
    supplierName?: string;
    merchantName?: string; // alias
    notes?: string;
    description?: string; // alias
    approvalStatus?: 'pending_approval' | 'approved' | 'rejected';
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ExpenseFormData {
    title?: string;
    merchantName?: string;
    category: ExpenseCategory;
    date: string;
    amount: number;
    taxRate: number;
    taxAmount?: number;
    isTaxInclusive?: boolean;
    subtotal?: number;
    currency?: string;
    paymentMethod: PaymentMethod;
    receiptImage?: string;
    receiptUrl?: string; // alias
    supplierName?: string;
    notes?: string;
    description?: string;
}

