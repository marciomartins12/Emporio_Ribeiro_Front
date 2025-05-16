
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
    // Aqui faria a chamada real à API
    // const response = await api.get('/sales', { params: filters });
    // return response.data;
    
    // Mock de dados para testes
    return mockSales;
  } catch (error) {
    console.error('Erro ao buscar vendas:', error);
    throw error;
  }
};

// Obter dados para o dashboard
const getDashboardData = async (): Promise<DashboardData> => {
  try {
    // Aqui faria a chamada real à API
    // const response = await api.get('/dashboard');
    // return response.data;
    
    // Mock de dados para testes
    return getMockDashboardData();
  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    throw error;
  }
};

// Registrar uma nova venda
const createSale = async (sale: Omit<Sale, 'id' | 'createdAt' | 'updatedAt'>): Promise<Sale> => {
  try {
    // Aqui faria a chamada real à API
    // const response = await api.post('/sales', sale);
    // return response.data;
    
    // Mock para testes
    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      ...sale,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return Promise.resolve(newSale);
  } catch (error) {
    console.error('Erro ao registrar venda:', error);
    throw error;
  }
};

// Mock de vendas para testes
const mockSales: Sale[] = [
  {
    id: '1',
    items: [
      {
        productId: '1',
        productName: 'Arroz Integral',
        quantity: 2,
        unitPrice: 18.90,
        totalPrice: 37.80,
      },
      {
        productId: '3',
        productName: 'Óleo de Soja',
        quantity: 1,
        unitPrice: 9.75,
        totalPrice: 9.75,
      }
    ],
    total: 47.55,
    paymentMethod: 'credit_card',
    createdAt: '2023-08-15T14:30:00Z',
    updatedAt: '2023-08-15T14:30:00Z'
  },
  {
    id: '2',
    items: [
      {
        productId: '2',
        productName: 'Feijão Carioca',
        quantity: 3,
        unitPrice: 12.90,
        totalPrice: 38.70,
      }
    ],
    total: 38.70,
    paymentMethod: 'cash',
    cashReceived: 50.00,
    change: 11.30,
    createdAt: '2023-08-16T10:15:00Z',
    updatedAt: '2023-08-16T10:15:00Z'
  },
  {
    id: '3',
    items: [
      {
        productId: '4',
        productName: 'Café Tradicional',
        quantity: 2,
        unitPrice: 22.50,
        totalPrice: 45.00,
      },
      {
        productId: '5',
        productName: 'Açúcar Refinado',
        quantity: 1,
        unitPrice: 6.90,
        totalPrice: 6.90,
      }
    ],
    total: 51.90,
    paymentMethod: 'pix',
    createdAt: '2023-08-16T16:45:00Z',
    updatedAt: '2023-08-16T16:45:00Z'
  }
];

export const salesService = {
  getSales,
  getDashboardData,
  createSale,
};
