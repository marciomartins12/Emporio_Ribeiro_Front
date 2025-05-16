import api from './api';

// Mock de categorias
const mockCategories = [
  { id: 1, name: "Eletrônicos" },
  { id: 2, name: "Vestuário" },
  { id: 3, name: "Alimentos" },
  { id: 4, name: "Livros" },
  { id: 5, name: "Casa e Decoração" }
];

// Variável para controlar se estamos usando dados mockados
let useMockData = false;
let mockWarningShown = false;

// Função para mostrar aviso de uso de dados mockados (apenas uma vez)
const showMockWarning = () => {
  if (!mockWarningShown) {
    console.warn(
      "⚠️ ATENÇÃO: Usando dados mockados porque o backend não está disponível. " +
      "Verifique se o servidor backend está rodando em http://localhost:5000"
    );
    mockWarningShown = true;
  }
};

export const categoryService = {
  async getCategories() {
    if (useMockData) {
      showMockWarning();
      // Simular um atraso de rede
      await new Promise(resolve => setTimeout(resolve, 300));
      return [...mockCategories]; // Retorna uma cópia para evitar mutações
    }

    try {
      const response = await fetch('http://localhost:5000/api/categories', {
        // Adicionar um timeout para não esperar indefinidamente
        signal: AbortSignal.timeout(5000)
      });
      
      if (!response.ok) {
        throw new Error(`Falha ao buscar categorias: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro no serviço de categorias:', error);
      
      // Se falhar, ativar o modo de dados mockados para futuras chamadas
      useMockData = true;
      showMockWarning();
      
      // Retornar dados mockados como fallback
      return [...mockCategories];
    }
  },
  
  async getCategoryById(id: number) {
    if (useMockData) {
      showMockWarning();
      await new Promise(resolve => setTimeout(resolve, 200));
      const category = mockCategories.find(c => c.id === id);
      if (!category) {
        throw new Error('Categoria não encontrada');
      }
      return {...category}; // Retorna uma cópia para evitar mutações
    }

    try {
      const response = await fetch(`http://localhost:5000/api/categories/${id}`, {
        // Adicionar um timeout para não esperar indefinidamente
        signal: AbortSignal.timeout(5000)
      });
      
      if (!response.ok) {
        throw new Error(`Falha ao buscar categoria: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro no serviço de categorias:', error);
      
      // Se falhar, ativar o modo de dados mockados para futuras chamadas
      useMockData = true;
      showMockWarning();
      
      // Retornar dados mockados como fallback
      return [...mockCategories];
    }
  }
};