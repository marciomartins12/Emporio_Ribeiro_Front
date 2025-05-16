import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { productService } from "@/services/productService";
import { categoryService } from "@/services/categoryService";
import { toast } from "sonner";

interface Category {
  id: number;
  name: string;
}

interface ProductFormProps {
  product?: any;
  onSubmit: () => void;
}

const ProductForm = ({ product, onSubmit }: ProductFormProps) => {
  const [formData, setFormData] = useState({
    id: 0,
    name: "",
    barcode: "",
    category_id: "",
    price: "",
    discount_price: "",
    stock: "",
    description: "",
    image: "",
    featured: false
  });
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  // Carregar categorias
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await categoryService.getCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error("Erro ao buscar categorias:", error);
        setError("Não foi possível carregar as categorias. Por favor, tente novamente.");
      }
    };
    
    fetchCategories();
  }, []);
  
  // Preencher formulário com dados do produto se estiver editando
  useEffect(() => {
    if (product) {
      console.log("ProductForm - Inicializando com produto:", product);
      console.log("ProductForm - Código de barras recebido:", product.barcode);
      
      setFormData({
        id: product.id,
        name: product.name || "",
        barcode: product.barcode || "",
        category_id: product.category_id?.toString() || "",
        price: product.price?.toString() || "",
        discount_price: product.discount_price?.toString() || "",
        stock: product.stock?.toString() || "",
        description: product.description || "",
        image: product.image || "",
        featured: product.featured || false
      });
    } else {
      // Resetar formulário se for um novo produto
      setFormData({
        id: 0,
        name: "",
        barcode: "",
        category_id: "",
        price: "",
        discount_price: "",
        stock: "",
        description: "",
        image: "",
        featured: false
      });
    }
  }, [product]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCheckboxChange = (name: string, checked: boolean) => {
    
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    
    try {
      // Validar campos obrigatórios
      if (!formData.name || !formData.category_id || !formData.price || !formData.stock) {
        throw new Error("Por favor, preencha todos os campos obrigatórios.");
      }
      
      // Preparar dados para envio
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        discount_price: formData.discount_price ? parseFloat(formData.discount_price) : null,
        stock: parseInt(formData.stock),
        category_id: parseInt(formData.category_id),
        // Garantir que o código de barras seja enviado corretamente
        barcode: formData.barcode || null
      };
      
      console.log("Dados do produto a serem enviados:", productData);
      
      if (product) {
        // Atualizar produto existente
        await productService.updateProduct(product.id, productData);
        toast.success("Produto atualizado com sucesso!");
      } else {
        // Criar novo produto
        await productService.createProduct(productData);
        toast.success("Produto criado com sucesso!");
      }
      
      // Fechar formulário e atualizar lista
      onSubmit();
    } catch (error: any) {
      console.error("Erro ao salvar produto:", error);
      setError(error.message || "Ocorreu um erro ao salvar o produto. Por favor, tente novamente.");
      toast.error("Erro ao salvar produto: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 p-4 rounded-md text-red-600 text-sm">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome do Produto *</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="barcode">Código de Barras</Label>
          <Input
            id="barcode"
            name="barcode"
            value={formData.barcode}
            onChange={handleChange}
            placeholder="Digite o código de barras"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="category">Categoria *</Label>
          <Select
            value={formData.category_id}
            onValueChange={(value) => handleSelectChange("category_id", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="price">Preço de Venda *</Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="discount_price">Preço Promocional</Label>
          <Input
            id="discount_price"
            name="discount_price"
            type="number"
            step="0.01"
            min="0"
            value={formData.discount_price}
            onChange={handleChange}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="stock">Estoque *</Label>
          <Input
            id="stock"
            name="stock"
            type="number"
            min="0"
            value={formData.stock}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="image">URL da Imagem</Label>
          <Input
            id="image"
            name="image"
            value={formData.image}
            onChange={handleChange}
          />
        </div>
        
        <div className="flex items-center space-x-2 h-full pt-6">
          <Checkbox
            id="featured"
            checked={formData.featured}
            onCheckedChange={(checked) => 
              handleCheckboxChange("featured", checked as boolean)
            }
          />
          <Label htmlFor="featured">Produto em destaque</Label>
        </div>
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onSubmit}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : product ? "Atualizar" : "Cadastrar"}
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
