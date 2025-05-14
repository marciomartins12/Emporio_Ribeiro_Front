import React, { useState } from "react";
import Layout from "@/components/Layout";
import { useProducts, Product } from "@/context/ProductContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, Edit, Trash, Plus, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Products = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    barcode: "",
    name: "",
    price: "",
    stock: "",
    minStock: "",
    category: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const resetFormData = () => {
    setFormData({
      barcode: "",
      name: "",
      price: "",
      stock: "",
      minStock: "",
      category: "",
    });
  };

  const handleAddProduct = () => {
    // Validate form
    if (
      !formData.barcode ||
      !formData.name ||
      !formData.price ||
      !formData.stock ||
      !formData.minStock ||
      !formData.category
    ) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    // Check if barcode already exists
    if (products.some(p => p.barcode === formData.barcode)) {
      toast({
        title: "Código de barras já existe",
        description: "Este código de barras já está em uso.",
        variant: "destructive",
      });
      return;
    }

    // Add product
    addProduct({
      barcode: formData.barcode,
      name: formData.name,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      minStock: parseInt(formData.minStock),
      category: formData.category,
    });

    toast({
      title: "Produto adicionado",
      description: `${formData.name} adicionado com sucesso.`,
    });

    resetFormData();
    setIsAddDialogOpen(false);
  };

  const handleEditClick = (product: Product) => {
    setCurrentProduct(product);
    setFormData({
      barcode: product.barcode,
      name: product.name,
      price: product.price.toString(),
      stock: product.stock.toString(),
      minStock: product.minStock.toString(),
      category: product.category,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateProduct = () => {
    if (!currentProduct) return;

    // Validate form
    if (
      !formData.barcode ||
      !formData.name ||
      !formData.price ||
      !formData.stock ||
      !formData.minStock ||
      !formData.category
    ) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    // Check if barcode already exists (excluding current product)
    if (
      products.some(p => p.barcode === formData.barcode && p.id !== currentProduct.id)
    ) {
      toast({
        title: "Código de barras já existe",
        description: "Este código de barras já está em uso.",
        variant: "destructive",
      });
      return;
    }

    // Update product
    updateProduct({
      ...currentProduct,
      barcode: formData.barcode,
      name: formData.name,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      minStock: parseInt(formData.minStock),
      category: formData.category,
    });

    toast({
      title: "Produto atualizado",
      description: `${formData.name} atualizado com sucesso.`,
    });

    setIsEditDialogOpen(false);
  };

  const handleDeleteClick = (product: Product) => {
    setCurrentProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteProduct = () => {
    if (!currentProduct) return;

    deleteProduct(currentProduct.id);

    toast({
      title: "Produto removido",
      description: `${currentProduct.name} removido com sucesso.`,
    });

    setIsDeleteDialogOpen(false);
  };

  // Filter products based on search term
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.barcode.includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestão de Produtos</h1>
        <Button onClick={() => {
          resetFormData();
          setIsAddDialogOpen(true);
        }} className="emporio-btn-primary">
          <Plus className="mr-2 h-5 w-5" />
          Novo Produto
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="emporio-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nome</th>
                <th>Preço (R$)</th>
                <th>Estoque</th>
                <th>Categoria</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.id}>
                    <td>{product.barcode}</td>
                    <td>{product.name}</td>
                    <td>R$ {typeof product.price === 'number' ? product.price.toFixed(2) : parseFloat(String(product.price)).toFixed(2)}</td>
                    <td className="flex items-center">
                      <span className="mr-2">{product.stock}</span>
                      {product.stock <= product.minStock && (
                        <span className="emporio-badge emporio-badge-warning">
                          Baixo
                        </span>
                      )}
                    </td>
                    <td>{product.category}</td>
                    <td>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditClick(product)}
                          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(product)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    {searchTerm
                      ? "Nenhum produto encontrado com os termos da busca."
                      : "Nenhum produto cadastrado."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Adicionar Produto</DialogTitle>
            <DialogDescription>
              Preencha as informações do novo produto.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="barcode" className="text-sm font-medium">
                Código de Barras*
              </label>
              <Input
                id="barcode"
                name="barcode"
                placeholder="Digite o código de barras"
                value={formData.barcode}
                onChange={handleInputChange}
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">
                Nome do Produto*
              </label>
              <Input
                id="name"
                name="name"
                placeholder="Digite o nome do produto"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="price" className="text-sm font-medium">
                  Preço (R$)*
                </label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="category" className="text-sm font-medium">
                  Categoria*
                </label>
                <Input
                  id="category"
                  name="category"
                  placeholder="Digite a categoria"
                  value={formData.category}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="stock" className="text-sm font-medium">
                  Estoque*
                </label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.stock}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="minStock" className="text-sm font-medium">
                  Estoque Mínimo*
                </label>
                <Input
                  id="minStock"
                  name="minStock"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.minStock}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddProduct}>
              <Package className="mr-2 h-4 w-4" />
              Adicionar Produto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
            <DialogDescription>
              Atualize as informações do produto.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="barcode" className="text-sm font-medium">
                Código de Barras*
              </label>
              <Input
                id="barcode"
                name="barcode"
                placeholder="Digite o código de barras"
                value={formData.barcode}
                onChange={handleInputChange}
              />
            </div>

            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">
                Nome do Produto*
              </label>
              <Input
                id="name"
                name="name"
                placeholder="Digite o nome do produto"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="price" className="text-sm font-medium">
                  Preço (R$)*
                </label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="category" className="text-sm font-medium">
                  Categoria*
                </label>
                <Input
                  id="category"
                  name="category"
                  placeholder="Digite a categoria"
                  value={formData.category}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="stock" className="text-sm font-medium">
                  Estoque*
                </label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.stock}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid gap-2">
                <label htmlFor="minStock" className="text-sm font-medium">
                  Estoque Mínimo*
                </label>
                <Input
                  id="minStock"
                  name="minStock"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.minStock}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateProduct}>
              <Edit className="mr-2 h-4 w-4" />
              Atualizar Produto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o produto{" "}
              <span className="font-semibold">{currentProduct?.name}</span>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={handleDeleteProduct}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default Products;