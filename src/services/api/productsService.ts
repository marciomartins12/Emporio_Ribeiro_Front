import api from './api';
import { Product } from '@/types/product';

// Dados mockados para usar quando a API falhar
const mockProducts: Product[] = [
  {
    id: "1",
    name: "Arroz Integral",
    barcode: "7891234567890",
    category: "Alimentos",
    costPrice: 12.50,
    sellingPrice: 18.90,
    stock: 25,
    minStock: 10,
    createdAt: "2023-06-10T14:30:00Z",
    updatedAt: "2023-06-10T14:30:00Z"
  },
  {
    id: "2",
    name: "Feijão Carioca",
    barcode: "7892345678901",
    category: "Alimentos",
    costPrice: 8.75,
    sellingPrice: 12.90,
    stock: 30,
    minStock: 15,
    createdAt: "2023-06-11T10:15:00Z",
    updatedAt: "2023-06-11T10:15:00Z"
  },
  // Adicione mais produtos se necessário
];

export const productsService = {
  // Buscar todos os produtos
  async getProducts(): Promise<Product[]> {
    try {
      console.log("Tentando buscar produtos da API...");
      const response = await api.get('/products');
      
      // Adapta o formato se necessário
      const products = response.data.map((item: any) => adaptProductFormat(item));
      
      console.log("Produtos adaptados:", products);
      return products;
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      return mockProducts;
    }
  },

  // Solução híbrida para buscar produto por código de barras
  async getProductByBarcode(barcode: string): Promise<Product | null> {
    try {
      console.log(`Tentando buscar produto com código de barras: ${barcode}`);
      
      try {
        // Primeiro tenta o endpoint específico
        const response = await api.get(`/products/barcode/${barcode}`);
        console.log("Produto recebido da API (endpoint específico):", response.data);
        
        // Adapta o formato se necessário
        return adaptProductFormat(response.data);
      } catch (specificError) {
        console.log("Endpoint específico falhou, tentando buscar todos os produtos...");
        
        // Se falhar, busca todos os produtos e filtra
        const allProductsResponse = await api.get('/products');
        const products = allProductsResponse.data;
        
        const product = products.find((p: any) => p.barcode === barcode);
        
        if (!product) {
          console.log(`Produto com código ${barcode} não encontrado na lista completa`);
          return null;
        }
        
        console.log("Produto encontrado na lista completa:", product);
        
        // Adapta o formato se necessário
        return adaptProductFormat(product);
      }
    } catch (error) {
      console.error("Erro ao buscar produto por código de barras:", error);
      console.log("Procurando nos dados mockados...");
      const product = mockProducts.find(p => p.barcode === barcode);
      return product || null;
    }
  },

  // Buscar produtos por termo de pesquisa
  async searchProducts(query: string): Promise<Product[]> {
    try {
      console.log(`Tentando buscar produtos com termo: ${query}`);
      const response = await api.get(`/products/search?q=${query}`);
      console.log("Produtos encontrados na API:", response.data);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar produtos por termo:", error);
      console.log("Filtrando dados mockados...");
      const filtered = query
        ? mockProducts.filter(p =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.barcode.includes(query)
          )
        : mockProducts;
      return filtered;
    }
  },

  // Outros métodos que você possa precisar...
};

// Função auxiliar para adaptar o formato do produto
function adaptProductFormat(item: any): Product {
  return {
    id: item.id || item._id,
    name: item.name,
    barcode: item.barcode || item.code || '',
    category: item.category || 'Sem categoria',
    costPrice: parseFloat(item.costPrice || item.cost_price || item.price || 0),
    sellingPrice: parseFloat(item.sellingPrice || item.selling_price || item.price || 0),
    stock: parseInt(item.stock || item.quantity || 0),
    minStock: parseInt(item.minStock || item.min_stock || 0),
    createdAt: item.createdAt || item.created_at || new Date().toISOString(),
    updatedAt: item.updatedAt || item.updated_at || new Date().toISOString()
  };
}
