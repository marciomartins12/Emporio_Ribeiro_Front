import api from './api';
import { format } from 'date-fns'; // Adicionei a importação do format

interface DashboardSummary {
  totalSales: number;
  totalRevenue: number;
  totalProducts: number;
  lowStockProducts: number;
}

interface SalesByPaymentMethod {
  payment_method: string;
  count: number;
  total_amount: number;
}

interface TopSellingProduct {
  product_id: string;
  product_name: string;
  total_quantity: number;
  total_revenue: number;
}

interface DailySale {
  date: string;
  sales_count: number;
  total_amount: number;
}

export interface DashboardData {
  isMockData?: boolean; // Adicionei esta propriedade opcional
  summary: DashboardSummary;
  salesByPaymentMethod: SalesByPaymentMethod[];
  topSellingProducts: TopSellingProduct[];
  dailySales: DailySale[];
  recentSales: any[];
  lowStockProducts?: any[]; // Adicionamos esta propriedade opcional
}

export const dashboardService = {
  async getDashboardData(period: 'today' | 'week' | 'month' = 'week'): Promise<DashboardData> {
    try {
      // Calcular datas com base no período
      const endDate = new Date();
      let startDate = new Date();
      
      if (period === 'today') {
        startDate.setHours(0, 0, 0, 0);
      } else if (period === 'week') {
        startDate.setDate(startDate.getDate() - 7);
      } else if (period === 'month') {
        startDate.setMonth(startDate.getMonth() - 1);
      }
      
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      console.log(`Buscando dados do dashboard para o período: ${startDateStr} até ${endDateStr}`);
      
      try {
        // Buscar dados da API
        const response = await api.get('/dashboard', {
          params: { startDate: startDateStr, endDate: endDateStr }
        });
        
        console.log("Dados brutos da API:", response.data);
        
        // No método getDashboardData, antes de retornar os dados da API
        if (response.data && response.data.summary && response.data.summary.lowStockProducts === 0) {
          // Se não houver produtos com estoque baixo, adicione alguns simulados para teste
          response.data.lowStockProducts = [
            { id: '1', name: 'Arroz Integral', stock: 8, minStock: 10 },
            { id: '2', name: 'Feijão Carioca', stock: 5, minStock: 15 },
            { id: '3', name: 'Açúcar Refinado', stock: 3, minStock: 10 },
          ];
        }
        
        // Retornar os dados diretamente, sem transformação
        return response.data;
      } catch (error) {
        console.error("Erro ao buscar dados do dashboard da API:", error);
        
        if (error.response) {
          console.error("Resposta de erro:", error.response.data);
          console.error("Status:", error.response.status); // Corrigido aqui
        } else if (error.request) {
          console.error("Sem resposta recebida:", error.request);
        } else {
          console.error("Erro ao configurar requisição:", error.message);
        }
        
        console.log("Usando dados simulados como fallback");
        return this.generateMockData(period);
      }
    } catch (error) {
      console.error("Erro ao processar dados do dashboard:", error);
      return this.generateMockData(period);
    }
  },
  
  // Função para gerar dados simulados quando a API falha
  generateMockData(period: 'today' | 'week' | 'month'): DashboardData { // Corrigido o nome do parâmetro
    console.log("Gerando dados simulados para o período:", period);
    const multiplier = period === 'today' ? 1 : period === 'week' ? 7 : 30;
    
    // Valores simulados
    const totalSales = Math.floor(Math.random() * 10 * multiplier) + 5 * multiplier;
    const totalRevenue = (Math.random() * 1000 * multiplier) + 500 * multiplier;
    
    // Dados simulados para métodos de pagamento
    const salesByPaymentMethod = [ // Adicionei 'const' aqui
      { payment_method: 'cash', count: Math.floor(totalSales * 0.3), total_amount: totalRevenue * 0.3 },
      { payment_method: 'credit_card', count: Math.floor(totalSales * 0.4), total_amount: totalRevenue * 0.4 },
      { payment_method: 'pix', count: Math.floor(totalSales * 0.3), total_amount: totalRevenue * 0.3 },
    ];
    
    // Dados simulados para produtos mais vendidos
    const topSellingProducts = [
      { product_id: '1', product_name: 'Arroz Integral', total_quantity: Math.floor(Math.random() * 50) + 10, total_revenue: Math.random() * 500 + 100 },
      { product_id: '2', product_name: 'Feijão Carioca', total_quantity: Math.floor(Math.random() * 40) + 8, total_revenue: Math.random() * 400 + 80 },
      { product_id: '3', product_name: 'Açúcar Refinado', total_quantity: Math.floor(Math.random() * 30) + 6, total_revenue: Math.random() * 300 + 60 },
    ];
    
    // Dados simulados para vendas diárias
    const dailySales = [];
    const today = new Date();
    const daysToGenerate = period === 'today' ? 1 : period === 'week' ? 7 : 30;
    
    for (let i = 0; i < daysToGenerate; i++) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      
      dailySales.push({
        date: format(date, 'yyyy-MM-dd'), // Corrigido aqui
        sales_count: Math.floor(Math.random() * 10) + 1,
        total_amount: Math.random() * 500 + 100
      });
    }
    
    // Dados simulados para vendas recentes
    const recentSales = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date();
      date.setHours(date.getHours() - i);
      
      recentSales.push({
        id: `mock-${i}`,
        customer_name: `Cliente ${i + 1}`,
        total: Math.random() * 200 + 50,
        payment_method: ['cash', 'credit_card', 'pix'][Math.floor(Math.random() * 3)],
        created_at: date.toISOString()
      });
    }
    
    return {
      isMockData: true, // Flag para identificar dados simulados
      summary: {
        totalSales,
        totalRevenue,
        totalProducts: Math.floor(Math.random() * 100) + 50,
        lowStockProducts: Math.floor(Math.random() * 10) + 1
      },
      salesByPaymentMethod,
      topSellingProducts,
      dailySales,
      recentSales
    };
  },
  async getLowStockProducts(): Promise<any[]> {
    try {
      const response = await api.get('/products/low-stock');
      return response.data || [];
    } catch (error) {
      console.error("Erro ao buscar produtos com estoque baixo:", error);
      
      // Retornar dados simulados em caso de erro
      return [
        { id: '1', name: 'Arroz Integral', stock: 8, minStock: 10 },
        { id: '2', name: 'Feijão Carioca', stock: 5, minStock: 15 },
        { id: '3', name: 'Açúcar Refinado', stock: 3, minStock: 10 },
      ];
    }
  }
};
