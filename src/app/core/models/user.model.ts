export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    photoURL: string | null;
    phoneNumber: string | null;
    companyName: string | null;
    companyAddress: string | null;
    taxId: string | null;
    taxOffice: string | null;
    country: string | null;
    createdAt: Date;
    updatedAt: Date;
}

