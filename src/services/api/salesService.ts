import api from './api';
import { Sale, SaleItem, PaymentMethod } from '@/types/sale';

// Interface para os dados da venda
interface SaleData {
  items: SaleItem[];
  total: number;
  paymentMethod: PaymentMethod;
  cashReceived?: number;
  change?: number;
}

// Função para adaptar o formato da venda vinda da API
function adaptSaleFormat(apiSale: any): Sale {
  return {
    id: apiSale.id.toString(),
    items: apiSale.items.map((item: any) => ({
      productId: item.product_id.toString(),
      productName: item.product_name,
      quantity: item.quantity,
      unitPrice: parseFloat(item.unit_price),
      totalPrice: parseFloat(item.total_price)
    })),
    total: parseFloat(apiSale.total),
    paymentMethod: apiSale.payment_method as PaymentMethod,
    cashReceived: apiSale.cash_received ? parseFloat(apiSale.cash_received) : undefined,
    change: apiSale.change_amount ? parseFloat(apiSale.change_amount) : undefined,
    createdAt: apiSale.created_at,
    status: apiSale.status
  };
}

export const salesService = {
  // Registrar uma nova venda
  async createSale(saleData: SaleData): Promise<Sale> {
    try {
      console.log("Tentando registrar venda:", saleData);
      
      // Garantir que o método de pagamento seja válido
      const paymentMethod = saleData.paymentMethod || 'cash';
      
      // Formatar dados para a API
      const apiData = {
        items: saleData.items.map(item => ({
          product_id: item.productId,
          product_name: item.productName,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          total_price: item.totalPrice
        })),
        total: saleData.total,
        payment_method: paymentMethod, // Usar o valor validado
        cash_received: saleData.cashReceived,
        change_amount: saleData.change
      };
      
      console.log("Dados formatados para API:", apiData);
      
      try {
        // Tenta enviar para a API
        const response = await api.post('/sales', apiData);
        console.log("Venda registrada com sucesso:", response.data);
        return adaptSaleFormat(response.data);
      } catch (error) {
        console.error("Erro ao registrar venda na API:", error);
        
        // Modo fallback: salva localmente
        const mockSale: Sale = {
          id: `local-${Date.now()}`,
          items: saleData.items,
          total: saleData.total,
          paymentMethod: saleData.paymentMethod,
          cashReceived: saleData.cashReceived,
          change: saleData.change,
          createdAt: new Date().toISOString(),
          status: 'completed'
        };
        
        // Salva no localStorage
        const savedSales = JSON.parse(localStorage.getItem('sales') || '[]');
        savedSales.push(mockSale);
        localStorage.setItem('sales', JSON.stringify(savedSales));
        
        return mockSale;
      }
    } catch (error) {
      console.error("Erro ao processar venda:", error);
      throw error;
    }
  },

  // Buscar histórico de vendas
  async getSales(startDate?: string, endDate?: string): Promise<Sale[]> {
    try {
      let url = '/sales';
      const params: Record<string, string> = {};
      
      if (startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      }
      
      try {
        // Tenta buscar da API
        const response = await api.get(url, { params });
        console.log("Vendas obtidas da API:", response.data);
        
        // Adapta o formato das vendas
        return response.data.map(adaptSaleFormat);
      } catch (error) {
        console.error("Erro ao buscar vendas da API:", error);
        
        // Modo fallback: busca do localStorage
        const savedSales = JSON.parse(localStorage.getItem('sales') || '[]');
        
        // Filtra por data se necessário
        if (startDate && endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);
          end.setHours(23, 59, 59); // Ajusta para o final do dia
          
          return savedSales.filter((sale: Sale) => {
            const saleDate = new Date(sale.createdAt);
            return saleDate >= start && saleDate <= end;
          });
        }
        
        return savedSales;
      }
    } catch (error) {
      console.error("Erro ao buscar histórico de vendas:", error);
      return [];
    }
  },

  // Buscar detalhes de uma venda específica
  async getSaleById(id: string): Promise<Sale> {
    try {
      try {
        // Tenta buscar da API
        const response = await api.get(`/sales/${id}`);
        console.log(`Venda ${id} obtida da API:`, response.data);
        return adaptSaleFormat(response.data);
      } catch (error) {
        console.error(`Erro ao buscar venda ${id} da API:`, error);
        
        // Modo fallback: busca do localStorage
        const savedSales = JSON.parse(localStorage.getItem('sales') || '[]');
        const sale = savedSales.find((s: Sale) => s.id === id);
        
        if (sale) return sale;
        throw new Error(`Venda com ID ${id} não encontrada`);
      }
    } catch (error) {
      console.error(`Erro ao buscar venda com ID ${id}:`, error);
      throw error;
    }
  }
};
