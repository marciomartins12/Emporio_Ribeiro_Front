import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { productService } from "../services/productService";
import { categoryService } from "../services/categoryService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Search,
  Edit,
  Trash,
  MoreVertical,
  Barcode
} from "lucide-react";
import ProductForm from "@/components/products/ProductForm";

// Definição do tipo Product
interface Product {
  id: number;
  name: string;
  barcode?: string;
  category_id: number;
  category_name: string;
  price: number | string;
  discount_price: number | string | null;
  stock: number;
  description?: string;
  image?: string;
  featured?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Componente de formulário de produto
const ProductFormDialog = ({
  product,
  isOpen,
  onClose
}: {
  product?: Product;
  isOpen: boolean;
  onClose: () => void;
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{product ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
          <DialogDescription>
            {product
              ? 'Atualize as informações do produto'
              : 'Preencha as informações para cadastrar um novo produto'}
          </DialogDescription>
        </DialogHeader>
        <ProductForm product={product} onSubmit={onClose} />
      </DialogContent>
    </Dialog>
  );
};

// Componente de confirmação de exclusão
const DeleteConfirmation = ({
  isOpen,
  onClose,
  onConfirm,
  productName
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  productName: string;
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar exclusão</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir o produto "{productName}"? Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button variant="destructive" onClick={onConfirm}>
            Excluir
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Componente da página de Produtos
const Products = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isBarcodeDialogOpen, setIsBarcodeDialogOpen] = useState(false);
  const [barcode, setBarcode] = useState("");
  const [categories, setCategories] = useState([]);

  // Buscar categorias
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await categoryService.getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error("Erro ao buscar categorias:", error);
      }
    };
    
    fetchCategories();
  }, []);

  // Usar React Query para buscar produtos
  const productsQuery = useQuery({
    queryKey: ['products', searchQuery],
    queryFn: async () => {
      try {
        let products;
        
        if (searchQuery) {
          products = await productService.getProducts();
          
          return products.filter(p => 
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.barcode && p.barcode.includes(searchQuery))
          );
        } else {
          products = await productService.getProducts();
          
        }
        
        return products;
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
        throw error;
      }
    },
    refetchOnWindowFocus: false
  });

  const handleEditProduct = (product: Product) => {
    console.log("Editando produto:", product);
    console.log("Código de barras do produto:", product.barcode);
    setSelectedProduct(product);
    setIsFormOpen(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!productToDelete) return;
    
    try {
      // Chamar API para excluir o produto
      await fetch(`http://localhost:5000/api/products/${productToDelete.id}`, {
        method: 'DELETE'
      });
      
      // Atualizar a lista de produtos
      productsQuery.refetch();
      
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
    }
  };

  const handleBarcodeSearch = () => {
    if (barcode) {
      setSearchQuery(barcode);
      setIsBarcodeDialogOpen(false);
      setBarcode("");
    }
  };

  const handleBarcodeDialogClose = () => {
    setIsBarcodeDialogOpen(false);
    setBarcode("");
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedProduct(undefined);
    // Atualizar a lista de produtos após fechar o formulário
    productsQuery.refetch();
  };

  // Função para formatar preço com verificação de undefined/null
  const formatPrice = (price: number | string | null | undefined) => {
    if (price === undefined || price === null) {
      return "R$ 0,00";
    }
    
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return numPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="heading-xl text-emporio-text">Produtos</h1>
        <div className="flex gap-2">
          <Dialog open={isBarcodeDialogOpen} onOpenChange={setIsBarcodeDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Barcode className="h-4 w-4 mr-2" />
                Ler Código
              </Button>
            </DialogTrigger>
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
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={handleBarcodeDialogClose}>
                    Cancelar
                  </Button>
                  <Button onClick={handleBarcodeSearch}>Buscar</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          {/* Botão de Novo Produto - Corrigido */}
          <Button onClick={() => {
            setSelectedProduct(undefined); // Limpar produto selecionado
            setIsFormOpen(true); // Abrir o formulário
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Produto
          </Button>
        </div>
      </div>
      <div className="flex items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar produtos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Código de Barras</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-right">Preço Venda</TableHead>
              <TableHead className="text-right">Estoque</TableHead>
              <TableHead className="w-[80px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {productsQuery.isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : productsQuery.data && productsQuery.data.length > 0 ? (
              productsQuery.data.map((product: Product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="font-mono">
                    {product.barcode ? product.barcode : 'N/A'}
                  </TableCell>
                  <TableCell>{product.category_name}</TableCell>
                  <TableCell className="text-right">
                    {formatPrice(product.price)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={
                      product.stock <= 10 // Valor mínimo de estoque (ajuste conforme necessário)
                        ? "text-red-600 font-medium"
                        : ""
                    }>
                      {product.stock}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteProduct(product)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10">
                  Nenhum produto encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* Formulário de produto (modal) */}
      <ProductFormDialog 
        product={selectedProduct}
        isOpen={isFormOpen}
        onClose={handleFormClose}
      />
      {/* Confirmação de exclusão */}
      {productToDelete && (
        <DeleteConfirmation 
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={confirmDelete}
          productName={productToDelete.name}
        />
      )}
    </div>
  );
};

export default Products;
