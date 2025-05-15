import React, { useState } from "react";
import Layout from "@/components/Layout";
import { useSales, Sale, SaleItem } from "@/context/SaleContext";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FileText, Search, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";

const Sales = () => {
  const { sales, getSale } = useSales();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [dateFilter, setDateFilter] = useState("");

  const handleViewDetails = (id: number) => {
    const sale = getSale(id);
    if (sale) {
      setSelectedSale(sale);
      setIsDetailDialogOpen(true);
    }
  };

  // Filter sales based on search term and date
  const filteredSales = sales
    .filter((sale) => {
      // Filter by date if dateFilter is set
      if (dateFilter) {
        const saleDate = format(new Date(sale.date), "yyyy-MM-dd");
        if (saleDate !== dateFilter) {
          return false;
        }
      }

      // Filter by search term
      if (!searchTerm) return true;
      
      // Search by ID
      if (sale.id.toString().includes(searchTerm)) {
        return true;
      }
      
      // Search by total or items
      if (sale.total.toString().includes(searchTerm)) {
        return true;
      }
      
      // Search in items
      return sale.items.some((item) =>
        item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.barcode.includes(searchTerm)
      );
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Sort by date desc

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Histórico de Vendas</h1>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar vendas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="sm:w-48">
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="emporio-table">
            <thead>
              <tr>
                <th>Nº Venda</th>
                <th>Data</th>
                <th>Hora</th>
                <th>Itens</th>
                <th>Total (R$)</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.length > 0 ? (
                filteredSales.map((sale) => (
                  <tr key={sale.id}>
                    <td>{sale.id.toString().padStart(4, "0")}</td>
                    <td>
                      {format(new Date(sale.date), "dd/MM/yyyy", {
                        locale: ptBR,
                      })}
                    </td>
                    <td>
                      {format(new Date(sale.date), "HH:mm", {
                        locale: ptBR,
                      })}
                    </td>
                    <td>
                      {sale.items.reduce((sum, item) => sum + item.quantity, 0)} itens
                    </td>
                    <td>R$ {sale.total.toFixed(2)}</td>
                    <td>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(sale.id)}
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        Detalhes
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    {sales.length === 0
                      ? "Nenhuma venda registrada."
                      : "Nenhuma venda encontrada com os termos da busca."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sale Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              Detalhes da Venda #{selectedSale?.id.toString().padStart(4, "0")}
            </DialogTitle>
          </DialogHeader>

          {selectedSale && (
            <div className="py-4">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-gray-500 text-sm">Data:</span>
                  <p>
                    {format(new Date(selectedSale.date), "dd/MM/yyyy", {
                      locale: ptBR,
                    })}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Hora:</span>
                  <p>
                    {format(new Date(selectedSale.date), "HH:mm", {
                      locale: ptBR,
                    })}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Itens:</span>
                  <p>
                    {selectedSale.items.reduce(
                      (sum, item) => sum + item.quantity,
                      0
                    )}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Total:</span>
                  <p className="font-semibold">
                    R$ {selectedSale.total.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Itens da Venda</h4>
                <div className="max-h-80 overflow-y-auto">
                  <table className="emporio-table">
                    <thead>
                      <tr>
                        <th>Produto</th>
                        <th>Preço</th>
                        <th>Qtd</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSale.items.map((item: SaleItem, index: number) => (
                        <tr key={index}>
                          <td>
                            <div>{item.productName}</div>
                            <div className="text-xs text-gray-500">
                              {item.barcode}
                            </div>
                          </td>
                          <td>R$ {item.price.toFixed(2)}</td>
                          <td>{item.quantity}</td>
                          <td>R$ {item.total.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 flex justify-end">
                  <div className="bg-gray-50 px-4 py-2 rounded-lg">
                    <span className="text-gray-700">Total:</span>
                    <span className="font-bold ml-2 text-lg text-emporio-600">
                      R$ {selectedSale.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Sales;