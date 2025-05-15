import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import api from "@/services/api";

export interface Product {
  id: number;
  barcode: string;
  name: string;
  price: number;
  stock: number;
  minStock: number;
  category: string;
  createdAt: Date;
}

interface ProductContextType {
  products: Product[];
  loading: boolean;
  addProduct: (product: Omit<Product, "id" | "createdAt">) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;
  getProductByBarcode: (barcode: string) => Promise<Product | undefined>;
  getLowStockProducts: () => Product[];
  refreshProducts: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error("useProducts must be used within a ProductProvider");
  }
  return context;
};

interface ProductProviderProps {
  children: ReactNode;
}

export const ProductProvider = ({ children }: ProductProviderProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products');
      // Converter datas de string para Date e ajustar nomes de campos
      const formattedProducts = response.data.map((product: any) => ({
        ...product,
        price: typeof product.price === 'number' ?
          product.price :
          parseFloat(product.price) || 0,
        createdAt: new Date(product.created_at || new Date()),
        minStock: product.min_stock
      }));
      setProducts(formattedProducts);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };


  // Carregar produtos ao iniciar
  useEffect(() => {
    fetchProducts();
  }, []);

  const refreshProducts = async () => {
    await fetchProducts();
  };

  const addProduct = async (product: Omit<Product, "id" | "createdAt">) => {
    try {
      const response = await api.post('/products', product);
      const newProduct = {
        ...response.data,
        createdAt: new Date(response.data.createdAt || new Date())
      };

      setProducts([...products, newProduct]);
      return newProduct;
    } catch (error) {
      console.error('Failed to add product:', error);
      throw error;
    }
  };

  const updateProduct = async (updatedProduct: Product) => {
    try {
      await api.put(`/products/${updatedProduct.id}`, {
        barcode: updatedProduct.barcode,
        name: updatedProduct.name,
        price: updatedProduct.price,
        stock: updatedProduct.stock,
        minStock: updatedProduct.minStock,
        category: updatedProduct.category
      });

      setProducts(
        products.map(product =>
          product.id === updatedProduct.id ? updatedProduct : product
        )
      );
      return updatedProduct;
    } catch (error) {
      console.error('Failed to update product:', error);
      throw error;
    }
  };

  const deleteProduct = async (id: number) => {
    try {
      await api.delete(`/products/${id}`);
      setProducts(products.filter(product => product.id !== id));
    } catch (error) {
      console.error('Failed to delete product:', error);
      throw error;
    }
  };

  const getProductByBarcode = async (barcode: string) => {
    try {
      const response = await api.get(`/products/${barcode}`);

      if (response.data) {
        // Garantir que o preço é um número válido
        const price = typeof response.data.price === 'number' ?
          response.data.price :
          parseFloat(response.data.price) || 0;
        return {
          ...response.data,
          price: price,  // Garantir que o preço é um número
          createdAt: new Date(response.data.created_at || new Date()),
          minStock: response.data.min_stock
        };
      }
      return undefined;
    } catch (error) {
      console.error('Failed to get product by barcode:', error);
      return undefined;
    }
  };


  const getLowStockProducts = () => {
    return products.filter(product => product.stock <= product.minStock);
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        loading,
        addProduct,
        updateProduct,
        deleteProduct,
        getProductByBarcode,
        getLowStockProducts,
        refreshProducts
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};
