import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import api from "@/services/api";
import { Product } from "./ProductContext";

export interface SaleItem {
  id?: number;
  productId: number;
  productName: string;
  barcode: string;
  price: number;
  quantity: number;
  total: number;
}

export interface Sale {
  id: number;
  date: Date;
  items: SaleItem[];
  total: number;
}

interface SaleContextType {
  sales: Sale[];
  loading: boolean;
  currentSale: SaleItem[];
  addToCurrentSale: (product: Product, quantity: number) => void;
  removeFromCurrentSale: (index: number) => void;
  updateQuantity: (index: number, quantity: number) => void;
  completeSale: () => Promise<void>;
  clearCurrentSale: () => void;
  getSale: (id: number) => Promise<Sale | undefined>;
  getSalesByDate: (date: Date) => Promise<Sale[]>;
  getTotalSales: () => number;
  getItemCount: () => number;
  refreshSales: () => Promise<void>;
}

const SaleContext = createContext<SaleContextType | undefined>(undefined);

export const useSales = () => {
  const context = useContext(SaleContext);
  if (!context) {
    throw new Error("useSales must be used within a SaleProvider");
  }
  return context;
};

interface SaleProviderProps {
  children: ReactNode;
}

export const SaleProvider = ({ children }: SaleProviderProps) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSale, setCurrentSale] = useState<SaleItem[]>([]);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const response = await api.get('/sales');

      // Converter datas de string para Date
      const formattedSales = response.data.map((sale: any) => ({
        ...sale,
        date: new Date(sale.date),
        items: sale.items.map((item: any) => ({
          id: item.id,
          productId: item.product_id,
          productName: item.product_name,
          barcode: item.barcode,
          price: item.price,
          quantity: item.quantity,
          total: item.total
        }))
      }));

      setSales(formattedSales);
    } catch (error) {
      console.error('Failed to fetch sales:', error);
    } finally {
      setLoading(false);
    }
  };

  // Carregar vendas ao iniciar
  useEffect(() => {
    fetchSales();
  }, []);

  const refreshSales = async () => {
    await fetchSales();
  };

  // Certifique-se de que a função está definida corretamente
  const addToCurrentSale = (product: Product, quantity: number = 1) => {
    // Garantir que o preço é um número válido
    const price = typeof product.price === 'number' ? product.price : 0;

    const existingItemIndex = currentSale.findIndex(item => item.productId === product.id);

    if (existingItemIndex >= 0) {
      const updatedSale = [...currentSale];
      const newQuantity = updatedSale[existingItemIndex].quantity + quantity;

      updatedSale[existingItemIndex] = {
        ...updatedSale[existingItemIndex],
        quantity: newQuantity,
        total: newQuantity * price
      };

      setCurrentSale(updatedSale);
    } else {
      const newItem: SaleItem = {
        productId: product.id,
        productName: product.name,
        barcode: product.barcode,
        price: price,
        quantity,
        total: price * quantity
      };

      setCurrentSale([...currentSale, newItem]);
    }
  };



  const removeFromCurrentSale = (index: number) => {
    const updatedSale = [...currentSale];
    updatedSale.splice(index, 1);
    setCurrentSale(updatedSale);
  };

  const updateQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) return;

    const updatedSale = [...currentSale];
    const price = typeof updatedSale[index].price === 'number' ? updatedSale[index].price : 0;

    updatedSale[index] = {
      ...updatedSale[index],
      quantity,
      total: quantity * price
    };

    setCurrentSale(updatedSale);
  };


  const completeSale = async () => {
    if (currentSale.length === 0) return;

    // Calculate sale total
    const total = currentSale.reduce((sum, item) => sum + item.total, 0);

    try {
      // Enviar venda para o backend
      const response = await api.post('/sales', {
        items: currentSale,
        total
      });

      // Formatar a resposta
      const newSale: Sale = {
        id: response.data.id,
        date: new Date(response.data.date),
        items: currentSale,
        total
      };

      // Atualizar estado local
      setSales([newSale, ...sales]);
      clearCurrentSale();

      // Atualizar a lista de vendas
      await refreshSales();

    } catch (error) {
      console.error('Failed to complete sale:', error);
      throw error;
    }
  };

  const clearCurrentSale = () => {
    setCurrentSale([]);
  };

  const getSale = async (id: number) => {
    try {
      const response = await api.get(`/sales/${id}`);

      return {
        ...response.data,
        date: new Date(response.data.date),
        items: response.data.items.map((item: any) => ({
          id: item.id,
          productId: item.product_id,
          productName: item.product_name,
          barcode: item.barcode,
          price: item.price,
          quantity: item.quantity,
          total: item.total
        }))
      };
    } catch (error) {
      console.error('Failed to get sale:', error);
      return undefined;
    }
  };

  const getSalesByDate = async (date: Date) => {
    try {
      const formattedDate = date.toISOString().split('T')[0];
      const response = await api.get(`/sales/date/${formattedDate}`);

      return response.data.map((sale: any) => ({
        ...sale,
        date: new Date(sale.date),
        items: sale.items.map((item: any) => ({
          id: item.id,
          productId: item.product_id,
          productName: item.product_name,
          barcode: item.barcode,
          price: item.price,
          quantity: item.quantity,
          total: item.total
        }))
      }));
    } catch (error) {
      console.error('Failed to get sales by date:', error);
      return [];
    }
  };

  const getTotalSales = () => {
    return sales.reduce((sum, sale) => sum + sale.total, 0);
  };

  const getItemCount = () => {
    return currentSale.reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <SaleContext.Provider
      value={{
        sales,
        loading,
        currentSale,
        addToCurrentSale,
        removeFromCurrentSale,
        updateQuantity,
        completeSale,
        clearCurrentSale,
        getSale,
        getSalesByDate,
        getTotalSales,
        getItemCount,
        refreshSales
      }}
    >
      {children}
    </SaleContext.Provider>
  );
};
