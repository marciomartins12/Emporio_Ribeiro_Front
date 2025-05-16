
import api from './api';
import { DashboardData } from './salesService';

export const dashboardService = {
  // Get all dashboard data in one call
  getDashboardData: async (): Promise<DashboardData> => {
    const response = await api.get('/dashboard');
    return response.data;
  },

  // Individual data endpoints
  getSummary: async (): Promise<{
    totalSales: number;
    totalRevenue: number;
    totalProducts: number;
    lowStockProducts: number;
  }> => {
    const response = await api.get('/dashboard/summary');
    return response.data;
  },

  getWeeklySales: async (): Promise<{
    labels: string[];
    data: number[];
  }> => {
    const response = await api.get('/dashboard/weekly-sales');
    return response.data;
  },

  getTopProducts: async (): Promise<{
    id: string;
    name: string;
    quantity: number;
  }[]> => {
    const response = await api.get('/dashboard/top-products');
    return response.data;
  }
};
