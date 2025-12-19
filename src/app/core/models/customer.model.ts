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
}
