export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export type PaymentMethod = 'cash' | 'credit_card' | 'pix';

export interface Sale {
  id: string;
  items: SaleItem[];
  total: number;
  paymentMethod: PaymentMethod;
  cashReceived?: number;
  change?: number;
  createdAt: string;
  status: 'completed' | 'cancelled' | 'pending';
}

export interface SaleFilter {
  startDate?: string;
  endDate?: string;
  paymentMethod?: PaymentMethod;
  minValue?: number;
  maxValue?: number;
  page?: number;
  limit?: number;
}
