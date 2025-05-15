import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { useProducts } from "@/context/ProductContext";
import { useSales } from "@/context/SaleContext";
import { toast } from "@/hooks/use-toast";
 
// Import components
import ScannerSection from "@/components/PDV/ScannerSection";
import ProductItem from "@/components/PDV/ProductItem";
import SalesSummary from "@/components/PDV/SalesSummary";
import SaleConfirmDialog from "@/components/PDV/SaleConfirmDialog";

const PDV = () => {
  const { getProductByBarcode } = useProducts();
  const { currentSale, addToCurrentSale, removeFromCurrentSale, updateQuantity, completeSale, getItemCount } = useSales();
  const [scannedBarcode, setScannedBarcode] = useState("");
  const [scannedProduct, setScannedProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (scannedBarcode) {
        try {
          // Aguardar a resolução da Promise
          const product = await getProductByBarcode(scannedBarcode);
          
          if (product) {
            setScannedProduct(product);
            setQuantity(1);
          } else {
            toast({
              title: "Produto não encontrado",
              description: `Nenhum produto com código ${scannedBarcode} encontrado.`,
              variant: "destructive",
            });
            setScannedProduct(null);
          }
        } catch (error) {
          console.error("Erro ao buscar produto:", error);
          toast({
            title: "Erro",
            description: "Erro ao buscar produto",
            variant: "destructive",
          });
          setScannedProduct(null);
        } finally {
          setScannedBarcode("");
        }
      }
    };

    fetchProduct();
  }, [scannedBarcode, getProductByBarcode]);

  const handleScan = (barcode: string) => {
    setScannedBarcode(barcode);
  };

  const handleAddToSale = () => {
    if (scannedProduct && quantity > 0) {
      if (scannedProduct.stock < quantity) {
        toast({
          title: "Estoque insuficiente",
          description: `Apenas ${scannedProduct.stock} unidades disponíveis.`,
          variant: "destructive",
        });
        return;
      }

      addToCurrentSale(scannedProduct, quantity);
      toast({
        title: "Produto adicionado",
        description: `${quantity}x ${scannedProduct.name} adicionado à venda.`,
      });
      setScannedProduct(null);
      setQuantity(1);
    }
  };

  const handleCompleteSale = () => {
    if (currentSale.length === 0) {
      toast({
        title: "Venda vazia",
        description: "Adicione produtos para finalizar a venda.",
        variant: "destructive",
      });
      return;
    }
    
    setIsDialogOpen(true);
  };

  const confirmCompleteSale = () => {
    completeSale();
    setIsDialogOpen(false);
  };

  const getTotalAmount = () => {
    return currentSale.reduce((sum, item) => sum + item.total, 0);
  };

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Barcode Entry and Product Display */}
        <div className="col-span-1 lg:col-span-2">
          <h1 className="text-2xl font-bold mb-6">Ponto de Venda</h1>
          
          <div className="grid grid-cols-1 gap-6">
            <ScannerSection onScan={handleScan} />

            {scannedProduct && (
              <ProductItem 
                product={scannedProduct}
                quantity={quantity}
                setQuantity={setQuantity}
                onAddToSale={handleAddToSale}
              />
            )}
          </div>
        </div>

        {/* Right Column: Current Sale */}
        <div className="col-span-1">
          <SalesSummary 
            currentSale={currentSale}
            itemCount={getItemCount()}
            totalAmount={getTotalAmount()}
            onUpdateQuantity={updateQuantity}
            onRemoveItem={removeFromCurrentSale}
            onCompleteSale={handleCompleteSale}
          />
        </div>
      </div>

      <SaleConfirmDialog 
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        itemCount={getItemCount()}
        totalAmount={getTotalAmount()}
        onConfirm={confirmCompleteSale}
      />
    </Layout>
  );
};

export default PDV;