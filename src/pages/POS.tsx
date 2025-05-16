import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { productsService } from "@/services/api/productsService";
import { salesService } from "@/services/api/salesService";
import { Product } from "@/types/product";
import { SaleItem, PaymentMethod } from "@/types/sale";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  ShoppingCart, 
  Trash2, 
  CreditCard, 
  QrCode, 
  DollarSign, 
  Save, 
  Printer, 
  Barcode,
  Check,
  Plus,
  Minus,
  Search
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import QRCodeImage from "@/components/pos/QRCodeImage";
import Receipt from "@/components/pos/Receipt";

interface CartItem extends SaleItem {
  product: Product;
}

// Página do PDV (Ponto de Venda)
const POS = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [barcode, setBarcode] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [cashReceived, setCashReceived] = useState("0");
  const [isBarcodeDialogOpen, setIsBarcodeDialogOpen] = useState(false);

  // Mock de produtos (seria substituído pelos dados da API)
  const mockProducts: Product[] = [
    {
      id: "1",
      name: "Arroz Integral",
      barcode: "7891234567890",
      category: "Alimentos",
      costPrice: 12.50,
      sellingPrice: 18.90,
      stock: 25,
      minStock: 10,
      createdAt: "2023-06-10T14:30:00Z",
      updatedAt: "2023-06-10T14:30:00Z"
    },
    {
      id: "2",
      name: "Feijão Carioca",
      barcode: "7892345678901",
      category: "Alimentos",
      costPrice: 8.75,
      sellingPrice: 12.90,
      stock: 30,
      minStock: 15,
      createdAt: "2023-06-11T10:15:00Z",
      updatedAt: "2023-06-11T10:15:00Z"
    },
    {
      id: "3",
      name: "Óleo de Soja",
      barcode: "7893456789012",
      category: "Alimentos",
      costPrice: 6.50,
      sellingPrice: 9.75,
      stock: 40,
      minStock: 20,
      createdAt: "2023-06-12T09:45:00Z",
      updatedAt: "2023-06-12T09:45:00Z"
    },
    {
      id: "4",
      name: "Café Tradicional",
      barcode: "7894567890123",
      category: "Alimentos",
      costPrice: 15.00,
      sellingPrice: 22.50,
      stock: 35,
      minStock: 15,
      createdAt: "2023-06-13T11:20:00Z",
      updatedAt: "2023-06-13T11:20:00Z"
    },
    {
      id: "5",
      name: "Açúcar Refinado",
      barcode: "7895678901234",
      category: "Alimentos",
      costPrice: 4.25,
      sellingPrice: 6.90,
      stock: 50,
      minStock: 20,
      createdAt: "2023-06-14T08:45:00Z",
      updatedAt: "2023-06-14T08:45:00Z"
    },
  ];

  // Simulação de consulta de produtos
  const productsQuery = useQuery({
    queryKey: ['products', searchQuery],
    queryFn: () => {
      return new Promise<Product[]>(resolve => {
        setTimeout(() => {
          const filtered = searchQuery
            ? mockProducts.filter(p => 
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                p.barcode.includes(searchQuery)
              )
            : mockProducts;
          resolve(filtered);
        }, 300);
      });
    }
  });

  const barcodeQuery = useQuery({
    queryKey: ['product', barcode],
    queryFn: () => {
      return new Promise<Product | null>(resolve => {
        setTimeout(() => {
          const product = mockProducts.find(p => p.barcode === barcode);
          resolve(product || null);
        }, 300);
      });
    },
    enabled: barcode.length > 0,
  });

  // Efeito para adicionar produto quando encontrado pelo código de barras
  useEffect(() => {
    if (barcodeQuery.data && !barcodeQuery.isLoading) {
      addToCart(barcodeQuery.data);
      setBarcode("");
    }
  }, [barcodeQuery.data, barcodeQuery.isLoading]);

  // Cálculos do carrinho
  const cartTotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const change = parseFloat(cashReceived) > cartTotal 
    ? parseFloat(cashReceived) - cartTotal 
    : 0;

  // Adicionar produto ao carrinho
  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(item => item.productId === product.id);
      
      if (existingItemIndex >= 0) {
        // Produto já está no carrinho, aumenta a quantidade
        const newCart = [...prevCart];
        const item = newCart[existingItemIndex];
        const newQuantity = item.quantity + 1;
        
        newCart[existingItemIndex] = {
          ...item,
          quantity: newQuantity,
          totalPrice: product.sellingPrice * newQuantity
        };
        
        return newCart;
      } else {
        // Produto novo, adiciona ao carrinho
        return [
          ...prevCart,
          {
            productId: product.id,
            productName: product.name,
            quantity: 1,
            unitPrice: product.sellingPrice,
            totalPrice: product.sellingPrice,
            product: product
          }
        ];
      }
    });

    // Feedback visual para o usuário
    toast({
      title: "Produto adicionado",
      description: `${product.name} foi adicionado ao carrinho.`,
      duration: 2000,
    });
  };

  // Remover produto do carrinho
  const removeFromCart = (index: number) => {
    setCart(prevCart => prevCart.filter((_, i) => i !== index));
  };

  // Atualizar quantidade de um item no carrinho
  const updateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(index);
      return;
    }
    
    setCart(prevCart => {
      const newCart = [...prevCart];
      const item = newCart[index];
      
      newCart[index] = {
        ...item,
        quantity: newQuantity,
        totalPrice: item.unitPrice * newQuantity
      };
      
      return newCart;
    });
  };

  // Limpar carrinho
  const clearCart = () => {
    setCart([]);
  };

  // Processar pagamento
  const processPayment = () => {
    console.log("Processando pagamento:", {
      items: cart,
      total: cartTotal,
      paymentMethod,
      cashReceived: parseFloat(cashReceived),
      change
    });

    // Aqui chamaria a API para registrar a venda

    // Exibir recibo
    setIsPaymentOpen(false);
    setIsReceiptOpen(true);
  };

  // Verificar se pode finalizar a compra
  const canFinishSale = cart.length > 0;
  
  // Verificar se pode processar pagamento com base no método selecionado
  const canProcessPayment = () => {
    if (paymentMethod === 'cash') {
      return parseFloat(cashReceived) >= cartTotal;
    }
    return true; // Outros métodos não têm validações adicionais
  };

  // Função para lidar com a leitura de código de barras
  const handleBarcodeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBarcode(e.target.value);
  };

  // Função para lidar com o envio do código de barras quando o usuário pressiona Enter
  const handleBarcodeKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && barcode) {
      e.preventDefault();
      // Busca o produto pelo código de barras (já é feito pelo query)
    }
  };

  // Lidar com busca de produtos
  const handleSearchProduct = (product: Product) => {
    addToCart(product);
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  // Abrir modal de código de barras externo
  const handleOpenBarcodeDialog = () => {
    setIsBarcodeDialogOpen(true);
  };

  // Processar código de barras do modal
  const handleBarcodeSubmit = (code: string) => {
    setBarcode(code);
    setIsBarcodeDialogOpen(false);
  };

  const handleCompleteTransaction = () => {
    setIsReceiptOpen(false);
    clearCart();
    setCashReceived("0");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="heading-xl text-emporio-text">PDV - Ponto de Venda</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna esquerda - Pesquisa e carrinho */}
        <div className="lg:col-span-2 space-y-6">
          {/* Busca de produtos */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Adicionar Produto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Barcode className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Digite ou escaneie o código de barras"
                      value={barcode}
                      onChange={handleBarcodeInput}
                      onKeyDown={handleBarcodeKeyPress}
                      className="pl-8 barcode-input"
                      autoFocus
                    />
                  </div>
                  <Button onClick={handleOpenBarcodeDialog} variant="outline">
                    <Barcode className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={() => setIsSearchOpen(true)}
                    variant="outline" 
                    className="w-full"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Buscar Produto
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Carrinho */}
          <Card className="h-[calc(100vh-430px)] flex flex-col">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle>Carrinho de Compras</CardTitle>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearCart}
                  disabled={cart.length === 0}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="overflow-auto flex-1">
              {cart.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead className="text-center">Qtd</TableHead>
                      <TableHead className="text-right">Preço</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cart.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {item.productName}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => updateQuantity(index, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span>{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => updateQuantity(index, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {item.unitPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => removeFromCart(index)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingCart className="h-12 w-12 mx-auto opacity-20 mb-2" />
                  <h3 className="text-lg font-medium">Carrinho Vazio</h3>
                  <p className="text-sm">Adicione produtos para iniciar a venda</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Coluna direita - resumo e finalização */}
        <Card className="h-[calc(100vh-250px)] flex flex-col">
          <CardHeader className="pb-4">
            <CardTitle>Resumo da Compra</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 flex-1">
            <div>
              <div className="flex justify-between items-center text-lg font-medium">
                <span>Itens:</span>
                <span>{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
              </div>
              <div className="flex justify-between items-center text-xl font-semibold mt-2">
                <span>Total:</span>
                <span>{cartTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
            </div>

            {/* Produtos no carrinho */}
            <div className="overflow-auto max-h-[calc(100vh-450px)] border-t border-b py-2">
              {cart.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-1">
                  <span className="text-sm truncate max-w-[200px]">
                    {item.quantity}x {item.productName}
                  </span>
                  <span className="text-sm font-medium">
                    {item.totalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
              ))}
              {cart.length === 0 && (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  Nenhum item adicionado
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <Button
              className="w-full"
              disabled={!canFinishSale}
              onClick={() => setIsPaymentOpen(true)}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Finalizar Compra
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Modal de busca de produtos */}
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Buscar Produto</DialogTitle>
            <DialogDescription>
              Pesquise pelo nome ou código de barras
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Digite o nome ou código do produto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <div className="h-64 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead className="text-right">Preço</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productsQuery.isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
                        Carregando...
                      </TableCell>
                    </TableRow>
                  ) : productsQuery.data && productsQuery.data.length > 0 ? (
                    productsQuery.data.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>{product.name}</TableCell>
                        <TableCell className="font-mono">{product.barcode}</TableCell>
                        <TableCell className="text-right">
                          {product.sellingPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </TableCell>
                        <TableCell>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleSearchProduct(product)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4">
                        Nenhum produto encontrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de código de barras */}
      <Dialog open={isBarcodeDialogOpen} onOpenChange={setIsBarcodeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leitura de Código de Barras</DialogTitle>
            <DialogDescription>
              Use o leitor para escanear o código de barras ou digite manualmente.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              type="text"
              placeholder="Digite ou escaneie o código de barras"
              className="barcode-input text-center font-mono"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && barcode) {
                  handleBarcodeSubmit(barcode);
                }
              }}
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsBarcodeDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button onClick={() => handleBarcodeSubmit(barcode)}>
                Confirmar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de pagamento */}
      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Pagamento</DialogTitle>
            <DialogDescription>
              Selecione a forma de pagamento
            </DialogDescription>
          </DialogHeader>
          <Tabs 
            defaultValue="cash" 
            value={paymentMethod}
            onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
            className="w-full"
          >
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="cash">
                <DollarSign className="h-4 w-4 mr-2" />
                Dinheiro
              </TabsTrigger>
              <TabsTrigger value="credit_card">
                <CreditCard className="h-4 w-4 mr-2" />
                Cartão
              </TabsTrigger>
              <TabsTrigger value="pix">
                <QrCode className="h-4 w-4 mr-2" />
                PIX
              </TabsTrigger>
            </TabsList>
            <TabsContent value="cash" className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span>Total:</span>
                  <span>{cartTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Valor Recebido:</label>
                  <Input 
                    type="number"
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                    min={cartTotal}
                    step="0.01"
                    className="text-right text-lg"
                  />
                </div>
                
                <div className="flex justify-between mt-4 text-lg font-semibold">
                  <span>Troco:</span>
                  <span>{change.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="credit_card" className="space-y-4 text-center py-4">
              <CreditCard className="h-16 w-16 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-lg font-medium">Pagamento com Cartão</h3>
                <p className="text-muted-foreground">
                  Insira ou aproxime o cartão na máquina
                </p>
              </div>
            </TabsContent>
            <TabsContent value="pix" className="space-y-4">
              <div className="flex justify-center py-2">
                <QRCodeImage />
              </div>
            </TabsContent>
          </Tabs>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPaymentOpen(false)}>
              Cancelar
            </Button>
            <Button 
              disabled={!canProcessPayment()}
              onClick={processPayment}
            >
              Finalizar Pagamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal do recibo */}
      <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Recibo</DialogTitle>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-auto">
            <Receipt 
              items={cart}
              total={cartTotal}
              paymentMethod={paymentMethod}
              cashReceived={parseFloat(cashReceived)}
              change={change}
            />
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={handleCompleteTransaction}
              className="gap-2"
            >
              <Check className="h-4 w-4" />
              Concluir
            </Button>
            <Button className="gap-2">
              <Printer className="h-4 w-4" />
              Imprimir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default POS;
