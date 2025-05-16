import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ProductForm from "./ProductForm";

interface ProductFormDialogProps {
  product?: any;
  isOpen: boolean;
  onClose: () => void;
}

const ProductFormDialog = ({ product, isOpen, onClose }: ProductFormDialogProps) => {
  // Adicionar log para depuração
  console.log("ProductFormDialog - produto recebido:", product);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {product ? `Editar Produto: ${product.name}` : "Novo Produto"}
          </DialogTitle>
        </DialogHeader>
        <ProductForm 
          product={product} 
          onSubmit={onClose} 
        />
      </DialogContent>
    </Dialog>
  );
};

export default ProductFormDialog;