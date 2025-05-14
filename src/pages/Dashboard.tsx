
import React from "react";
import Layout from "@/components/Layout";
import { useProducts } from "@/context/ProductContext";
import { useSales } from "@/context/SaleContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Package, BarChart } from "lucide-react";
import { BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const Dashboard = () => {
  const { products, getLowStockProducts } = useProducts();
  const { sales, getTotalSales } = useSales();
  
  const lowStockProducts = getLowStockProducts();
  
  // Get last 7 days of sales
  const lastWeekSales = () => {
    const today = new Date();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(today.getDate() - (6 - i));
      date.setHours(0, 0, 0, 0);
      
      // Find sales for this date
      const dailySales = sales.filter(sale => {
        const saleDate = new Date(sale.date);
        return (
          saleDate.getDate() === date.getDate() &&
          saleDate.getMonth() === date.getMonth() &&
          saleDate.getFullYear() === date.getFullYear()
        );
      });
      
      const total = dailySales.reduce((sum, sale) => sum + sale.total, 0);
      
      return {
        date: format(date, "EEE", { locale: ptBR }),
        total
      };
    });
    
    return last7Days;
  };
  
  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {getTotalSales().toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {sales.length} vendas registradas
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">
              {lowStockProducts.length} com estoque baixo
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Venda Média</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {sales.length > 0 ? (getTotalSales() / sales.length).toFixed(2) : "0.00"}
            </div>
            <p className="text-xs text-muted-foreground">
              Por transação
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Vendas na Última Semana</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart data={lastWeekSales()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, "Total"]}
                />
                <Bar dataKey="total" fill="#3d913f" />
              </ReBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Produtos com Estoque Baixo</CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length > 0 ? (
              <div className="space-y-4">
                {lowStockProducts.map((product) => (
                  <div key={product.id} className="bg-amber-50 border-l-4 border-amber-400 p-4 flex justify-between items-center">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-600">
                        Estoque atual: <span className="font-semibold">{product.stock}</span> | 
                        Mínimo: <span className="font-semibold">{product.minStock}</span>
                      </p>
                    </div>
                    <div className="bg-amber-100 text-amber-800 py-1 px-3 rounded-full text-sm font-medium">
                      Estoque Baixo
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex justify-center items-center h-32 text-gray-500">
                Nenhum produto com estoque baixo.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Dashboard;