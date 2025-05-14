import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Minus } from 'lucide-react';
import { Product } from '@/context/ProductContext';

interface ProductItemProps {
  product: Product;
  quantity: number;
  setQuantity: (quantity: number) => void;
  onAddToSale: () => void;
}

const ProductItem = ({
  product,
  quantity,
  setQuantity,
  onAddToSale
}: ProductItemProps) => {
  return (
    <Card className="animate-fadeIn">
      <CardHeader>
        <CardTitle>Produto Encontrado</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-2">
            <h3 className="text-xl font-semibold">{product.name}</h3>
            <p className="text-gray-500">Código: {product.barcode}</p>
            <p className="text-lg font-bold text-emporio-600 mt-2">
              R$ {product && product.price !== undefined ?
                (typeof product.price === 'number' ?
                  product.price.toFixed(2) :
                  parseFloat(String(product.price)).toFixed(2)
                ) :
                '0.00'
              }

            </p>
            <p className={`mt-1 ${product.stock <= product.minStock ? "text-amber-600" : "text-gray-600"}`}>
              Estoque disponível: {product.stock} unidades
            </p>
          </div>
          <div className="flex flex-col items-center justify-center">
            <div className="flex items-center gap-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-16 text-center"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(quantity + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <Button
              onClick={onAddToSale}
              className="emporio-btn-primary w-full"
              disabled={product.stock < quantity}
            >
              <Plus className="mr-2 h-4 w-4" />
              Adicionar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductItem;