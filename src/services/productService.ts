// Mock de dados para desenvolvimento
const mockProducts = [
  {
    id: 1,
    name: "Smartphone XYZ",
    barcode: "7891234567890",
    category_id: 1,
    category_name: "Eletrônicos",
    price: 1299.99,
    discount_price: 1199.99,
    stock: 50,
    description: "Smartphone de última geração com câmera de alta resolução",
    image: "https://via.placeholder.com/150",
    featured: true
  },
  {
    id: 2,
    name: "Notebook Ultra",
    barcode: "7891234567891",
    category_id: 1,
    category_name: "Eletrônicos",
    price: 3499.99,
    discount_price: null,
    stock: 15,
    description: "Notebook potente para trabalho e jogos",
    image: "https://via.placeholder.com/150",
    featured: true
  },
  {
    id: 3,
    name: "Fone de Ouvido Bluetooth",
    barcode: "7891234567892",
    category_id: 1,
    category_name: "Eletrônicos",
    price: 199.99,
    discount_price: 149.99,
    stock: 100,
    description: "Fone de ouvido sem fio com cancelamento de ruído",
    image: "https://via.placeholder.com/150",
    featured: false
  },
  {
    id: 4,
    name: "Camiseta Casual",
    barcode: "7891234567893",
    category_id: 2,
    category_name: "Vestuário",
    price: 59.99,
    discount_price: null,
    stock: 200,
    description: "Camiseta confortável para o dia a dia",
    image: "https://via.placeholder.com/150",
    featured: false
  },
  {
    id: 5,
    name: "Tênis Esportivo",
    barcode: "7891234567894",
    category_id: 2,
    category_name: "Vestuário",
    price: 249.99,
    discount_price: 199.99,
    stock: 30,
    description: "Tênis para corrida e atividades físicas",
    image: "https://via.placeholder.com/150",
    featured: true
  }
];

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

export const productService = {
  async getProducts() {
    if (useMockData) {
      showMockWarning();
      // Simular um atraso de rede
      await new Promise(resolve => setTimeout(resolve, 500));
      return [...mockProducts]; // Retorna uma cópia para evitar mutações
    }

    try {
      const response = await fetch('http://localhost:5000/api/products', {
        // Adicionar um timeout para não esperar indefinidamente
        signal: AbortSignal.timeout(5000)
      });
      
      if (!response.ok) {
        throw new Error(`Falha ao buscar produtos: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro no serviço de produtos:', error);
      
      // Se falhar, ativar o modo de dados mockados para futuras chamadas
      useMockData = true;
      showMockWarning();
      
      // Retornar dados mockados como fallback
      return [...mockProducts];
    }
  },
  
  async getProductById(id: number) {
    if (useMockData) {
      showMockWarning();
      await new Promise(resolve => setTimeout(resolve, 300));
      const product = mockProducts.find(p => p.id === id);
      if (!product) {
        throw new Error('Produto não encontrado');
      }
      return {...product}; // Retorna uma cópia para evitar mutações
    }

    try {
      const response = await fetch(`http://localhost:5000/api/products/${id}`, {
        signal: AbortSignal.timeout(5000)
      });
      
      if (!response.ok) {
        throw new Error(`Falha ao buscar produto: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao buscar produto por ID:', error);
      
      // Se falhar, ativar o modo de dados mockados para futuras chamadas
      useMockData = true;
      showMockWarning();
      
      // Retornar dados mockados como fallback
      const product = mockProducts.find(p => p.id === id);
      if (!product) {
        throw new Error('Produto não encontrado');
      }
      return {...product};
    }
  },
  
  async createProduct(product: any) {
    if (useMockData) {
      showMockWarning();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Encontrar a categoria para obter o nome
      const category = mockCategories.find(c => c.id === parseInt(product.category_id));
      
      const newProduct = {
        ...product,
        id: Math.max(...mockProducts.map(p => p.id)) + 1,
        category_name: category?.name || "Categoria Desconhecida",
        price: parseFloat(product.price),
        discount_price: product.discount_price ? parseFloat(product.discount_price) : null,
        stock: parseInt(product.stock),
        // Garantir que o código de barras seja salvo corretamente
        barcode: product.barcode || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log("Criando produto mockado:", newProduct);
      mockProducts.push(newProduct);
      return {...newProduct};
    }

    try {
      const response = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
        signal: AbortSignal.timeout(5000)
      });
      
      if (!response.ok) {
        throw new Error(`Falha ao criar produto: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      
      // Se falhar, ativar o modo de dados mockados para futuras chamadas
      useMockData = true;
      showMockWarning();
      
      // Criar produto mockado como fallback
      const category = mockCategories.find(c => c.id === parseInt(product.category_id));
      
      const newProduct = {
        ...product,
        id: Math.max(...mockProducts.map(p => p.id)) + 1,
        category_name: category?.name || "Categoria Desconhecida",
        price: parseFloat(product.price),
        discount_price: product.discount_price ? parseFloat(product.discount_price) : null,
        stock: parseInt(product.stock),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      mockProducts.push(newProduct);
      return {...newProduct};
    }
  },
  
  async updateProduct(id: number, product: any) {
    if (useMockData) {
      showMockWarning();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const index = mockProducts.findIndex(p => p.id === id);
      if (index === -1) {
        throw new Error('Produto não encontrado');
      }
      
      // Encontrar a categoria para obter o nome
      const category = mockCategories.find(c => c.id === parseInt(product.category_id));
      
      mockProducts[index] = {
        ...mockProducts[index],
        ...product,
        category_name: category?.name || mockProducts[index].category_name,
        price: parseFloat(product.price),
        discount_price: product.discount_price ? parseFloat(product.discount_price) : null,
        stock: parseInt(product.stock),
        // Garantir que o código de barras seja atualizado corretamente
        barcode: product.barcode || null,
        updated_at: new Date().toISOString()
      };
      
      console.log("Atualizando produto mockado:", mockProducts[index]);
      return {...mockProducts[index]};
    }

    try {
      const response = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
        signal: AbortSignal.timeout(5000)
      });
      
      if (!response.ok) {
        throw new Error(`Falha ao atualizar produto: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      
      // Se falhar, ativar o modo de dados mockados para futuras chamadas
      useMockData = true;
      showMockWarning();
      
      // Atualizar produto mockado como fallback
      const index = mockProducts.findIndex(p => p.id === id);
      if (index === -1) {
        throw new Error('Produto não encontrado');
      }
      
      // Encontrar a categoria para obter o nome
      const category = mockCategories.find(c => c.id === parseInt(product.category_id));
      
      mockProducts[index] = {
        ...mockProducts[index],
        ...product,
        category_name: category?.name || mockProducts[index].category_name,
        price: parseFloat(product.price),
        discount_price: product.discount_price ? parseFloat(product.discount_price) : null,
        stock: parseInt(product.stock),
        updated_at: new Date().toISOString()
      };
      
      return {...mockProducts[index]};
    }
  },
  
  async deleteProduct(id: number) {
    if (useMockData) {
      showMockWarning();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const index = mockProducts.findIndex(p => p.id === id);
      if (index === -1) {
        throw new Error('Produto não encontrado');
      }
      
      mockProducts.splice(index, 1);
      return true;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'DELETE',
        signal: AbortSignal.timeout(5000)
      });
      
      if (!response.ok) {
        throw new Error(`Falha ao excluir produto: ${response.status} ${response.statusText}`);
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      
      // Se falhar, ativar o modo de dados mockados para futuras chamadas
      useMockData = true;
      showMockWarning();
      
      // Excluir produto mockado como fallback
      const index = mockProducts.findIndex(p => p.id === id);
      if (index === -1) {
        throw new Error('Produto não encontrado');
      }
      
      mockProducts.splice(index, 1);
      return true;
    }
  }
};