import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "@/services/api/dashboardService";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ShoppingCart,
  DollarSign,
  Package,
  AlertTriangle,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DashboardData } from "@/types/dashboard";

const Dashboard = () => {
  const [period, setPeriod] = useState<"today" | "week" | "month">("week");
  const [isUsingMockData, setIsUsingMockData] = useState(false);

  // Buscar dados do dashboard
  const dashboardQuery = useQuery<DashboardData>({
    queryKey: ["dashboard", period],
    queryFn: async () => {
      try {
        const data = await dashboardService.getDashboardData(period);
        setIsUsingMockData(data.isMockData === true);
        return data;
      } catch (error) {
        console.error("Erro na consulta do dashboard:", error);
        setIsUsingMockData(true);
        
        // Dados simulados para quando a API falhar
        return {
          isMockData: true,
          summary: {
            totalSales: 42,
            totalRevenue: 3850.75,
            totalProducts: 156,
            lowStockCount: 7
          },
          dailySales: generateMockDailySales(),
          // Adicione dados mockados para produtos com estoque baixo apenas para fallback
          lowStockProducts: [
            { id: '1', name: 'Arroz Integral', stock: 8, minStock: 10 },
            { id: '2', name: 'Feijão Carioca', stock: 5, minStock: 15 },
            { id: '3', name: 'Açúcar Refinado', stock: 3, minStock: 10 },
            { id: '4', name: 'Café Tradicional', stock: 7, minStock: 12 },
            { id: '5', name: 'Óleo de Soja', stock: 9, minStock: 20 }
          ]
        };
      }
    },
  });

  // Função para gerar dados simulados de vendas diárias
  const generateMockDailySales = () => {
    if (period === "week") {
      // Gerar dados para a semana atual
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0 = Domingo, 1 = Segunda, ...
      const result = [];
      
      // Gerar dados para os dias da semana até hoje
      for (let i = 0; i <= dayOfWeek; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - (dayOfWeek - i));
        
        result.push({
          date: `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`,
          sales: Math.floor(Math.random() * 20) + 1,
          revenue: Math.floor(Math.random() * 1000) + 100
        });
      }
      
      return result;
    } else if (period === "today") {
      // Apenas o dia de hoje
      const today = new Date();
      return [{
        date: `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}`,
        sales: Math.floor(Math.random() * 20) + 1,
        revenue: Math.floor(Math.random() * 1000) + 100
      }];
    } else {
      // Mês inteiro (30 dias)
      const result = [];
      const today = new Date();
      
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        
        result.push({
          date: `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`,
          sales: Math.floor(Math.random() * 20) + 1,
          revenue: Math.floor(Math.random() * 1000) + 100
        });
      }
      
      return result;
    }
  };

  const dashboardData = dashboardQuery.data;

  // Formatar dados para o gráfico de vendas diárias
  const getDailySalesChartData = () => {
    if (!dashboardData?.dailySales) return [];
    
    // Se o período for "week", filtramos apenas os dados da semana atual
    if (period === "week") {
      // Obter a data atual
      const today = new Date();
      // Obter o primeiro dia da semana (domingo)
      const firstDayOfWeek = new Date(today);
      firstDayOfWeek.setDate(today.getDate() - today.getDay());
      
      // Filtrar apenas os dados da semana atual
      return dashboardData.dailySales
        .filter(item => {
          // Converter a data do item para um objeto Date
          // Assumindo que o formato é 'DD/MM'
          const [day, month] = item.date.split('/').map(Number);
          const itemDate = new Date();
          itemDate.setDate(day);
          itemDate.setMonth(month - 1); // Mês em JS começa em 0
          
          // Verificar se a data está na semana atual
          return itemDate >= firstDayOfWeek && itemDate <= today;
        })
        .map(item => ({
          ...item,
          sales: item.sales || 0,
          revenue: item.revenue || 0,
          date: item.date || 'N/A'
        }));
    }
    
    // Para outros períodos, retornamos todos os dados disponíveis
    return dashboardData.dailySales.map(item => ({
      ...item,
      sales: item.sales || 0,
      revenue: item.revenue || 0,
      date: item.date || 'N/A'
    }));
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho com título e seletor de período */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-4">
          {isUsingMockData && (
            <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-md text-sm">
              Usando dados simulados
            </div>
          )}
          <Tabs
            value={period}
            onValueChange={(value) => setPeriod(value as "today" | "week" | "month")}
            className="w-[400px]"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="today">Hoje</TabsTrigger>
              <TabsTrigger value="week">Semana</TabsTrigger>
              <TabsTrigger value="month">Mês</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total de Vendas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {dashboardQuery.isLoading ? (
              <Skeleton className="h-8 w-[100px]" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {dashboardData?.summary?.totalSales || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Vendas no período selecionado
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Receita Total */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {dashboardQuery.isLoading ? (
              <Skeleton className="h-8 w-[100px]" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {(dashboardData?.summary?.totalRevenue || 0).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  Receita no período selecionado
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Total de Produtos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {dashboardQuery.isLoading ? (
              <Skeleton className="h-8 w-[100px]" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {dashboardData?.summary?.totalProducts || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Produtos cadastrados
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Produtos com Estoque Baixo */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {dashboardQuery.isLoading ? (
              <Skeleton className="h-8 w-[100px]" />
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {dashboardData?.summary?.lowStockCount || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Produtos com estoque baixo
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gráficos e Tabela de Estoque Baixo */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Gráfico de Vendas por Período */}
        <Card className="col-span-1 md:col-span-1">
          <CardHeader>
            <CardTitle>Vendas por Período</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardQuery.isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={getDailySalesChartData()}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`${value}`, 'Vendas']}
                    labelFormatter={(label) => `Data: ${label}`}
                  />
                  <Bar dataKey="sales" fill="#8884d8" name="Vendas" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Tabela de Produtos com Estoque Baixo */}
        <Card className="col-span-1 md:col-span-1">
          <CardHeader>
            <CardTitle>Produtos com Estoque Baixo</CardTitle>
          </CardHeader>
          <CardContent>
            {dashboardQuery.isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <div className="h-[300px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead className="text-right">Estoque</TableHead>
                      <TableHead className="text-right">Mínimo</TableHead>
                      <TableHead className="text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dashboardData?.lowStockProducts && dashboardData.lowStockProducts.length > 0 ? (
                      dashboardData.lowStockProducts.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell className="text-right">{product.stock}</TableCell>
                          <TableCell className="text-right">{product.minStock}</TableCell>
                          <TableCell className="text-right">
                            <Badge 
                              variant={product.stock <= product.minStock / 2 ? "destructive" : "outline"}
                              className="ml-auto"
                            >
                              {product.stock <= product.minStock / 2 ? "Crítico" : "Baixo"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-6">
                          Nenhum produto com estoque baixo
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
