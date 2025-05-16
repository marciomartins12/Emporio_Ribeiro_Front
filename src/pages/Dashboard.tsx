
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/api/dashboardService";
import { salesService } from "@/services/api/salesService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { ShoppingBag, DollarSign, Package, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Import the DashboardData type from salesService
import type { DashboardData } from "@/services/api/salesService";

const StatsCard = ({ 
  title, 
  value, 
  icon, 
  description,
  iconColor
}: { 
  title: string; 
  value: string | number; 
  icon: React.ReactNode;
  description?: string;
  iconColor?: string;
}) => {
  return (
    <Card className="card-stats">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-full ${iconColor || "bg-primary/10"}`}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
};

const Dashboard = () => {
  // Mock data properly typed with DashboardData interface
  const mockSummary: DashboardData = {
    totalSales: 152,
    totalRevenue: 8750.5,
    totalProducts: 487,
    lowStockProducts: 12,
    salesByDay: {
      labels: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
      data: [1200, 1900, 800, 1700, 2100, 1500, 1300],
    }
  };

  const mockLowStockProducts = [
    { id: "1", name: "Arroz Integral", stock: 2, minStock: 10 },
    { id: "2", name: "Feijão Carioca", stock: 3, minStock: 15 },
    { id: "3", name: "Farinha de Trigo", stock: 5, minStock: 20 },
    { id: "4", name: "Óleo de Soja", stock: 8, minStock: 25 },
  ];

  // Properly type the query responses
  const summaryQuery = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: () => {
      // Simulate API call with proper typing
      return new Promise<DashboardData>(resolve => {
        setTimeout(() => resolve(mockSummary), 500);
      });
    }
  });

  const lowStockQuery = useQuery({
    queryKey: ['lowStockProducts'],
    queryFn: () => {
      return new Promise<Array<{ id: string; name: string; stock: number; minStock: number; }>>(resolve => {
        setTimeout(() => resolve(mockLowStockProducts), 500);
      });
    }
  });

  // Format data for the chart
  const chartData = summaryQuery.data ? summaryQuery.data.salesByDay.labels.map((day, index) => ({
    name: day,
    valor: summaryQuery.data.salesByDay.data[index],
  })) : [];

  if (summaryQuery.isLoading || lowStockQuery.isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="heading-xl text-emporio-text">Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="card-stats">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-7 w-[60px]" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="md:col-span-2">
            <CardHeader>
              <Skeleton className="h-5 w-[150px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[320px] w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-[180px]" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <Skeleton className="h-4 w-[120px] mb-1" />
                      <Skeleton className="h-3 w-[80px]" />
                    </div>
                    <Skeleton className="h-6 w-[60px] rounded-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const summary = summaryQuery.data;

  return (
    <div className="space-y-6">
      <h1 className="heading-xl text-emporio-text">Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total de Vendas"
          value={summary.totalSales}
          description="Última semana"
          icon={<ShoppingBag className="h-4 w-4 text-emporio-primary" />}
          iconColor="bg-emporio-primary/10"
        />
        <StatsCard
          title="Receita Total"
          value={`R$ ${summary.totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          description="Última semana"
          icon={<DollarSign className="h-4 w-4 text-emporio-secondary" />}
          iconColor="bg-emporio-secondary/10"
        />
        <StatsCard
          title="Produtos Cadastrados"
          value={summary.totalProducts}
          icon={<Package className="h-4 w-4 text-emporio-primary" />}
          iconColor="bg-emporio-primary/10"
        />
        <StatsCard
          title="Estoque Baixo"
          value={summary.lowStockProducts}
          description="Produtos para repor"
          icon={<AlertTriangle className="h-4 w-4 text-emporio-accent" />}
          iconColor="bg-emporio-accent/10"
        />
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Vendas da Semana</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Valor']}
                  />
                  <Bar dataKey="valor" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Produtos em Baixo Estoque</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockQuery.data.map((product) => (
                <div key={product.id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Estoque: <span className="text-emporio-accent font-medium">{product.stock}</span>/{product.minStock}
                    </p>
                  </div>
                  <span 
                    className={`px-2 py-1 rounded-full text-xs 
                      ${product.stock === 0 
                        ? "bg-red-100 text-red-800" 
                        : "bg-amber-100 text-amber-800"}`}
                  >
                    {product.stock === 0 ? "Zerado" : "Baixo"}
                  </span>
                </div>
              ))}
              {lowStockQuery.data.length === 0 && (
                <p className="text-center text-muted-foreground">Nenhum produto com estoque baixo</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
