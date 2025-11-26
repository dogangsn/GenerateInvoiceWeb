export enum ViewState {
  COUNTRY_SELECT = 'COUNTRY_SELECT',
  DASHBOARD = 'DASHBOARD',
  INVOICES = 'INVOICES',
  CUSTOMERS = 'CUSTOMERS',
  REPORTS = 'REPORTS',
  CREATE_INVOICE = 'CREATE_INVOICE',
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxes: string[];
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
}

export interface InvoiceDraft {
  id: string;
  title: string;
  tags: { text: string; color: string }[];
  date: string;
  status: 'Taslak' | 'Beklemede' | 'Tamamlandı';
}

export interface RecentActivity {
  id: string;
  invoiceNo: string;
  customer: string;
  date: string;
  amount: string;
  status: 'Ödendi' | 'Bekliyor' | 'Gecikmiş';
}
