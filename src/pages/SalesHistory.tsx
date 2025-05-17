import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { salesService } from "@/services/api/salesService";
import { Sale } from "@/types/sale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Calendar,
  Search,
  FileText,
  Printer,
  ArrowUpDown,
  Eye,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Receipt from "@/components/pos/Receipt";

const SalesHistory = () => {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Buscar histórico de vendas
  const salesQuery = useQuery({
    queryKey: ["sales", startDate, endDate],
    queryFn: () => salesService.getSales(startDate, endDate),
  });

  // Filtrar vendas por pesquisa
  const filteredSales = salesQuery.data
    ? salesQuery.data.filter((sale) => {
        if (!searchQuery) return true;
        
        const query = searchQuery.toLowerCase();
        
        // Pesquisar por ID da venda
        if (sale.id.toString().includes(query)) return true;
        
        // Pesquisar por método de pagamento
        const paymentMethod = 
          sale.paymentMethod === "cash" ? "dinheiro" :
          sale.paymentMethod === "credit_card" ? "cartão" :
          "pix";
        if (paymentMethod.includes(query)) return true;
        
        // Pesquisar por produtos
        const hasMatchingProduct = sale.items.some(item => 
          item.productName.toLowerCase().includes(query)
        );
        if (hasMatchingProduct) return true;
        
        return false;
      })
    : [];

  // Formatar data e hora
  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: ptBR });
    } catch (error) {
      return "Data inválida";
    }
  };

  // Formatar método de pagamento
  const formatPaymentMethod = (method: string) => {
    switch (method) {
      case "cash":
        return "Dinheiro";
      case "credit_card":
        return "Cartão";
      case "pix":
        return "PIX";
      default:
        return method;
    }
  };

  // Visualizar detalhes da venda
  const handleViewSale = (sale: Sale) => {
    setSelectedSale(sale);
    setIsReceiptOpen(true);
  };

  // Imprimir recibo
  const handlePrintReceipt = () => {
    if (!selectedSale) return;

    // Cria um novo elemento para impressão
    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      alert("Não foi possível abrir a janela de impressão. Verifique se os pop-ups estão permitidos.");
      return;
    }

    // Estilos para a impressão
    const printStyles = `
      <style>
        body {
          font-family: 'Courier New', monospace;
          padding: 10mm;
          margin: 0;
        }
        .receipt {
          width: 80mm;
          margin: 0 auto;
        }
        .receipt-header {
          text-align: center;
          margin-bottom: 10px;
        }
        .receipt-header h2 {
          font-size: 18px;
          margin: 0;
        }
        .receipt-header p {
          font-size: 12px;
          margin: 5px 0;
        }
        .receipt-items {
          border-top: 1px dashed #000;
          border-bottom: 1px dashed #000;
          padding: 10px 0;
          margin: 10px 0;
        }
        .receipt-item {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          margin: 5px 0;
        }
        .receipt-total {
          font-weight: bold;
          font-size: 14px;
          text-align: right;
          margin: 10px 0;
        }
        .receipt-footer {
          text-align: center;
          font-size: 12px;
          margin-top: 10px;
        }
        @media print {
          @page {
            size: 80mm auto;
            margin: 0;
          }
        }
      </style>
    `;

    // Prepara o HTML para impressão
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Recibo #${selectedSale.id} - Empório Ribeiro</title>
        ${printStyles}
      </head>
      <body>
        <div class="receipt">
          <div class="receipt-header">
            <h2>EMPÓRIO RIBEIRO</h2>
            <p>CNPJ: 00.000.000/0001-00</p>
            <p>Venda #${selectedSale.id}</p>
            <p>${formatDateTime(selectedSale.createdAt)}</p>
          </div>
          
          <div class="receipt-items">
            ${selectedSale.items
              .map(
                (item) => `
              <div class="receipt-item">
                <span>${item.quantity}x ${item.productName}</span>
                <span>${item.totalPrice.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}</span>
              </div>
            `
              )
              .join("")}
          </div>
          
          <div class="receipt-total">
            <div>Total: ${selectedSale.total.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}</div>
            ${
              selectedSale.paymentMethod === "cash"
                ? `
              <div>Valor Recebido: ${(selectedSale.cashReceived || 0).toLocaleString(
                "pt-BR",
                { style: "currency", currency: "BRL" }
              )}</div>
              <div>Troco: ${(selectedSale.change || 0).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}</div>
            `
                : ""
            }
            <div>Forma de Pagamento: ${formatPaymentMethod(
              selectedSale.paymentMethod
            )}</div>
          </div>
          
          <div class="receipt-footer">
            <p>Obrigado pela preferência!</p>
            <p>Volte sempre!</p>
          </div>
        </div>
      </body>
      </html>
    `);

    // Fecha o documento para escrita
    printWindow.document.close();

    // Espera o conteúdo carregar e então imprime
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();

      // Fecha a janela após a impressão (opcional)
      printWindow.onafterprint = () => {
        printWindow.close();
      };
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="heading-xl text-emporio-text">Histórico de Vendas</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Filtre as vendas por período ou pesquise por termos específicos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Data Inicial</label>
              <div className="flex">
                <Calendar className="h-4 w-4 mr-2 mt-3" />
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Data Final</label>
              <div className="flex">
                <Calendar className="h-4 w-4 mr-2 mt-3" />
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Pesquisar</label>
              <div className="flex">
                <Search className="h-4 w-4 mr-2 mt-3" />
                <Input
                  type="text"
                  placeholder="Pesquisar por ID, produto, etc."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Vendas Realizadas</CardTitle>
          <CardDescription>
            {filteredSales.length} vendas encontradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {salesQuery.isLoading ? (
            <div className="text-center py-8">Carregando histórico de vendas...</div>
          ) : salesQuery.isError ? (
            <div className="text-center py-8 text-red-500">
              Erro ao carregar histórico de vendas. Tente novamente mais tarde.
            </div>
          ) : filteredSales.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto opacity-20 mb-2" />
              <h3 className="text-lg font-medium">Nenhuma venda encontrada</h3>
              <p className="text-sm text-muted-foreground">
                Tente ajustar os filtros ou realizar novas vendas
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">ID</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Itens</TableHead>
                    <TableHead>Pagamento</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium">#{sale.id}</TableCell>
                      <TableCell>{formatDateTime(sale.createdAt)}</TableCell>
                      <TableCell>
                        {sale.items.length} {sale.items.length === 1 ? "item" : "itens"}
                      </TableCell>
                      <TableCell>{formatPaymentMethod(sale.paymentMethod)}</TableCell>
                      <TableCell className="text-right font-medium">
                        {sale.total.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewSale(sale)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de visualização do recibo */}
      <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              Recibo da Venda #{selectedSale?.id}
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-auto">
            {selectedSale && (
              <div className="receipt-content">
                <div className="text-center mb-4">
                  <h2 className="text-xl font-bold">EMPÓRIO RIBEIRO</h2>
                  <p className="text-sm">CNPJ: 00.000.000/0001-00</p>
                  <p className="text-sm">
                    {formatDateTime(selectedSale.createdAt)}
                  </p>
                </div>

                <div className="border-t border-b py-4 my-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produto</TableHead>
                        <TableHead className="text-center">Qtd</TableHead>
                        <TableHead className="text-right">Preço</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedSale.items.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.productName}</TableCell>
                          <TableCell className="text-center">
                            {item.quantity}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.unitPrice.toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </TableCell>
                          <TableCell className="text-right">
                            {item.totalPrice.toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="border-t border-b py-4 my-4">
                  <div className="flex justify-between">
                    <div className="font-medium">Total</div>
                    <div className="font-medium">
                      {selectedSale.total.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <div className="font-medium">Forma de Pagamento</div>
                    <div className="font-medium">
                      {formatPaymentMethod(selectedSale.paymentMethod)}
                    </div>
                  </div>
                  {selectedSale.paymentMethod === "cash" && (
                    <>
                      <div className="flex justify-between">
                        <div className="font-medium">Valor Recebido</div>
                        <div className="font-medium">
                          {(selectedSale.cashReceived || 0).toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <div className="font-medium">Troco</div>
                        <div className="font-medium">
                          {(selectedSale.change || 0).toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-4">
                  <Button
                    variant="outline"
                    onClick={handlePrintReceipt}
                  >
                    <Printer className="h-4 w-4 mr-2" />
                    Imprimir Recibo
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalesHistory;
