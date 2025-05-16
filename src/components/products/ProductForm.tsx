
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Barcode, Save } from "lucide-react";
import { Product } from "@/types/product";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Schema de validação do formulário
const productSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  barcode: z.string().min(8, "O código de barras deve ter pelo menos 8 caracteres"),
  category: z.string().min(1, "Selecione uma categoria"),
  costPrice: z.coerce.number().positive("Preço de custo deve ser maior que zero"),
  sellingPrice: z.coerce.number().positive("Preço de venda deve ser maior que zero"),
  stock: z.coerce.number().int().nonnegative("Estoque não pode ser negativo"),
  minStock: z.coerce.number().int().nonnegative("Estoque mínimo não pode ser negativo").optional(),
  description: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

// Categorias mock (seria vindo da API)
const CATEGORIES = [
  "Alimentos",
  "Bebidas",
  "Limpeza",
  "Higiene Pessoal",
  "Padaria",
  "Açougue",
  "Hortifruti",
  "Outros"
];

interface ProductFormProps {
  product?: Product;
  onSubmit: (data: ProductFormValues) => void;
}

const ProductForm = ({ product, onSubmit }: ProductFormProps) => {
  const [isBarcodeDialogOpen, setIsBarcodeDialogOpen] = useState(false);
  const [barcode, setBarcode] = useState("");

  // Inicializar formulário com valores do produto se estiver editando
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: product ? {
      name: product.name,
      barcode: product.barcode,
      category: product.category,
      costPrice: product.costPrice,
      sellingPrice: product.sellingPrice,
      stock: product.stock,
      minStock: product.minStock,
      description: product.description || '',
    } : {
      name: '',
      barcode: '',
      category: '',
      costPrice: 0,
      sellingPrice: 0,
      stock: 0,
      minStock: 0,
      description: '',
    }
  });

  const handleFormSubmit = (data: ProductFormValues) => {
    console.log("Dados do formulário:", data);
    // Aqui chamaria a API para salvar ou atualizar o produto
    onSubmit(data);
  };

  const handleBarcodeSearch = () => {
    if (barcode) {
      form.setValue("barcode", barcode);
      setIsBarcodeDialogOpen(false);
      setBarcode("");
    }
  };

  const handleBarcodeDialogClose = () => {
    setIsBarcodeDialogOpen(false);
    setBarcode("");
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Produto</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do produto" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2">
              <FormField
                control={form.control}
                name="barcode"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Código de Barras</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input placeholder="Digite o código de barras" {...field} />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsBarcodeDialogOpen(true)}
                      >
                        <Barcode className="h-4 w-4" />
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="costPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço de Custo</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0,00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sellingPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço de Venda</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="0,00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estoque Atual</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="minStock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estoque Mínimo</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descrição do produto" rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              Salvar Produto
            </Button>
          </div>
        </form>
      </Form>

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
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleBarcodeDialogClose}>
                Cancelar
              </Button>
              <Button onClick={handleBarcodeSearch}>Confirmar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductForm;
