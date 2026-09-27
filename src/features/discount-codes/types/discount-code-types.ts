export type OrderDiscountType = 'Percentage' | 'FixedAmount';
export type OrderDiscountScope = 'ProductsOnly' | 'DeliveryOnly' | 'EntireOrder';
export type DiscountCodeAdminStatus = 'Active' | 'Expired' | 'Disabled';

export interface DiscountCodeRequest {
  code: string;
  discountType: OrderDiscountType;
  scope: OrderDiscountScope;
  value: number;
  expiresAt: string;
  isEnabled: boolean;
}

export interface DiscountCode {
  id: string;
  code: string;
  discountType: OrderDiscountType;
  scope: OrderDiscountScope;
  value: number;
  expiresAt: string;
  isEnabled: boolean;
  status: DiscountCodeAdminStatus;
  createdAt: string;
  updatedAt: string;
}
