
import api from "./api";
import { Sale, SaleFilter } from "@/types/sale";

// Type definitions for dashboard data
export interface DashboardData {
  totalSales: number;
  totalRevenue: number;
  totalProducts: number;
  lowStockProducts: number;
  salesByDay: {
    labels: string[];
    data: number[];
  };
}

// Simulação de dados para o dashboard (mock)
const getMockDashboardData = (): Promise<DashboardData> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        totalSales: 158,
        totalRevenue: 15890.75,
        totalProducts: 237,
        lowStockProducts: 12,
        salesByDay: {
          labels: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
          data: [2100, 3200, 2800, 4100, 2700, 3400, 2200],
        },
      });
    }, 500);
  });
};

// Buscar vendas com filtros
const getSales = async (filters?: SaleFilter): Promise<Sale[]> => {
  try {
    
     const response = await api.get('/sales', { params: filters });
     return response.data;
    
    
  } catch (error) {
    console.error('Erro ao buscar vendas:', error);
    throw error;
  }
};

// Obter dados para o dashboard
const getDashboardData = async (): Promise<DashboardData> => {
  try {
    
     const response = await api.get('/dashboard');
     return response.data;
    
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    throw error;
  }
};

// Registrar uma nova venda
const createSale = async (sale: Omit<Sale, 'id' | 'createdAt' | 'updatedAt'>): Promise<Sale> => {
  try {
    
   const response = await api.post('/sales', sale);
    return response.data;
    
   
  } catch (error) {
    console.error('Erro ao registrar venda:', error);
    throw error;
  }
};



export const salesService = {
  getSales,
  getDashboardData,
  createSale,
};
