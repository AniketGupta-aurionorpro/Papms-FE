export interface VendorRequest {
  vendorName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  accountHolderName: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
}

export interface VendorResponse {
  id: number;
  vendorName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  isActive: boolean;
  organizationId: number;
  accountHolderName: string;
  accountNumber: string;
  bankName: string;
  ifscCode: string;
}
