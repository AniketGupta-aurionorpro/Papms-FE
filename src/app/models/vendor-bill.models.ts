export interface VendorBillDto {
  id: number;
  billNumber: string;
  vendorPaymentId: number;
  vendorId: number;
  vendorName: string;
  amount: number;
  billDate: string;
  status: string;
  createdAt: string;
  organizationName: string;
}
