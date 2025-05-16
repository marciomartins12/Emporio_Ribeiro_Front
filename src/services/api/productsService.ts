
import api from './api';
import { Product } from '@/types/product';

export const productsService = {
  getAll: async (): Promise<Product[]> => {
    const response = await api.get('/products');
    return response.data;
  },

  getById: async (id: string): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  getByBarcode: async (barcode: string): Promise<Product | null> => {
    const response = await api.get(`/products/barcode/${barcode}`);
    return response.data;
  },

  create: async (product: Omit<Product, 'id'>): Promise<Product> => {
    const response = await api.post('/products', product);
    return response.data;
  },

  update: async (id: string, product: Partial<Product>): Promise<Product> => {
    const response = await api.put(`/products/${id}`, product);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  },

  getLowStock: async (): Promise<Product[]> => {
    const response = await api.get('/products/low-stock');
    return response.data;
  }
};
