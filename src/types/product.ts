
export interface Product {
  id: string;
  name: string;
  barcode: string;
  category: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  minStock?: number;
  imageUrl?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFormData {
  name: string;
  barcode: string;
  category: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  minStock?: number;
  imageUrl?: string;
  description?: string;
}
