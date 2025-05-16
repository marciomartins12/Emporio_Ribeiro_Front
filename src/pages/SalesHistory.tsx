import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { salesService } from "@/services/api/salesService";
import { Sale, PaymentMethod, SaleFilter } from "@/types/sale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Calendar as CalendarIcon, 
  Search, 
  FileText, 
  CreditCard,
  DollarSign,
  QrCode
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const SaleDetails = ({ 
  sale 
}: { 
  sale: Sale | null 
}) => {
  if (!sale) return null;

  const formatPaymentMethod = (method: PaymentMethod) => {
    switch (method) {
      case 'cash': return 'Dinheiro';
      case 'credit_card': return 'Cartão de Crédito';
      case 'debit_card': return 'Cartão de Débito';
      case 'pix': return 'PIX';
      default: return method;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Data da Venda</h3>
          <p>{format(new Date(sale.createdAt), "dd/MM/yyyy HH:mm")}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Forma de Pagamento</h3>
          <p>{formatPaymentMethod(sale.paymentMethod)}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Total</h3>
          <p className="font-semibold">
            {sale.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
        {sale.paymentMethod === 'cash' && (
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Troco</h3>
            <p>
              {(sale.change || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">Itens</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead className="text-center">Qtd</TableHead>
              <TableHead className="text-right">Preço Un.</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sale.items.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.productName}</TableCell>
                <TableCell className="text-center">{item.quantity}</TableCell>
                <TableCell className="text-right">
                  {item.unitPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </TableCell>
                <TableCell className="text-right">
                  {item.totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

const PaymentMethodIcon = ({ method }: { method: PaymentMethod }) => {
  switch (method) {
    case 'cash':
      return <DollarSign className="h-4 w-4" />;
    case 'credit_card':
    case 'debit_card':
      return <CreditCard className="h-4 w-4" />;
    case 'pix':
      return <QrCode className="h-4 w-4" />;
    default:
      return null;
  }
};

const PaymentMethodBadge = ({ method }: { method: PaymentMethod }) => {
  let color = '';
  let label = '';

  switch (method) {
    case 'cash':
      color = 'bg-green-100 text-green-800 border-green-200';
      label = 'Dinheiro';
      break;
    case 'credit_card':
      color = 'bg-blue-100 text-blue-800 border-blue-200';
      label = 'Crédito';
      break;
    case 'debit_card':
      color = 'bg-purple-100 text-purple-800 border-purple-200';
      label = 'Débito';
      break;
    case 'pix':
      color = 'bg-amber-100 text-amber-800 border-amber-200';
      label = 'PIX';
      break;
    default:
      color = 'bg-gray-100 text-gray-800 border-gray-200';
      label = method;
  }

  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${color}`}>
      <PaymentMethodIcon method={method} />
      <span className="ml-1">{label}</span>
    </div>
  );
};

const SalesHistory = () => {
  const [filters, setFilters] = useState<SaleFilter>({});
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Mock de vendas (seria substituído pelos dados da API)
  const mockSales: Sale[] = [
    {
      id: "1",
      items: [
        { productId: "1", productName: "Arroz Integral", quantity: 2, unitPrice: 18.90, totalPrice: 37.80 },
        { productId: "2", productName: "Feijão Carioca", quantity: 3, unitPrice: 12.90, totalPrice: 38.70 }
      ],
      total: 76.50,
      paymentMethod: 'cash',
      cashReceived: 100,
      change: 23.50,
      createdAt: "2024-05-14T10:30:00Z",
      updatedAt: "2024-05-14T10:30:00Z"
    },
    {
      id: "2",
      items: [
        { productId: "3", productName: "Óleo de Soja", quantity: 1, unitPrice: 9.75, totalPrice: 9.75 },
        { productId: "4", productName: "Café Tradicional", quantity: 2, unitPrice: 22.50, totalPrice: 45.00 }
      ],
      total: 54.75,
      paymentMethod: 'credit_card',
      createdAt: "2024-05-13T15:45:00Z",
      updatedAt: "2024-05-13T15:45:00Z"
    },
    {
      id: "3",
      items: [
        { productId: "5", productName: "Açúcar Refinado", quantity: 3, unitPrice: 6.90, totalPrice: 20.70 },
        { productId: "1", productName: "Arroz Integral", quantity: 1, unitPrice: 18.90, totalPrice: 18.90 }
      ],
      total: 39.60,
      paymentMethod: 'pix',
      createdAt: "2024-05-12T09:15:00Z",
      updatedAt: "2024-05-12T09:15:00Z"
    }
  ];

  // Simular chamada de API com react-query
  const salesQuery = useQuery({
    queryKey: ['sales', filters],
    queryFn: () => {
      return new Promise<Sale[]>(resolve => {
        setTimeout(() => {
          let filtered = [...mockSales];
          
          // Filtrar por data
          if (filters.startDate) {
            filtered = filtered.filter(sale => 
              new Date(sale.createdAt) >= new Date(filters.startDate!)
            );
          }
          
          if (filters.endDate) {
            filtered = filtered.filter(sale => 
              new Date(sale.createdAt) <= new Date(filters.endDate!)
            );
          }
          
          // Filtrar por método de pagamento
          if (filters.paymentMethod) {
            filtered = filtered.filter(sale => 
              sale.paymentMethod === filters.paymentMethod
            );
          }
          
          // Filtrar por valor
          if (filters.minValue !== undefined) {
            filtered = filtered.filter(sale => sale.total >= filters.minValue!);
          }
          
          if (filters.maxValue !== undefined) {
            filtered = filtered.filter(sale => sale.total <= filters.maxValue!);
          }
          
          resolve(filtered);
        }, 500);
      });
    }
  });

  // Aplicar filtros
  const applyFilters = () => {
    const newFilters: SaleFilter = {};
    
    if (startDate) {
      newFilters.startDate = startDate.toISOString();
    }
    
    if (endDate) {
      newFilters.endDate = endDate.toISOString();
    }
    
    setFilters(newFilters);
  };
  
  // Resetar filtros
  const resetFilters = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setFilters({});
  };
  
  // Visualizar detalhes da venda
  const viewDetails = (sale: Sale) => {
    setSelectedSale(sale);
    setIsDetailsOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="heading-xl text-emporio-text">Histórico de Vendas</h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Data Inicial</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? (
                      format(startDate, "dd/MM/yyyy")
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Data Final</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? (
                      format(endDate, "dd/MM/yyyy")
                    ) : (
                      <span>Selecione uma data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    locale={ptBR}
                    disabled={(date) => startDate ? date < startDate : false}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Forma de Pagamento</label>
              <Select 
                onValueChange={(value) => 
                  setFilters(prev => ({ ...prev, paymentMethod: value as PaymentMethod }))
                }
                value={filters.paymentMethod}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="cash">Dinheiro</SelectItem>
                  <SelectItem value="credit_card">Cartão de Crédito</SelectItem>
                  <SelectItem value="debit_card">Cartão de Débito</SelectItem>
                  <SelectItem value="pix">PIX</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={resetFilters}>
              Limpar Filtros
            </Button>
            <Button onClick={applyFilters}>
              <Search className="h-4 w-4 mr-2" />
              Filtrar
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Itens</TableHead>
              <TableHead>Pagamento</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {salesQuery.isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : salesQuery.data && salesQuery.data.length > 0 ? (
              salesQuery.data.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>
                    {format(new Date(sale.createdAt), "dd/MM/yyyy HH:mm")}
                  </TableCell>
                  <TableCell>
                    {sale.items.length} {sale.items.length === 1 ? 'item' : 'itens'}
                  </TableCell>
                  <TableCell>
                    <PaymentMethodBadge method={sale.paymentMethod} />
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {sale.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => viewDetails(sale)}
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10">
                  Nenhuma venda encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Venda</DialogTitle>
          </DialogHeader>
          <SaleDetails sale={selectedSale} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalesHistory;
