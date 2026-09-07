export type CustomerRiskLevel = 'low' | 'medium' | 'high';
export type ReconciliationStatus = 'agreed' | 'disputed' | 'pending';

export interface Customer {
    id?: string;
    name: string;
    email: string;
    phone: string;
    country: string;
    address?: string;
    taxId?: string;
    taxOffice?: string;
    notes?: string;
    userId: string;
    createdAt?: Date;
    updatedAt?: Date;

    // Cari Hesap & Risk & Mutabakat alanları
    balance?: number;               // Pozitif: Alacağımız, 0: Kapalı, Negatif: Borcumuz
    creditLimit?: number;          // Müşteri Kredi / Risk Limiti
    totalInvoiced?: number;        // Müşteriye kesilen toplam fatura tutarı
    riskScore?: number;            // 0 (Çok Güvenli) - 100 (Çok Riskli)
    riskLevel?: CustomerRiskLevel; // low, medium, high
    riskReason?: string;           // Risk açıklama notu
    reconciliationStatus?: ReconciliationStatus; // agreed, disputed, pending
    reconciliationDate?: string;   // Son mutabakat tarihi
    reconciliationNotes?: string;  // Mutabakat notu
}

export interface CustomerFormData {
    name: string;
    email: string;
    phone: string;
    country: string;
    address?: string;
    taxId?: string;
    taxOffice?: string;
    notes?: string;
    creditLimit?: number;
    balance?: number;
}
